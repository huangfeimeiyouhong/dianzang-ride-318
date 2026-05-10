/**
 * 落石躲避关卡页面
 * 3 条车道，左右滑动切换，石头从上方掉落
 */
import { RockDodgeGame } from './renderer';
import { showRewardedVideo } from '../../services/ad-service';
import { loadLocal, saveLocal } from '../../utils/storage';

let game: RockDodgeGame | null = null;

Page({
  data: {
    canvasW: 375,
    canvasH: 600,
    hpPct: 100,
    wave: 1,
    finished: false,
    won: false,
    showAd: false,
  },

  _touchStartX: 0,

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

        game = new RockDodgeGame(canvas, w, h, dpr, {
          onHpChange: (hp: number) => {
            this.setData({ hpPct: hp });
          },
          onWaveChange: (wave: number) => {
            this.setData({ wave });
          },
          onFinish: (won: boolean) => {
            if (won) {
              this.setData({ finished: true, won: true });
            } else {
              // 失败 → 显示广告复活弹窗
              this.setData({ showAd: true });
            }
          },
        });

        game.start();
      });
  },

  onTouchStart(e: WechatMiniprogram.TouchEvent) {
    this._touchStartX = e.touches[0].clientX;
  },

  onTouchMove(e: WechatMiniprogram.TouchEvent) {
    if (!game) return;
    const dx = e.touches[0].clientX - this._touchStartX;
    if (Math.abs(dx) > 30) {
      game.swipe(dx > 0 ? 'right' : 'left');
      this._touchStartX = e.touches[0].clientX;
    }
  },

  onAdRevive() {
    showRewardedVideo().then((watched) => {
      this.setData({ showAd: false });
      if (watched) {
        // 复活：重新开始游戏
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
      player.stats.durability = Math.max(0, player.stats.durability - 5);
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
