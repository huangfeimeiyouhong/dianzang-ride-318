/**
 * 野狗追咬 - 游戏渲染器
 * 骑手在前方骑行，野狗从后追赶，快速连续点击屏幕加速
 * 保持距离条在安全范围内，持续 15 秒
 */
import { BaseGame } from '../base-game';
import { clamp } from '../../utils/math';
import { drawCenteredText, drawGradientBg, fillRoundRect } from '../../utils/canvas-helper';

// 基础游戏时长（按难度递减）
const DURATION_BY_DIFF: Record<number, number> = {
  1: 18000,  // 简单：18秒
  2: 15000,  // 普通：15秒
  3: 12000,  // 困难：12秒
  4: 10000,  // 噩梦：10秒
};
const SAFE_DISTANCE = 100;  // 安全距离阈值（0~100）
const DOG_ACCEL = 0.08;     // 狗的追击加速度
const TAP_BOOST = 12;       // 每次点击加的距离
const DECAY = 0.04;         // 自然衰减

export interface DogChaseCallbacks {
  onDistanceChange: (pct: number) => void;
  onTimerChange: (sec: number) => void;
  onFinish: (won: boolean) => void;
}

export class DogChaseGame extends BaseGame {
  private distance = 70;      // 骑手与狗的距离（0~100）
  private elapsed = 0;
  private callbacks: DogChaseCallbacks;
  private riderY = 0;
  private dogY = 0;
  private roadOffset = 0;
  private tapEffect = 0;     // 点击特效倒计时
  private duration: number;
  private difficulty: number;

  constructor(canvas: any, w: number, h: number, dpr: number, cb: DogChaseCallbacks, difficulty: number = 2) {
    super(canvas, w, h, dpr);
    this.callbacks = cb;
    this.difficulty = difficulty;
    this.duration = DURATION_BY_DIFF[difficulty] || 15000;
  }

  onInit() {
    this.distance = 70;
    this.elapsed = 0;
    this.riderY = this.height * 0.35;
    this.dogY = this.height * 0.7;
    this.roadOffset = 0;
    this.tapEffect = 0;
    this.callbacks.onDistanceChange(this.distance);
    this.callbacks.onTimerChange(Math.ceil(this.duration / 1000));
  }

  /** 外部调用：玩家点击 */
  tap() {
    this.distance = clamp(this.distance + TAP_BOOST, 0, 100);
    this.tapEffect = 200;
    this.callbacks.onDistanceChange(this.distance);
  }

  onUpdate(dt: number) {
    this.elapsed += dt;

    // 狗追近
    const aggression = 0.5 + (this.elapsed / this.duration) * 0.8; // 越来越凶
    this.distance -= DOG_ACCEL * aggression * (dt / 16);

    // 自然衰减
    this.distance -= DECAY * (dt / 16);
    this.distance = clamp(this.distance, 0, 100);

    // 点击特效计时
    if (this.tapEffect > 0) this.tapEffect -= dt;

    // 更新 UI
    this.callbacks.onDistanceChange(Math.round(this.distance));
    this.callbacks.onTimerChange(Math.max(0, Math.ceil((this.duration - this.elapsed) / 1000)));

    // 道路滚动
    this.roadOffset = (this.roadOffset + 3 * (dt / 16)) % 40;

    // 视觉位置：狗根据距离接近骑手
    const gapPx = (this.distance / 100) * (this.height * 0.4);
    this.dogY = this.riderY + 60 + gapPx;

    // 结束判定
    if (this.distance <= 0) {
      this.stop();
      this.callbacks.onFinish(false);
    } else if (this.elapsed >= this.duration) {
      this.stop();
      this.callbacks.onFinish(true);
    }
  }

  onRender() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 背景
    drawGradientBg(ctx, w, h, [
      { stop: 0, color: '#0a1628' },
      { stop: 1, color: '#111d30' },
    ]);

    // 道路标线
    ctx.strokeStyle = 'rgba(79,209,197,0.08)';
    ctx.lineWidth = 2;
    ctx.setLineDash([16, 24]);
    const cx = w / 2;
    for (let y = -40 + this.roadOffset; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(cx, y + 16);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 道路边线
    ctx.strokeStyle = 'rgba(79,209,197,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, 0);
    ctx.lineTo(w * 0.2, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.8, 0);
    ctx.lineTo(w * 0.8, h);
    ctx.stroke();

    // 骑手
    const riderScale = this.tapEffect > 0 ? 1.15 : 1;
    ctx.save();
    ctx.translate(cx, this.riderY);
    ctx.scale(riderScale, riderScale);
    drawCenteredText(ctx, '🚴', 0, 0, '36px sans-serif', '#fff');
    ctx.restore();

    // 点击特效：速度线
    if (this.tapEffect > 0) {
      ctx.strokeStyle = `rgba(79,209,197,${this.tapEffect / 200 * 0.5})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const lx = cx - 30 + i * 20;
        const ly = this.riderY + 30;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx, ly + 20);
        ctx.stroke();
      }
    }

    // 野狗
    drawCenteredText(ctx, '🐕', cx, this.dogY, '32px sans-serif', '#fff');

    // 距离指示器（屏幕右侧垂直条）
    const barX = w - 24;
    const barTop = h * 0.2;
    const barH = h * 0.6;
    fillRoundRect(ctx, barX - 4, barTop, 8, barH, 4, 'rgba(255,255,255,0.06)');
    const fillH = (this.distance / 100) * barH;
    const barColor = this.distance < 30 ? '#fc8181' : '#4fd1c5';
    fillRoundRect(ctx, barX - 4, barTop + barH - fillH, 8, fillH, 4, barColor);
  }
}
