/**
 * 能量冲刺游戏渲染器
 * 快速连点蓄能，达到 60% 后稳态 3 秒
 */
import { BaseGame } from '../base-game';

interface EnergySprintCallbacks {
  onEnergyChange: (pct: number) => void;
  onPhaseChange: (phase: string, timer: number) => void;
  onFinish: (won: boolean) => void;
}

type Phase = 'charge' | 'stable' | 'success' | 'fail';

export class EnergySprintGame extends BaseGame {
  private callbacks: EnergySprintCallbacks;
  private energy = 0;
  private charging = false;
  private chargeSpeed = 0.4;  // 每秒充能速度
  private targetEnergy = 60;  // 目标能量
  private stableTime = 3000;  // 稳态需要保持的时间
  private stableTimer = 0;
  private phase: Phase = 'charge';
  private particles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
  private colors = {
    bg: '#0f0f23',
    meterBg: '#1a1a3a',
    meterFill: '#00ff88',
    meterCharge: '#ff6b35',
    meterStable: '#ffd700',
    text: '#ffffff',
    particle: '#ffd700',
  };

  constructor(canvas: any, width: number, height: number, dpr: number, callbacks: EnergySprintCallbacks) {
    super(canvas, width, height, dpr);
    this.callbacks = callbacks;
  }

  onInit() {
    this.energy = 0;
    this.charging = false;
    this.stableTimer = 0;
    this.phase = 'charge';
    this.particles = [];
  }

  onUpdate(dt: number) {
    if (this.phase === 'success' || this.phase === 'fail') return;

    // 充能逻辑
    if (this.charging && this.phase === 'charge') {
      this.energy = Math.min(100, this.energy + this.chargeSpeed * dt * 0.1);

      // 生成充能粒子
      if (Math.random() < 0.3) {
        this.particles.push({
          x: this.width / 2 + (Math.random() - 0.5) * 100,
          y: this.height - 150,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3 - 2,
          life: 1,
        });
      }

      // 达到目标能量
      if (this.energy >= this.targetEnergy) {
        this.phase = 'stable';
        this.energy = this.targetEnergy;
        this.callbacks.onPhaseChange('stable', 3);
      }
    } else if (this.phase === 'stable') {
      // 稳态保持
      if (this.charging) {
        this.energy = Math.min(100, this.energy + 0.2 * dt * 0.1);
      } else {
        this.energy -= 0.5 * dt * 0.1;
        if (this.energy < this.targetEnergy - 10) {
          // 能量不足，失败
          this.phase = 'fail';
          this.callbacks.onFinish(false);
          this.stop();
          return;
        }
      }

      this.stableTimer += dt;
      const remaining = Math.ceil((this.stableTime - this.stableTimer) / 1000);
      this.callbacks.onPhaseChange('stable', Math.max(0, remaining));

      if (this.stableTimer >= this.stableTime) {
        this.phase = 'success';
        this.callbacks.onFinish(true);
        this.stop();
      }
    }

    // 更新粒子
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });

    this.callbacks.onEnergyChange(this.energy);
  }

  onRender() {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const barWidth = 60;
    const barHeight = 300;
    const barX = centerX - barWidth / 2;
    const barY = 100;

    // 背景
    ctx.fillStyle = this.colors.bg;
    ctx.fillRect(0, 0, this.width, this.height);

    // 绘制充能条背景
    ctx.fillStyle = this.colors.meterBg;
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 绘制充能条填充
    const fillHeight = (this.energy / 100) * barHeight;
    const fillColor = this.phase === 'stable'
      ? (this.charging ? this.colors.meterStable : '#ff6b6b')
      : this.colors.meterCharge;
    ctx.fillStyle = fillColor;
    ctx.fillRect(barX, barY + barHeight - fillHeight, barWidth, fillHeight);

    // 绘制目标线
    const targetY = barY + barHeight - (this.targetEnergy / 100) * barHeight;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(barX - 10, targetY);
    ctx.lineTo(barX + barWidth + 10, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // 绘制粒子
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${p.life})`;
      ctx.fill();
    }

    // 骑行小人
    ctx.font = '50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚴', centerX, barY + barHeight + 60);

    // 能量百分比
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = this.colors.text;
    ctx.fillText(`${Math.floor(this.energy)}%`, centerX, barY + barHeight + 120);

    // 阶段提示
    ctx.font = '20px sans-serif';
    let hint = '';
    if (this.phase === 'charge') {
      hint = '快速点击充能！';
    } else if (this.phase === 'stable') {
      hint = '保持能量 ≥ 60%！';
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(hint, centerX, 70);
  }

  handlePress(pressing: boolean) {
    this.charging = pressing;
  }
}
