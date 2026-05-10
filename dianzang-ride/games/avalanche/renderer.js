/**
 * 雪崩 - 游戏渲染器
 * 雪崩从上方推进，屏幕有 3 个安全区标记
 * 快速点击安全区并保持静止（不操作）3 秒
 */
import { BaseGame } from '../base-game';
import { randInt } from '../../utils/math';
import { fillRoundRect, fillCircle, drawCenteredText, drawGradientBg } from '../../utils/canvas-helper';
const BASE_TOTAL_TIME = 10000; // 基础总限时 10 秒
const HOLD_DURATION = 3000; // 保持静止 3 秒
const ZONE_COUNT = 3;
// 难度影响安全区大小和时限
const DIFF_CONFIG = {
    1: { timeMult: 1.3, zoneRadiusMult: 1.3 }, // 简单：更大安全区+更多时间
    2: { timeMult: 1.0, zoneRadiusMult: 1.0 }, // 普通
    3: { timeMult: 0.85, zoneRadiusMult: 0.8 }, // 困难：更小安全区+更少时间
    4: { timeMult: 0.7, zoneRadiusMult: 0.65 }, // 噩梦
};
export class AvalancheGame extends BaseGame {
    constructor(canvas, w, h, dpr, cb, difficulty = 2) {
        super(canvas, w, h, dpr);
        this.safeZones = [];
        this.snowY = -50;
        this.snowSpeed = 2;
        this.phase = 'find';
        this.elapsed = 0;
        this.holdTimer = 0;
        this.inSafeZone = false;
        this.activeZone = -1;
        this.particles = [];
        this.callbacks = cb;
        const dc = DIFF_CONFIG[difficulty] || DIFF_CONFIG[2];
        this.totalTime = Math.round(BASE_TOTAL_TIME * dc.timeMult);
        this.zoneRadiusMult = dc.zoneRadiusMult;
    }
    onInit() {
        this.snowY = -50;
        this.snowSpeed = 2;
        this.phase = 'find';
        this.elapsed = 0;
        this.holdTimer = 0;
        this.inSafeZone = false;
        this.activeZone = -1;
        this.particles = [];
        // 随机生成 3 个安全区（分布在屏幕下半部分）
        this.safeZones = [];
        const margin = 60;
        const areaTop = this.height * 0.5;
        const areaBottom = this.height - margin;
        for (let i = 0; i < ZONE_COUNT; i++) {
            this.safeZones.push({
                x: margin + randInt(0, this.width - margin * 2),
                y: randInt(areaTop, areaBottom),
                radius: randInt(36, 50) * this.zoneRadiusMult,
            });
        }
        // 雪花粒子
        for (let i = 0; i < 40; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vy: 1 + Math.random() * 2,
                size: 2 + Math.random() * 4,
                alpha: 0.2 + Math.random() * 0.4,
            });
        }
        this.callbacks.onPhaseChange('find');
        this.callbacks.onTimerChange(Math.ceil(this.totalTime / 1000));
    }
    /** 外部调用：玩家点击坐标 */
    handleTouch(x, y) {
        if (this.phase === 'hold') {
            // 在 hold 阶段任何点击/移动都算失败
            this.phase = 'find';
            this.holdTimer = 0;
            this.inSafeZone = false;
            this.activeZone = -1;
            this.callbacks.onPhaseChange('find');
            return;
        }
        if (this.phase !== 'find')
            return;
        // 检查是否点击了安全区
        for (let i = 0; i < this.safeZones.length; i++) {
            const zone = this.safeZones[i];
            const dx = x - zone.x;
            const dy = y - zone.y;
            if (dx * dx + dy * dy <= zone.radius * zone.radius * 1.5) {
                this.inSafeZone = true;
                this.activeZone = i;
                this.phase = 'hold';
                this.holdTimer = 0;
                this.callbacks.onPhaseChange('hold');
                return;
            }
        }
    }
    onUpdate(dt) {
        this.elapsed += dt;
        // 雪崩推进
        this.snowY += this.snowSpeed * (dt / 16);
        // 粒子更新
        for (const p of this.particles) {
            p.y += p.vy * (dt / 16);
            if (p.y > this.height) {
                p.y = -10;
                p.x = Math.random() * this.width;
            }
        }
        // hold 阶段计时
        if (this.phase === 'hold') {
            this.holdTimer += dt;
            this.callbacks.onHoldChange(Math.max(0, Math.ceil((HOLD_DURATION - this.holdTimer) / 1000)));
            if (this.holdTimer >= HOLD_DURATION) {
                this.phase = 'done';
                this.stop();
                this.callbacks.onFinish(true);
                return;
            }
        }
        // 超时
        this.callbacks.onTimerChange(Math.max(0, Math.ceil((this.totalTime - this.elapsed) / 1000)));
        if (this.elapsed >= this.totalTime && this.phase !== 'done') {
            this.phase = 'done';
            this.stop();
            this.callbacks.onFinish(false);
        }
    }
    onRender() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        // 背景
        drawGradientBg(ctx, w, h, [
            { stop: 0, color: '#0d1929' },
            { stop: 0.4, color: '#0a1628' },
            { stop: 1, color: '#111d30' },
        ]);
        // 雪崩区域（从上方推进）
        if (this.snowY > 0) {
            const grad = ctx.createLinearGradient(0, 0, 0, this.snowY);
            grad.addColorStop(0, 'rgba(200,220,240,0.6)');
            grad.addColorStop(0.7, 'rgba(200,220,240,0.2)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, this.snowY);
        }
        // 雪花粒子
        for (const p of this.particles) {
            ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        // 安全区标记
        for (let i = 0; i < this.safeZones.length; i++) {
            const zone = this.safeZones[i];
            const isActive = this.activeZone === i && this.phase === 'hold';
            // 安全区外圈
            ctx.strokeStyle = isActive ? 'rgba(79,209,197,0.8)' : 'rgba(79,209,197,0.3)';
            ctx.lineWidth = isActive ? 3 : 2;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.stroke();
            // 安全区填充
            fillCircle(ctx, zone.x, zone.y, zone.radius, isActive ? 'rgba(79,209,197,0.2)' : 'rgba(79,209,197,0.06)');
            // hold 进度环
            if (isActive && this.phase === 'hold') {
                const progress = this.holdTimer / HOLD_DURATION;
                ctx.strokeStyle = '#4fd1c5';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(zone.x, zone.y, zone.radius + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
                ctx.stroke();
            }
            // 安全区标记
            drawCenteredText(ctx, '⛑️', zone.x, zone.y, '24px sans-serif', '#fff');
        }
        // 提示文字
        if (this.phase === 'find') {
            fillRoundRect(ctx, w / 2 - 100, h * 0.25 - 18, 200, 36, 8, 'rgba(0,0,0,0.4)');
            drawCenteredText(ctx, '点击安全区！', w / 2, h * 0.25, '15px sans-serif', '#4fd1c5');
        }
        else if (this.phase === 'hold') {
            fillRoundRect(ctx, w / 2 - 80, h * 0.25 - 18, 160, 36, 8, 'rgba(0,0,0,0.4)');
            drawCenteredText(ctx, '别动！', w / 2, h * 0.25, 'bold 16px sans-serif', '#f6ad55');
        }
    }
}
