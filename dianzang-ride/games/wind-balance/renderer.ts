/**
 * 横风平衡 - 游戏渲染器
 * 骑手在蜿蜒山路上骑行，需要点击屏幕左/右半边修正平衡
 * 保持平衡条在安全区内持续 10 秒即胜利
 */
import { BaseGame } from '../base-game';
import { clamp } from '../../utils/math';
import { fillRoundRect, drawCenteredText, drawGradientBg, fillCircle } from '../../utils/canvas-helper';

export interface WindBalanceCallbacks {
  onBalanceChange: (balance: number) => void;
  onTimerChange: (sec: number) => void;
  onWindChange: (direction: string, strength: number) => void;
  onFinish: (won: boolean) => void;
}

// 难度配置
const DIFF_CONFIG: Record<number, { holdDuration: number; windStrength: number; gustChance: number }> = {
  1: { holdDuration: 12000, windStrength: 0.6, gustChance: 0.003 },  // 简单
  2: { holdDuration: 10000, windStrength: 0.8, gustChance: 0.005 },  // 普通
  3: { holdDuration: 10000, windStrength: 1.0, gustChance: 0.008 },  // 困难
  4: { holdDuration: 10000, windStrength: 1.3, gustChance: 0.012 },  // 噩梦
};

const BALANCE_MAX = 100;     // 平衡条总量程
const SAFE_ZONE_MIN = 20;    // 安全区下界
const SAFE_ZONE_MAX = 80;    // 安全区上界
const TILT_SPEED = 0.8;      // 点击修正速度
const NATURAL_DECAY = 0.15;  // 自然倾斜衰减

export class WindBalanceGame extends BaseGame {
  private balance = 50;          // 平衡条位置 0-100，50=正中
  private windForce = 0;         // 当前风力 -1 到 1
  private windDirection = '';     // 风向描述
  private holdTimer = 0;         // 在安全区内累计时间
  private gustTimer = 0;         // 阵风倒计时
  private gustActive = false;
  private callbacks: WindBalanceCallbacks;
  private holdDuration: number;
  private windStrength: number;
  private gustChance: number;
  private roadOffset = 0;
  private gameOver = false;
  private particles: { x: number; y: number; vx: number; life: number }[] = [];

  constructor(canvas: any, w: number, h: number, dpr: number, cb: WindBalanceCallbacks, difficulty: number = 2) {
    super(canvas, w, h, dpr);
    this.callbacks = cb;
    const dc = DIFF_CONFIG[difficulty] || DIFF_CONFIG[2];
    this.holdDuration = dc.holdDuration;
    this.windStrength = dc.windStrength;
    this.gustChance = dc.gustChance;
  }

  onInit() {
    this.balance = 50;
    this.windForce = 0;
    this.holdTimer = 0;
    this.gustTimer = 0;
    this.gustActive = false;
    this.gameOver = false;
    this.particles = [];
    this._changeWind();
    this.callbacks.onBalanceChange(50);
    this.callbacks.onTimerChange(Math.ceil(this.holdDuration / 1000));
  }

  /** 切换风向 */
  private _changeWind() {
    const dirs = ['left', 'right'];
    const dir = dirs[Math.floor(Math.random() * 2)];
    this.windDirection = dir;
    this.windForce = (Math.random() * 0.5 + 0.3) * this.windStrength * (dir === 'left' ? -1 : 1);

    const strengthLabel = Math.abs(this.windForce) > 0.8 ? '强风' : Math.abs(this.windForce) > 0.4 ? '中风' : '微风';
    const dirLabel = dir === 'left' ? '←' : '→';
    this.callbacks.onWindChange(`${dirLabel} ${strengthLabel}`, Math.abs(this.windForce));
  }

