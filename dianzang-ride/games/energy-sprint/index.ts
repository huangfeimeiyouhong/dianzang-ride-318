/**
 * 能量冲刺关卡页面
 * 快速连点蓄能，达到 60% 后稳态 3 秒
 */
import { EnergySprintGame } from './renderer';
import { showRewardedVideo } from '../../services/ad-service';
import { loadLocal, saveLocal } from '../../utils/storage';
import { applyGameResult } from '../../services/game-reward-service';

let game: EnergySprintGame | null = null;

Page({
  data: {
    canvasW: 375,
    canvasH: 600,
    energyPct: 0,
    phase: 'charge',  // charge | stable | success | fail
    timerSec: 3,
    finished: false,
    won: false,
    showAd: false,
  },

  _touchActive: false,

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
          onEnergyChange: (pct: number) => {
            this.setData({ energyPct: pct });
          },
          onPhaseChange: (phase: string, timer: number) => {
            this.setData({ phase, timerSec: timer });
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

  onTouchStart() {
    this._touchActive = true;
    if (game) game.handlePress(true);
  },

  onTouchEnd() {
    this._touchActive = false;
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

  _applyResult(won: boolean) {
    const pages = getCurrentPages();
    const ridePage = pages.find(p => p.route.includes('riding'));
    if (ridePage) {
      (ridePage as any).onGameResult && (ridePage as any).onGameResult({
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
