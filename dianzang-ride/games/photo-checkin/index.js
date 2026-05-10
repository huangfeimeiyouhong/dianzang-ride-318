/**
 * 风景打卡关卡页面
 * 3 秒内移动取景框对齐风景拍照
 */
const { PhotoCheckinGame } = require('./renderer');
const { showRewardedVideo } = require('../../services/ad-service');

let game = null;

Page({
  data: {
    canvasW: 375,
    canvasH: 600,
    timerSec: 3,
    aligned: false,
    finished: false,
    won: false,
    showAd: false,
    photoTaken: false,
  },

  _touchX: 0,

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

        game = new PhotoCheckinGame(canvas, w, h, dpr, {
          onTimerChange: (sec) => {
            this.setData({ timerSec: sec });
          },
          onAlignmentChange: (aligned) => {
            this.setData({ aligned });
          },
          onPhotoTaken: () => {
            this.setData({ photoTaken: true });
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

  onTouchStart(e) {
    this._touchX = e.touches[0].clientX;
  },

  onTouchMove(e) {
    if (!game || this.data.photoTaken) return;
    const dx = e.touches[0].clientX - this._touchX;
    if (Math.abs(dx) > 5) {
      game.move(dx > 0 ? 1 : -1);
      this._touchX = e.touches[0].clientX;
    }
  },

  onTap() {
    if (!game || this.data.photoTaken) return;
    game.takePhoto();
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
        gameId: 'photo-checkin',
        won,
        eventId: 'photo-checkin',
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
