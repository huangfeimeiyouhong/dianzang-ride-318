/**
 * 踏频节奏游戏渲染器
 * 跟随节拍圈踩点，Combo 越高奖励越多
 */
const { BaseGame } = require('../base-game');

class RhythmTapGame extends BaseGame {
  constructor(canvas, width, height, dpr, callbacks) {
    super(canvas, width, height, dpr);
    this.callbacks = callbacks;
    this.bikeX = width / 2;
    this.beats = [];
    this.combo = 0;
    this.maxCombo = 0;
    this.score = 0;
    this.beatInterval = 800;
    this.lastBeatTime = 0;
    this.gameTime = 0;
    this.targetScore = 100;
    this.targetBeats = 15;
    this.hitCount = 0;
    this.bpm = 90;
    this.perfectRange = 0.15;
    this.goodRange = 0.25;
    this.colors = {
      bg: '#1a1a2e',
      track: '#16213e',
      beat: '#e94560',
      beatPerfect: '#ffd700',
      beatGood: '#4ecdc4',
      bike: '#f8f8f2',
      center: '#0f3460',
      combo: '#ffd700',
      text: '#ffffff',
    };
  }

  onInit() {
    this.beats = [];
    this.combo = 0;
    this.maxCombo = 0;
    this.score = 0;
    this.hitCount = 0;
    this.lastBeatTime = 0;
    this.gameTime = 0;
  }

  onUpdate(dt) {
    this.gameTime += dt;
    const beatMs = 60000 / this.bpm;

    if (this.gameTime - this.lastBeatTime > beatMs) {
      this.lastBeatTime = this.gameTime;
      const angle = Math.random() * Math.PI * 2;
      this.beats.push({
        angle,
        radius: 20,
        hit: false,
        missed: false,
      });
    }

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;

    for (const beat of this.beats) {
      if (!beat.hit && !beat.missed) {
        beat.radius += dt * 0.08;
        if (beat.radius > maxRadius) {
          beat.missed = true;
          this.combo = 0;
          this.callbacks.onComboChange(this.combo);
        }
      }
    }

    this.beats = this.beats.filter(b => {
      if (b.hit) return b.radius > 0;
      if (b.missed) return b.radius < maxRadius + 50;
      return true;
    });

    if (this.hitCount >= this.targetBeats) {
      this.callbacks.onFinish(true);
      this.stop();
    }
  }

  onRender() {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;

    ctx.fillStyle = this.colors.bg;
    ctx.fillRect(0, 0, this.width, this.height);

    for (let r = 60; r <= maxRadius; r += 40) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = this.colors.track;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.center;
    ctx.fill();
    ctx.strokeStyle = this.colors.beatPerfect;
    ctx.lineWidth = 3;
    ctx.stroke();

    for (const beat of this.beats) {
      if (beat.hit) continue;
      const x = centerX + Math.cos(beat.angle) * beat.radius;
      const y = centerY + Math.sin(beat.angle) * beat.radius;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      if (beat.missed) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
      } else {
        const progress = beat.radius / maxRadius;
        if (progress > 0.85) ctx.fillStyle = this.colors.beatPerfect;
        else if (progress > 0.7) ctx.fillStyle = this.colors.beatGood;
        else ctx.fillStyle = this.colors.beat;
      }
      ctx.fill();
    }

    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚴', centerX, centerY);

    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Combo: ${this.combo}`, 60, 40);
    ctx.fillText(`击中: ${this.hitCount}/${this.targetBeats}`, this.width - 80, 40);

    const progress = Math.min(this.hitCount / this.targetBeats, 1);
    const barWidth = this.width - 40;
    const barHeight = 12;
    const barX = 20;
    const barY = 70;

    ctx.fillStyle = this.colors.track;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = this.colors.beatPerfect;
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('跟随节拍点击屏幕！', centerX, this.height - 40);
  }

  handleTap() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;

    let nearestBeat = null;
    let nearestDist = Infinity;

    for (const beat of this.beats) {
      if (beat.hit || beat.missed) continue;
      if (beat.radius < 25 || beat.radius > maxRadius) continue;
      const dist = Math.abs(beat.radius - maxRadius + 35);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestBeat = beat;
      }
    }

    if (nearestBeat) {
      nearestBeat.hit = true;
      this.combo++;
      this.hitCount++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.callbacks.onComboChange(this.combo);
      this.callbacks.onProgressChange(this.hitCount / this.targetBeats);
    } else {
      this.combo = 0;
      this.callbacks.onComboChange(this.combo);
    }
  }
}

module.exports = { RhythmTapGame };
