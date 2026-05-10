/**
 * 爆胎修补 - 游戏渲染器
 * 显示轮胎画面，有 3 个扎胎点（随机位置）
 * 限时 10 秒点击找出并修补所有扎胎点
 */
import { BaseGame } from '../base-game';
import { fillCircle, drawCenteredText, fillRoundRect, drawGradientBg } from '../../utils/canvas-helper';
// 基础参数
const BASE_PUNCTURE_COUNT = 3;
const BASE_TIME_LIMIT = 10000;
const FIX_ANIM_DURATION = 400;
const HIT_RADIUS = 35;
// 难度配置
const DIFF_CONFIG = {
    1: { punctureCount: 3, timeMult: 1.3 }, // 简单：3钉，13秒
    2: { punctureCount: 3, timeMult: 1.0 }, // 普通：3钉，10秒
    3: { punctureCount: 4, timeMult: 0.85 }, // 困难：4钉，8.5秒
    4: { punctureCount: 5, timeMult: 0.7 }, // 噩梦：5钉，7秒
};
export class TireFixGame extends BaseGame {
    constructor(canvas, w, h, dpr, cb, difficulty = 2) {
        super(canvas, w, h, dpr);
        this.punctures = [];
        this.elapsed = 0;
        this.fixedCount = 0;
        this.tireCenter = { x: 0, y: 0 };
        this.tireRadius = 0;
        this.sparkles = [];
        this.callbacks = cb;
        const dc = DIFF_CONFIG[difficulty] || DIFF_CONFIG[2];
        this.punctureCount = dc.punctureCount;
        this.timeLimit = Math.round(BASE_TIME_LIMIT * dc.timeMult);
    }
    onInit() {
        this.elapsed = 0;
        this.fixedCount = 0;
        this.sparkles = [];
        // 轮胎位置与大小
        this.tireCenter = { x: this.width / 2, y: this.height * 0.48 };
        this.tireRadius = Math.min(this.width, this.height) * 0.3;
        // 随机生成扎胎点（分布在轮胎边缘附近）
        this.punctures = [];
        for (let i = 0; i < this.punctureCount; i++) {
            const angle = (Math.PI * 2 / this.punctureCount) * i + (Math.random() - 0.5) * 0.8;
            const dist = this.tireRadius * (0.55 + Math.random() * 0.35);
            this.punctures.push({
                x: this.tireCenter.x + Math.cos(angle) * dist,
                y: this.tireCenter.y + Math.sin(angle) * dist,
                fixed: false,
                fixAnim: 0,
            });
        }
        this.callbacks.onFixedChange(0, this.punctureCount);
        this.callbacks.onTimerChange(Math.ceil(this.timeLimit / 1000));
    }
    /** 外部调用：玩家点击 */
    handleTouch(x, y) {
        for (const p of this.punctures) {
            if (p.fixed)
                continue;
            const dx = x - p.x;
            const dy = y - p.y;
            if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) {
                p.fixed = true;
                p.fixAnim = 0.01; // 开始动画
                this.fixedCount++;
                // 修补火花
                for (let i = 0; i < 6; i++) {
                    const a = Math.random() * Math.PI * 2;
                    this.sparkles.push({
                        x: p.x,
                        y: p.y,
                        life: 1,
                        vx: Math.cos(a) * (2 + Math.random() * 2),
                        vy: Math.sin(a) * (2 + Math.random() * 2),
                    });
                }
                this.callbacks.onFixedChange(this.fixedCount, this.punctureCount);
                if (this.fixedCount >= this.punctureCount) {
                    setTimeout(() => {
                        this.stop();
                        this.callbacks.onFinish(true);
                    }, 500);
                }
                return;
            }
        }
    }
    onUpdate(dt) {
        this.elapsed += dt;
        // 修补动画
        for (const p of this.punctures) {
            if (p.fixed && p.fixAnim < 1) {
                p.fixAnim = Math.min(1, p.fixAnim + dt / FIX_ANIM_DURATION);
            }
        }
        // 火花更新
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            const s = this.sparkles[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= dt / 400;
            if (s.life <= 0)
                this.sparkles.splice(i, 1);
        }
        // 计时器
        this.callbacks.onTimerChange(Math.max(0, Math.ceil((this.timeLimit - this.elapsed) / 1000)));
        // 超时
        if (this.elapsed >= this.timeLimit && this.fixedCount < this.punctureCount) {
            this.stop();
            this.callbacks.onFinish(false);
        }
    }
    onRender() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const { x: cx, y: cy } = this.tireCenter;
        const r = this.tireRadius;
        // 背景
        drawGradientBg(ctx, w, h, [
            { stop: 0, color: '#0a1628' },
            { stop: 1, color: '#0d1a2e' },
        ]);
        // 轮胎外圈
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = r * 0.22;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        // 轮胎胎面纹理
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
            const x1 = cx + Math.cos(a) * (r - r * 0.12);
            const y1 = cy + Math.sin(a) * (r - r * 0.12);
            const x2 = cx + Math.cos(a) * (r + r * 0.12);
            const y2 = cy + Math.sin(a) * (r + r * 0.12);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        // 轮毂
        fillCircle(ctx, cx, cy, r * 0.35, '#1a202c');
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        // 辐条
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 1.5;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8);
            ctx.lineTo(cx + Math.cos(a) * r * 0.33, cy + Math.sin(a) * r * 0.33);
            ctx.stroke();
        }
        // 中心螺帽
        fillCircle(ctx, cx, cy, 6, '#4a5568');
        // 扎胎点
        for (const p of this.punctures) {
            if (p.fixed) {
                // 修补后：绿色补丁
                const scale = p.fixAnim;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.scale(scale, scale);
                fillCircle(ctx, 0, 0, 14, 'rgba(104,211,145,0.8)');
                drawCenteredText(ctx, '✓', 0, 1, 'bold 14px sans-serif', '#fff');
                ctx.restore();
            }
            else {
                // 未修补：闪烁红色漏气标记
                const blink = Math.sin(this.elapsed / 200) * 0.3 + 0.7;
                fillCircle(ctx, p.x, p.y, 14, `rgba(252,129,129,${blink})`);
                // 漏气线
                ctx.strokeStyle = `rgba(252,129,129,${blink * 0.5})`;
                ctx.lineWidth = 1.5;
                for (let i = 0; i < 3; i++) {
                    const offset = (this.elapsed / 100 + i * 8) % 24;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y - 14);
                    ctx.lineTo(p.x + (i - 1) * 6, p.y - 14 - offset);
                    ctx.stroke();
                }
            }
        }
        // 火花特效
        for (const s of this.sparkles) {
            fillCircle(ctx, s.x, s.y, 2 + s.life * 2, `rgba(79,209,197,${s.life})`);
        }
        // 底部提示
        fillRoundRect(ctx, w / 2 - 100, h * 0.82, 200, 36, 8, 'rgba(0,0,0,0.3)');
        drawCenteredText(ctx, '点击红色漏气点修补', w / 2, h * 0.82 + 18, '13px sans-serif', '#718096');
    }
}
