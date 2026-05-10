/**
 * 能量冲刺关卡页面
 * 快速连点蓄能，达到 60% 后稳态 3 秒
 */
const { EnergySprintGame } = require('./renderer');
const { showRewardedVideo } = require('../../services/ad-service');

let game = null;

Page({
  data: {
    canvasW: 375,
    canvasH: 600,
    energyPct: 0,
    phase: 'charge',
    timerSec: 3,
    finished: false,
    won: false,
    showAd: false,
  },

  onLoad() {
    const sysInfo = wx.getWindowInfo();
    this.setData({
      canvasW: sysInfo.windowWidth,
      canvasH: sysInfo.windowHeight,
    });
  },

  onReady() {
    this._initGame();
  },

  _initGame() {
    const query = wx.createSelectorQuery();
    query.select('#game-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) return;

        const canvas = res[0].node;
        const dpr = wx.getWindowInfo().pixelRatio || 2;
        const w = this.data.canvasW;
        const h = this.data.canvasH;

        game = new EnergySprintGame(canvas, w, h, dpr, {
          onEnergyChange: (pct) => {
            this.setData({ energyPct: pct });
          },
          onPhaseChange: (phase, timer) => {
            this.setData({ phase, timerSec: timer });
          },
          onFinish: (won) => {
            if (won) {
              this.setData({ finished: true, won: true });
            } else {
              this.setData({ showAd: true });
            }
          },
        });

        game.start();
      });
  },

  onTouchStart() {
    if (game) game.handlePress(true);
  },

  onTouchEnd() {
    if (game) game.handlePress(false);
  },

  onAdRevive() {
    showRewardedVideo().then((watched) => {
      this.setData({ showAd: false });
      if (watched) {
        if (game) game.stop();
        this._initGame();
      } else {
        this._applyResult(false);
      }
    });
  },

  onAdSkip() {
    this.setData({ showAd: false });
    this._applyResult(false);
  },

  _applyResult(won) {
    const pages = wx.getCurrentPages();
    const ridePage = pages.find(p => p.route.includes('riding'));
    if (ridePage) {
      ridePage.onGameResult && ridePage.onGameResult({
        gameId: 'energy-sprint',
        won,
        eventId: 'energy-sprint',
      });
    }
    this.setData({ finished: true, won });
    wx.navigateBack();
  },

  onBack() {
    if (game) game.stop();
    this._applyResult(false);
  },

  onUnload() {
    if (game) {
      game.stop();
      game = null;
    }
  },
});
