/**
 * 能量冲刺游戏渲染器
 * 快速连点蓄能，达到 60% 后稳态 3 秒
 */
const { BaseGame } = require('../base-game');

class EnergySprintGame extends BaseGame {
  constructor(canvas, width, height, dpr, callbacks) {
    super(canvas, width, height, dpr);
    this.callbacks = callbacks;
    this.energy = 0;
    this.charging = false;
    this.chargeSpeed = 0.4;
    this.targetEnergy = 60;
    this.stableTime = 3000;
    this.stableTimer = 0;
    this.phase = 'charge';
    this.particles = [];
    this.colors = {
      bg: '#0f0f23',
      meterBg: '#1a1a3a',
      meterFill: '#00ff88',
      meterCharge: '#ff6b35',
      meterStable: '#ffd700',
      text: '#ffffff',
      particle: '#ffd700',
    };
  }

  onInit() {
    this.energy = 0;
    this.charging = false;
    this.stableTimer = 0;
    this.phase = 'charge';
    this.particles = [];
  }

  onUpdate(dt) {
    if (this.phase === 'success' || this.phase === 'fail') return;

    if (this.charging && this.phase === 'charge') {
      this.energy = Math.min(100, this.energy + this.chargeSpeed * dt * 0.1);
      if (Math.random() < 0.3) {
        this.particles.push({
          x: this.width / 2 + (Math.random() - 0.5) * 100,
          y: this.height - 150,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3 - 2,
          life: 1,
        });
      }
      if (this.energy >= this.targetEnergy) {
        this.phase = 'stable';
        this.energy = this.targetEnergy;
        this.callbacks.onPhaseChange('stable', 3);
      }
    } else if (this.phase === 'stable') {
      if (this.charging) {
        this.energy = Math.min(100, this.energy + 0.2 * dt * 0.1);
      } else {
        this.energy -= 0.5 * dt * 0.1;
        if (this.energy < this.targetEnergy - 10) {
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

    ctx.fillStyle = this.colors.bg;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = this.colors.meterBg;
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const fillHeight = (this.energy / 100) * barHeight;
    const fillColor = this.phase === 'stable'
      ? (this.charging ? this.colors.meterStable : '#ff6b6b')
      : this.colors.meterCharge;
    ctx.fillStyle = fillColor;
    ctx.fillRect(barX, barY + barHeight - fillHeight, barWidth, fillHeight);

    const targetY = barY + barHeight - (this.targetEnergy / 100) * barHeight;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(barX - 10, targetY);
    ctx.lineTo(barX + barWidth + 10, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${p.life})`;
      ctx.fill();
    }

    ctx.font = '50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚴', centerX, barY + barHeight + 60);

    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = this.colors.text;
    ctx.fillText(`${Math.floor(this.energy)}%`, centerX, barY + barHeight + 120);

    ctx.font = '20px sans-serif';
    let hint = this.phase === 'charge' ? '快速点击充能！' : '保持能量 ≥ 60%！';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(hint, centerX, 70);
  }

  handlePress(pressing) {
    this.charging = pressing;
  }
}

module.exports = { EnergySprintGame };
