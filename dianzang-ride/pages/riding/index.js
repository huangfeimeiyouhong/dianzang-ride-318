const { STATIONS, getStationPair } = require('../../models/station');
const { calculateRide, getTerrainDesc } = require('../../services/ride-service');
const { tryTriggerEvent, applyReward } = require('../../services/event-service');
const { degradeEquipment } = require('../../services/equip-service');
const { checkAchievements } = require('../../services/achievement-service');
const { updateQuestProgress } = require('../../services/quest-service');
const { collectPostcard } = require('../../services/postcard-service');
const { getSpecialEvent, isSpecialEventCompleted } = require('../../services/special-event-service');
const { selectGamesForRide } = require('../../services/game-sequence');
const { loadLocal, saveLocal } = require('../../utils/storage');

Page({
  data: {
    bikeEmoji: '🚴',
    terrainDesc: '',
    animating: false,
    displayKm: 0, riddenKm: 0, segmentKm: 0, progressPct: 0,
    fromStation: '', toStation: '',
    energyCost: 0, currentElev: 0, costMultiplier: '1.0',
    finished: false, actualKm: 0, remainEnergy: 0, reachedNext: false, newStationName: '',
    eventTriggered: false, eventName: '', eventIcon: '', eventGamePage: '',
    coinsEarned: 0,
    highAltSickness: false,
    achievementName: '',
    achievementIcon: '',
    showAchievement: false,
    hasSpecialEvent: false,
    specialEventName: '',
    specialEventIcon: '',
    specialEventId: '',
    // 新增：游戏关卡相关
    inGameSequence: false,
    gameQueue: [],
    currentGameIndex: 0,
    currentGame: null,
    gameResults: [],
    showGameSummary: false,
    totalWins: 0,
    totalCoinsEarned: 0,
  },

  _player: null,
  _rideResult: null,
  _eventResult: null,
  _animTimer: 0,

  onLoad() {
    const player = loadLocal();
    if (!player) {
      wx.navigateBack();
      return;
    }
    this._player = player;
    const { current, next } = getStationPair(player.progress.currentStation);
    const avgElev = next ? Math.floor((current.elev + next.elev) / 2) : current.elev;
    this.setData({
      bikeEmoji: this.getBikeEmoji(player.rider.bike),
      terrainDesc: getTerrainDesc(avgElev),
      currentElev: avgElev,
      displayKm: player.progress.km,
      fromStation: current.name,
      toStation: next ? next.name : '终点',
      segmentKm: next ? next.km - current.km : 0,
      riddenKm: player.progress.km - current.km,
    });
    this.startRide();
  },

  getBikeEmoji(bikeId) {
    const emojis = ['🚴', '🚴‍♂️', '🚴‍♀️'];
    return emojis[bikeId] || '🚴';
  },

  startRide() {
    const player = this._player;
    if (!player) return;
    const result = calculateRide(player);
    this._rideResult = result;
    if (result.actualKm <= 0) {
      wx.showToast({ title: '无法继续骑行', icon: 'none' });
      wx.navigateBack();
      return;
    }

    // 根据区段里程和站点难度选择小游戏组合
    const nextStation = player.progress.currentStation + 1;
    const gameQueue = selectGamesForRide(nextStation, result.actualKm);

    this.setData({
      animating: true,
      energyCost: result.energyCost,
      costMultiplier: result.costMultiplier.toFixed(1),
      gameQueue,
      inGameSequence: gameQueue.length > 0,
    });

    // 3-second animation
    const startKm = player.progress.km;
    const endKm = startKm + result.actualKm;
    const duration = 3000;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const currentKm = Math.floor(startKm + (endKm - startKm) * eased);
      const { current } = getStationPair(player.progress.currentStation);
      const riddenInSegment = currentKm - current.km;
      const segmentKm = this.data.segmentKm;
      const progressPct = segmentKm > 0 ? Math.min((riddenInSegment / segmentKm) * 100, 100) : 0;
      this.setData({ displayKm: currentKm, riddenKm: riddenInSegment, progressPct });
      if (t < 1) {
        this._animTimer = setTimeout(animate, 30);
      } else {
        this.finishRide(result);
      }
    };
    animate();
  },

  finishRide(result) {
    const player = this._player;
    if (!player) return;

    player.progress.km += result.actualKm;
    player.stats.energy = Math.max(0, player.stats.energy - result.energyCost);
    player.progress.day += 1;
    player.inventory.coins += result.coinsEarned;
    player.totalDistance = (player.totalDistance || 0) + result.actualKm;

    if (result.reachedNext) {
      player.progress.currentStation = result.newStation;
      player.stats.mood = Math.min(100, player.stats.mood + 10);
    }

    degradeEquipment(player, Math.ceil(result.actualKm / 20));

    if (result.reachedNext) {
      collectPostcard(player, result.newStation);
    }

    const eventResult = tryTriggerEvent(player);
    this._eventResult = eventResult;
    if (eventResult.triggered && eventResult.event) {
      player.progress.lastEventKm = player.progress.km;
    }

    updateQuestProgress(player, 'ride', result.actualKm);
    checkAchievements(player, { dailyKm: result.actualKm });
    saveLocal(player);

    const newStation = STATIONS[player.progress.currentStation];
    this.setData({
      animating: false, finished: true, actualKm: result.actualKm,
      remainEnergy: player.stats.energy, reachedNext: result.reachedNext,
      newStationName: result.reachedNext ? newStation.name : '',
      eventTriggered: eventResult.triggered,
      eventName: eventResult.event?.name || '',
      eventIcon: eventResult.event?.icon || '',
      eventGamePage: eventResult.event?.gamePage || '',
      coinsEarned: result.coinsEarned,
      highAltSickness: !!player.stats.highAltSickness,
    });

    if (result.reachedNext) {
      const station = STATIONS[result.newStation];
      if (station.specialEvent) {
        const spe = getSpecialEvent(result.newStation);
        if (spe && !isSpecialEventCompleted(player, spe.id)) {
          this.setData({
            hasSpecialEvent: true,
            specialEventName: spe.name,
            specialEventIcon: spe.icon,
            specialEventId: spe.id,
          });
        }
      }
    }

    // 检查是否有小游戏队列
    if (this.data.inGameSequence && this.data.gameQueue.length > 0) {
      this.runNextGame();
    }
  },

  runNextGame() {
    const { gameQueue, currentGameIndex } = this.data;
    if (currentGameIndex >= gameQueue.length) {
      this._showGameSummary();
      return;
    }

    const game = gameQueue[currentGameIndex];
    this.setData({
      currentGame: game,
      currentGameIndex: currentGameIndex + 1,
      showGameSummary: false,
    });

    wx.navigateTo({
      url: game.route,
      fail: () => {
        wx.showToast({ title: `${game.name}暂不可用`, icon: 'none' });
        this.runNextGame();
      }
    });
  },

  onGameResult(result) {
    const { gameQueue, currentGameIndex, gameResults } = this.data;
    const game = gameQueue[currentGameIndex - 1];

    const gameResult = {
      gameId: result.gameId || result.eventId,
      won: result.won,
      name: game?.name || result.gameId,
      icon: game?.icon || '🎮',
    };

    const player = loadLocal();
    if (player) {
      if (result.won) {
        player.stats.energy = Math.min(200, player.stats.energy + 10);
        player.inventory.coins += 20;
      } else {
        player.stats.energy = Math.max(0, player.stats.energy - 15);
      }
      saveLocal(player);
    }

    this.setData({
      gameResults: [...gameResults, gameResult],
      totalWins: result.won ? (this.data.totalWins + 1) : this.data.totalWins,
      totalCoinsEarned: result.won ? (this.data.totalCoinsEarned + 20) : this.data.totalCoinsEarned,
    });

    setTimeout(() => this.runNextGame(), 500);
  },

  _showGameSummary() {
    const { totalWins, totalCoinsEarned } = this.data;
    this.setData({
      showGameSummary: true,
      totalWins,
      totalCoinsEarned,
    });

    const player = loadLocal();
    if (player && totalCoinsEarned > 0) {
      player.inventory.coins += totalCoinsEarned;
      saveLocal(player);
    }
  },

  onEventTap() {
    const event = this._eventResult?.event;
    if (!event?.gamePage) return;
    wx.navigateTo({
      url: event.gamePage,
      fail: () => {
        if (this._player && event) {
          applyReward(this._player, event);
          saveLocal(this._player);
        }
        wx.showToast({ title: '事件完成！', icon: 'success' });
      }
    });
  },

  onDismissAchievement() {
    this.setData({ showAchievement: false });
  },

  onSpecialEventTap() {
    if (!this.data.specialEventId) return;
    wx.navigateTo({ url: `/pages/special-event/index?id=${this.data.specialEventId}` });
  },

  onStartGames() {
    this.runNextGame();
  },

  onSkipGames() {
    this._showGameSummary();
  },

  onBackToMap() { wx.navigateBack(); },

  onUnload() {
    if (this._animTimer) { clearTimeout(this._animTimer); }
    if (this._player) {
      saveLocal(this._player);
      getApp().globalData.player = this._player;
    }
  },
});
