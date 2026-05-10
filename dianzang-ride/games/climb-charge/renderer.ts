/**
 * 爬坡挑战游戏渲染器
 * 按住蓄力，≥80% 才能冲上坡
 */
import { BaseGame } from '../base-game';

interface ClimbChargeCallbacks {
  onChargeChange: (pct: number) => void;
  onPhaseChange: (phase: string) => void;
  onFinish: (won: boolean) => void;
}

type Phase = 'charge' | 'release' | 'climbing' | 'success' | 'fail';

export class ClimbChargeGame extends BaseGame {
  private callbacks: ClimbChargeCallbacks;
  private charge = 0;
  private charging = false;
  private chargeSpeed = 0.5;
  private targetCharge = 80;
  private phase: Phase = 'charge';
  private bikeY = 0;
  private climbProgress = 0;
  private time = 0;
  private colors = {
    bg: '#2c3e50',
    mountain: '#7f8c8d',
    snow: '#ecf0f1',
    grass: '#27ae60',
    sky: '#3498db',
    charge: '#e74c3c',
    chargeGood: '#f39c12',
    chargeFull: '#27ae60',
    bike: '#f8f8f2',
    success: '#ffd700',
  };

  constructor(canvas: any, width: number, height: number, dpr: number, callbacks: ClimbChargeCallbacks) {
    super(canvas, width, height, dpr);
    this.callbacks = callbacks;
    this.bikeY = height - 100;
  }

  onInit() {
    this.charge = 0;
    this.charging = false;
    this.phase = 'charge';
    this.bikeY = this.height - 100;
    this.climbProgress = 0;
  }

  onUpdate(dt: number) {
    this.time += dt;

    if (this.phase === 'charge') {
      // 充能阶段
      if (this.charging) {
        this.charge = Math.min(100, this.charge + this.chargeSpeed * dt * 0.1);
      }
      this.callbacks.onChargeChange(this.charge);
    } else if (this.phase === 'climbing') {
      // 爬坡阶段
      if (this.charge >= this.targetCharge) {
        this.climbProgress += dt * 0.05;
        this.bikeY = (this.height - 100) - this.climbProgress * (this.height - 200);

        if (this.climbProgress >= 1) {
          this.phase = 'success';
          this.callbacks.onFinish(true);
          this.stop();
        }
      } else {
        // 力量不足，滑落
        this.climbProgress -= dt * 0.02;
        this.bikeY = (this.height - 100) - this.climbProgress * (this.height - 200);

        if (this.climbProgress <= -0.3) {
          this.phase = 'fail';
          this.callbacks.onFinish(false);
          this.stop();
        }
      }
    }
  }

  onRender() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 天空渐变
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#1a1a2e');
    skyGrad.addColorStop(0.5, this.colors.sky);
    skyGrad.addColorStop(1, this.colors.grass);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 绘制山坡
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h - 150);
    ctx.quadraticCurveTo(w * 0.3, h - 250, w * 0.5, h - 350);
    ctx.quadraticCurveTo(w * 0.7, h - 450, w, h - 300);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = this.colors.mountain;
    ctx.fill();

    // 山顶积雪
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h - 250);
    ctx.quadraticCurveTo(w * 0.5, h - 350, w * 0.7, h - 450);
    ctx.lineTo(w * 0.65, h - 420);
    ctx.quadraticCurveTo(w * 0.5, h - 300, w * 0.35, h - 220);
    ctx.closePath();
    ctx.fillStyle = this.colors.snow;
    ctx.fill();

    // 目标线
    const targetY = h - 200;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(w, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 骑手位置
    const bikeX = w / 2;
    ctx.font = '50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚴', bikeX, this.bikeY);

    // 充能条
    if (this.phase === 'charge' || this.phase === 'release') {
      const barW = 200;
      const barH = 30;
      const barX = (w - barW) / 2;
      const barY = 50;

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(barX, barY, barW, barH);

      const fillW = (this.charge / 100) * barW;
      let fillColor = this.colors.charge;
      if (this.charge >= this.targetCharge) {
        fillColor = this.colors.chargeFull;
      } else if (this.charge >= 50) {
        fillColor = this.colors.chargeGood;
      }
      ctx.fillStyle = fillColor;
      ctx.fillRect(barX, barY, fillW, barH);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barW, barH);

      // 目标线
      const targetX = barX + (this.targetCharge / 100) * barW;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(targetX, barY - 5);
      ctx.lineTo(targetX, barY + barH + 5);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(this.charge)}%`, barX + barW / 2, barY + barH + 25);
      ctx.fillText(`目标: ${this.targetCharge}%`, targetX, barY - 10);
    }

    // 提示文字
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    if (this.phase === 'charge') {
      ctx.fillText(this.charging ? '🔥 蓄力中...' : '按住屏幕蓄力！', w / 2, h - 40);
    } else if (this.phase === 'climbing') {
      ctx.fillText(this.charge >= this.targetCharge ? '💪 冲啊！' : '⚠️ 力量不足！', w / 2, h - 40);
    }
  }

  startCharge() {
    this.charging = true;
    this.callbacks.onPhaseChange('charge');
  }

  release() {
    this.charging = false;
    if (this.charge >= this.targetCharge) {
      this.phase = 'climbing';
      this.callbacks.onPhaseChange('climbing');
    } else {
      // 力量不足，尝试爬但会失败
      this.phase = 'climbing';
      this.callbacks.onPhaseChange('climbing');
    }
  }
}
