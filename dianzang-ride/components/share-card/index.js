/**
 * 分享图生成组件
 * 使用 Canvas 2D 绘制包含站点、里程、海拔、天数信息的分享图
 */
import { fillRoundRect, drawCenteredText, drawGradientBg } from '../../utils/canvas-helper';
const CARD_W = 375;
const CARD_H = 500;
Component({
    properties: {
        stationName: { type: String, value: '' },
        km: { type: Number, value: 0 },
        elev: { type: Number, value: 0 },
        day: { type: Number, value: 1 },
    },
    data: {
        canvasW: CARD_W,
        canvasH: CARD_H,
    },
    observers: {
        'stationName, km, elev, day': function () {
            // 属性变化时重新绘制
            this._draw();
        },
    },
    lifetimes: {
        ready() {
            this._draw();
        },
    },
    methods: {
        _draw() {
            const query = this.createSelectorQuery();
            query.select('#share-canvas')
                .fields({ node: true, size: true })
                .exec((res) => {
                if (!res[0] || !res[0].node)
                    return;
                const canvas = res[0].node;
                const ctx = canvas.getContext('2d');
                const dpr = wx.getWindowInfo().pixelRatio || 2;
                canvas.width = CARD_W * dpr;
                canvas.height = CARD_H * dpr;
                ctx.scale(dpr, dpr);
                this._render(ctx);
            });
        },
        _render(ctx) {
            const w = CARD_W;
            const h = CARD_H;
            const { stationName, km, elev, day } = this.data;
            // 背景渐变
            drawGradientBg(ctx, w, h, [
                { stop: 0, color: '#0a1628' },
                { stop: 0.5, color: '#12233d' },
                { stop: 1, color: '#0d1a2e' },
            ]);
            // 顶部装饰线
            ctx.fillStyle = '#4fd1c5';
            ctx.fillRect(0, 0, w, 3);
            // 标题
            drawCenteredText(ctx, '滇藏骑行', w / 2, 52, 'bold 22px sans-serif', '#4fd1c5');
            // 站点名称（大号）
            drawCenteredText(ctx, stationName || '---', w / 2, 120, 'bold 36px sans-serif', '#e2e8f0');
            // 分隔线
            ctx.strokeStyle = 'rgba(79,209,197,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(60, 160);
            ctx.lineTo(w - 60, 160);
            ctx.stroke();
            // 数据区域：三列
            const cols = [
                { label: '里程', value: `${km}km`, color: '#f6ad55' },
                { label: '海拔', value: `${elev}m`, color: '#4fd1c5' },
                { label: '天数', value: `D${day}`, color: '#fc8181' },
            ];
            const colW = (w - 80) / 3;
            cols.forEach((col, i) => {
                const cx = 40 + colW * i + colW / 2;
                drawCenteredText(ctx, col.value, cx, 210, 'bold 26px sans-serif', col.color);
                drawCenteredText(ctx, col.label, cx, 240, '14px sans-serif', '#718096');
            });
            // 进度条背景
            const barX = 40;
            const barY = 280;
            const barW = w - 80;
            const barH = 12;
            fillRoundRect(ctx, barX, barY, barW, barH, 6, 'rgba(255,255,255,0.08)');
            // 进度条填充（全程 2100km）
            const progress = Math.min(km / 2100, 1);
            const fillW = Math.max(barH, barW * progress);
            fillRoundRect(ctx, barX, barY, fillW, barH, 6, '#4fd1c5');
            // 进度文字
            drawCenteredText(ctx, `${(progress * 100).toFixed(1)}% 完成`, w / 2, barY + barH + 24, '13px sans-serif', '#718096');
            // 路线描述
            drawCenteredText(ctx, '大理 → 拉萨  2100km', w / 2, 360, '13px sans-serif', '#718096');
            // 底部小程序码占位区域
            fillRoundRect(ctx, w / 2 - 50, 390, 100, 80, 10, 'rgba(255,255,255,0.04)');
            drawCenteredText(ctx, '扫码加入', w / 2, 440, '11px sans-serif', '#4a5568');
        },
        /** 导出分享图临时路径 */
        exportImage() {
            return new Promise((resolve, reject) => {
                const query = this.createSelectorQuery();
                query.select('#share-canvas')
                    .fields({ node: true })
                    .exec((res) => {
                    if (!res[0] || !res[0].node) {
                        reject(new Error('Canvas not found'));
                        return;
                    }
                    const canvas = res[0].node;
                    wx.canvasToTempFilePath({
                        canvas,
                        fileType: 'png',
                        quality: 1,
                        success: (r) => resolve(r.tempFilePath),
                        fail: reject,
                    });
                });
            });
        },
    },
});
