/**
 * 野狗追咬关卡页面
 * 快速连续点击屏幕加速，保持安全距离 15 秒
 */
import { DogChaseGame } from './renderer';
import { showRewardedVideo } from '../../services/ad-service';
import { loadLocal, saveLocal } from '../../utils/storage';

let game: DogChaseGame | null = null;

Page({
  data: {
    canvasW: 375,
    canvasH: 600,
    distancePct: 70,
    remainSec: 15,
    started: false,
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

        game = new DogChaseGame(canvas, w, h, dpr, {
          onDistanceChange: (pct: number) => {
            this.setData({ distancePct: pct });
          },
          onTimerChange: (sec: number) => {
            this.setData({ remainSec: sec });
          },
          onFinish: (won: boolean) => {
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

  onTap() {
    if (!game) return;
    if (!this.data.started) this.setData({ started: true });
    game.tap();
  },

  onAdRevive() {
    showRewardedVideo().then((watched) => {
      this.setData({ showAd: false });
      if (watched) {
        if (game) game.stop();
        this._initGame();
      } else {
        this._applyPenalty();
      }
    });
  },

  onAdSkip() {
    this.setData({ showAd: false });
    this._applyPenalty();
  },

  _applyPenalty() {
    const player = loadLocal();
    if (player) {
      player.stats.energy = Math.max(0, player.stats.energy - 15);
      player.stats.mood = Math.max(0, player.stats.mood - 10);
      saveLocal(player);
    }
    this.setData({ finished: true, won: false });
  },

  onBack() {
    wx.navigateBack();
  },

  onUnload() {
    if (game) {
      game.stop();
      game = null;
    }
  },
});