  /** 玩家点击：点击左半边向左修正，右半边向右修正 */
  handleTouch(x: number) {
    if (this.gameOver) return;

    const halfW = this.width / 2;
    if (x < halfW) {
      // 点击左半边 → 向左修正（抵消向右的风）
      this.balance -= TILT_SPEED * 3;
    } else {
      // 点击右半边 → 向右修正（抵消向左的风）
      this.balance += TILT_SPEED * 3;
    }

    this.balance = clamp(this.balance, 0, BALANCE_MAX);

    // 点击修正粒子
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x,
        y: this.height * 0.3,
        vx: (x < halfW ? -1 : 1) * (1 + Math.random() * 2),
        life: 1,
      });
    }
  }

  onUpdate(dt: number) {
    if (this.gameOver) return;

    // 风力推动平衡条偏移
    this.balance += this.windForce * (dt / 16);

    // 自然倾斜（模拟重力/不稳定）
    const drift = (this.balance - 50) / 50 * NATURAL_DECAY;
    this.balance += drift * (dt / 16);

    this.balance = clamp(this.balance, 0, BALANCE_MAX);
    this.callbacks.onBalanceChange(Math.round(this.balance));

    // 道路滚动
    this.roadOffset = (this.roadOffset + 2 * (dt / 16)) % 40;

    // 阵风机制：随机突然加强风力
    if (!this.gustActive && Math.random() < this.gustChance * (dt / 16)) {
      this.gustActive = true;
      this.gustTimer = 800 + Math.random() * 600;
      this.windForce *= 2.5;
    }
    if (this.gustActive) {
      this.gustTimer -= dt;
      if (this.gustTimer <= 0) {
        this.gustActive = false;
        this._changeWind(); // 换风向
      }
    }

    // 风向周期性变化
    if (!this.gustActive && Math.random() < 0.001 * (dt / 16)) {
      this._changeWind();
    }

    // 检查是否在安全区内
    const inSafe = this.balance >= SAFE_ZONE_MIN && this.balance <= SAFE_ZONE_MAX;
    if (inSafe) {
      this.holdTimer += dt;
      this.callbacks.onTimerChange(Math.max(0, Math.ceil((this.holdDuration - this.holdTimer) / 1000)));

      if (this.holdTimer >= this.holdDuration) {
        this.gameOver = true;
        this.callbacks.onFinish(true);
        return;
      }
    } else {
      // 离开安全区，进度缓慢流失（不重置，避免过于惩罚）
      this.holdTimer = Math.max(0, this.holdTimer - dt * 0.3);
      this.callbacks.onTimerChange(Math.max(0, Math.ceil((this.holdDuration - this.holdTimer) / 1000)));
    }

    // 失败：平衡条到达边缘
    if (this.balance <= 2 || this.balance >= BALANCE_MAX - 2) {
      this.gameOver = true;
      this.callbacks.onFinish(false);
      return;
    }

    // 粒子更新
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.life -= dt / 300;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  onRender() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 背景：天空渐变
    drawGradientBg(ctx, w, h, [
      { stop: 0, color: '#0d1929' },
      { stop: 0.5, color: '#0a1628' },
      { stop: 1, color: '#111d30' },
    ]);

    // 风效果线
    const windAlpha = Math.abs(this.windForce) * 0.3;
    ctx.strokeStyle = `rgba(200,220,255,${windAlpha})`;
    ctx.lineWidth = 1;
    const windDir = this.windForce > 0 ? 1 : -1;
    for (let i = 0; i < 8; i++) {
      const y = (this.roadOffset * 2 + i * (h / 8)) % h;
      const x1 = windDir > 0 ? Math.random() * w * 0.3 : w - Math.random() * w * 0.3;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x1 + windDir * (20 + Math.abs(this.windForce) * 30), y + 2);
      ctx.stroke();
    }

    // 道路
    const roadW = w * 0.6;
    const roadX = (w - roadW) / 2;
    ctx.fillStyle = 'rgba(30,40,55,0.5)';
    ctx.fillRect(roadX, 0, roadW, h);

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

    // 骑手（带倾斜角度）
    const tiltAngle = (this.balance - 50) / 50 * 15; // 最大 ±15 度
    ctx.save();
    ctx.translate(cx, h * 0.35);
    ctx.rotate(tiltAngle * Math.PI / 180);
    drawCenteredText(ctx, '🚴', 0, 0, '36px sans-serif', '#fff');
    ctx.restore();

    // 风向箭头指示
    const arrowY = h * 0.15;
    if (this.gustActive) {
      drawCenteredText(ctx, '💨💨💨', cx, arrowY, '24px sans-serif', '#fff');
    } else {
      const arrow = this.windForce > 0 ? '💨→' : '←💨';
      drawCenteredText(ctx, arrow, cx, arrowY, '20px sans-serif', 'rgba(255,255,255,0.6)');
    }

    // 平衡条（底部）
    const barY = h * 0.82;
    const barW = w * 0.8;
    const barH = 16;
    const barX = (w - barW) / 2;

    // 背景条
    fillRoundRect(ctx, barX, barY, barW, barH, 8, 'rgba(255,255,255,0.08)');

    // 安全区
    const safeX = barX + (SAFE_ZONE_MIN / BALANCE_MAX) * barW;
    const safeW = ((SAFE_ZONE_MAX - SAFE_ZONE_MIN) / BALANCE_MAX) * barW;
    fillRoundRect(ctx, safeX, barY - 2, safeW, barH + 4, 8, 'rgba(79,209,197,0.15)');

    // 当前位置指示器
    const indicatorX = barX + (this.balance / BALANCE_MAX) * barW;
    const inSafe = this.balance >= SAFE_ZONE_MIN && this.balance <= SAFE_ZONE_MAX;
    const indicatorColor = inSafe ? '#4fd1c5' : this.balance < SAFE_ZONE_MIN ? '#fc8181' : '#fc8181';
    fillCircle(ctx, indicatorX, barY + barH / 2, 10, indicatorColor);

    // 提示文字
    if (!this.gameOver) {
      const hintText = this.gustActive ? '阵风！快修正！' : '点击左右修正平衡';
      fillRoundRect(ctx, w / 2 - 120, h * 0.7, 240, 32, 8, 'rgba(0,0,0,0.3)');
      drawCenteredText(ctx, hintText, w / 2, h * 0.7 + 16, '13px sans-serif', '#718096');
    }

    // 点击粒子
    for (const p of this.particles) {
      fillCircle(ctx, p.x, p.y, 3, `rgba(79,209,197,${p.life})`);
    }
  }
}
