/**
 * 过河渡口关卡页面
 * 横向移动躲避木桩和漩涡
 */
import { RiverCrossGame } from './renderer';
import { showRewardedVideo } from '../../services/ad-service';

let game: RiverCrossGame | null = null;

Page({
  data: {
    canvasW: 375,
    canvasH: 600,
    hpPct: 100,
    distance: 0,
    finished: false,
    won: false,
    showAd: false,
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

        game = new RiverCrossGame(canvas, w, h, dpr, {
          onHpChange: (hp: number) => {
            this.setData({ hpPct: hp });
          },
          onDistanceChange: (dist: number) => {
            this.setData({ distance: dist });
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

  onTouchStart(e: WechatMiniprogram.TouchEvent) {
    this._touchX = e.touches[0].clientX;
  },

  onTouchMove(e: WechatMiniprogram.TouchEvent) {
    if (!game) return;
    const dx = e.touches[0].clientX - this._touchX;
    if (Math.abs(dx) > 10) {
      game.move(dx > 0 ? 1 : -1);
      this._touchX = e.touches[0].clientX;
    }
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

  _applyResult(won: boolean) {
    const pages = getCurrentPages();
    const ridePage = pages.find(p => p.route.includes('riding'));
    if (ridePage) {
      (ridePage as any).onGameResult && (ridePage as any).onGameResult({
        gameId: 'river-cross',
        won,
        eventId: 'river-cross',
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
