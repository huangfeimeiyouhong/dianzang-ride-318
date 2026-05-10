/**
 * 雪崩关卡页面
 * 找到安全区并保持静止 3 秒
 */
import { AvalancheGame } from './renderer';
import { showRewardedVideo } from '../../services/ad-service';
import { loadLocal, saveLocal } from '../../utils/storage';
let game = null;
Page({
    data: {
        canvasW: 375,
        canvasH: 600,
        phase: 'find',
        remainSec: 10,
        holdSec: 3,
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
            if (!res[0] || !res[0].node)
                return;
            const canvas = res[0].node;
            const dpr = wx.getWindowInfo().pixelRatio || 2;
            const w = this.data.canvasW;
            const h = this.data.canvasH;
            game = new AvalancheGame(canvas, w, h, dpr, {
                onPhaseChange: (phase) => {
                    this.setData({ phase });
                },
                onTimerChange: (sec) => {
                    this.setData({ remainSec: sec });
                },
                onHoldChange: (sec) => {
                    this.setData({ holdSec: sec });
                },
                onFinish: (won) => {
                    if (won) {
                        this.setData({ finished: true, won: true });
                    }
                    else {
                        this.setData({ showAd: true });
                    }
                },
            });
            game.start();
        });
    },
    onTouch(e) {
        if (!game)
            return;
        const touch = e.touches[0];
        game.handleTouch(touch.clientX, touch.clientY);
    },
    onAdRevive() {
        showRewardedVideo().then((watched) => {
            this.setData({ showAd: false });
            if (watched) {
                if (game)
                    game.stop();
                this._initGame();
            }
            else {
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
            player.stats.energy = Math.max(0, player.stats.energy - 30);
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
