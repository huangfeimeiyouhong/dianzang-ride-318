/**
 * 横风平衡关卡页面
 * 保持平衡条在安全区内持续 10 秒
 */
import { WindBalanceGame } from './renderer';
import { showRewardedVideo } from '../../services/ad-service';
import { loadLocal, saveLocal } from '../../utils/storage';
let game = null;
Page({
    data: {
        canvasW: 375,
        canvasH: 600,
        balancePct: 50,
        balanceColor: '#4fd1c5',
        timerSec: 10,
        windInfo: '',
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
            game = new WindBalanceGame(canvas, w, h, dpr, {
                onBalanceChange: (balance) => {
                    const inSafe = balance >= 20 && balance <= 80;
                    this.setData({
                        balancePct: balance,
                        balanceColor: inSafe ? '#4fd1c5' : '#fc8181',
                    });
                },
                onTimerChange: (sec) => {
                    this.setData({ timerSec: sec });
                },
                onWindChange: (info) => {
                    this.setData({ windInfo: info });
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
    onTouchStart(e) {
        if (!game)
            return;
        const x = e.touches[0].clientX;
        game.handleTouch(x);
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
            player.stats.energy = Math.max(0, player.stats.energy - 10);
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
