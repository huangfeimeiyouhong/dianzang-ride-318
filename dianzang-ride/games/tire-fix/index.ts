/**
 * 爆胎修补关卡页面
 * 限时 10 秒找出并修补 3 个扎胎点
 */
import { TireFixGame } from './renderer';
import { showRewardedVideo } from '../../services/ad-service';
import { loadLocal, saveLocal } from '../../utils/storage';

let game: TireFixGame | null = null;

Page({
  data: {
    canvasW: 375,
    canvasH: 600,
    fixed: 0,
    total: 3,
    remainSec: 10,
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

        game = new TireFixGame(canvas, w, h, dpr, {
          onFixedChange: (fixed: number, total: number) => {
            this.setData({ fixed, total });
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

  onTouch(e: WechatMiniprogram.TouchEvent) {
    if (!game) return;
    const touch = e.touches[0];
    game.handleTouch(touch.clientX, touch.clientY);
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
      player.stats.energy = Math.max(0, player.stats.energy - 20);
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
