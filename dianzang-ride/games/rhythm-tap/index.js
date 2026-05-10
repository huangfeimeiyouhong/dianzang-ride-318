/**
 * 踏频节奏关卡页面
 * 跟随节拍圈踩点，Combo 越高奖励越多
 */
const { RhythmTapGame } = require('./renderer');
const { showRewardedVideo } = require('../../services/ad-service');
const { loadLocal, saveLocal } = require('../../utils/storage');

let game = null;

Page({
  data: {
    canvasW: 375,
    canvasH: 600,
    combo: 0,
    hitCount: 0,
    targetBeat: 15,
    progressPct: 0,
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

        game = new RhythmTapGame(canvas, w, h, dpr, {
          onComboChange: (combo) => {
            this.setData({ combo });
          },
          onProgressChange: (pct) => {
            this.setData({
              hitCount: Math.floor(pct * this.data.targetBeat),
              progressPct: pct * 100,
            });
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
    if (game) game.handleTap();
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
        gameId: 'rhythm-tap',
        won,
        eventId: 'rhythm-tap',
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
