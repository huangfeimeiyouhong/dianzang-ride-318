/**
 * 踏频节奏游戏渲染器
 * 跟随节拍圈踩点，Combo 越高奖励越多
 */
import { BaseGame } from '../base-game';

interface RhythmGameCallbacks {
  onComboChange: (combo: number) => void;
  onProgressChange: (pct: number) => void;
  onFinish: (won: boolean) => void;
}

interface Beat {
  angle: number;      // 角度位置
  radius: number;      // 距离中心的位置
  hit: boolean;       // 是否已击中
  missed: boolean;    // 是否错过
}

export class RhythmTapGame extends BaseGame {
  private callbacks: RhythmGameCallbacks;
  private bikeX: number;
  private beats: Beat[] = [];
  private combo = 0;
  private maxCombo = 0;
  private score = 0;
  private beatInterval = 800;  // ms
  private lastBeatTime = 0;
  private gameTime = 0;
  private targetScore = 100;   // 目标分数
  private targetBeats = 15;    // 需要击中的节拍数
  private hitCount = 0;
  private bpm = 90;  // 每分钟节拍数
  private perfectRange = 0.15; // 完美击中的角度容差（弧度）
  private goodRange = 0.25;    // 良好击中的角度容差
  private colors = {
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

  constructor(canvas: any, width: number, height: number, dpr: number, callbacks: RhythmGameCallbacks) {
    super(canvas, width, height, dpr);
    this.callbacks = callbacks;
    this.bikeX = width / 2;
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

  onUpdate(dt: number) {
    this.gameTime += dt;
    const beatMs = 60000 / this.bpm;

    // 生成新节拍
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

    // 更新节拍位置（从外向内移动）
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;

    for (const beat of this.beats) {
      if (!beat.hit && !beat.missed) {
        beat.radius += dt * 0.08; // 向内移动
        if (beat.radius > maxRadius) {
          beat.missed = true;
          this.combo = 0;
          this.callbacks.onComboChange(this.combo);
        }
      }
    }

    // 移除已处理或过远的节拍
    this.beats = this.beats.filter(b => {
      if (b.hit) return b.radius > 0;
      if (b.missed) return b.radius < maxRadius + 50;
      return true;
    });

    // 检查游戏结束
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

    // 背景
    ctx.fillStyle = this.colors.bg;
    ctx.fillRect(0, 0, this.width, this.height);

    // 绘制轨道圆
    for (let r = 60; r <= maxRadius; r += 40) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = this.colors.track;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 绘制击中区域（中心圆）
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.center;
    ctx.fill();
    ctx.strokeStyle = this.colors.beatPerfect;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制节拍
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
        if (progress > 0.85) {
          ctx.fillStyle = this.colors.beatPerfect;
        } else if (progress > 0.7) {
          ctx.fillStyle = this.colors.beatGood;
        } else {
          ctx.fillStyle = this.colors.beat;
        }
      }
      ctx.fill();
    }

    // 绘制骑行小人
    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚴', centerX, centerY);

    // UI - 顶部信息
    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Combo: ${this.combo}`, 60, 40);
    ctx.fillText(`击中: ${this.hitCount}/${this.targetBeats}`, this.width - 80, 40);

    // 进度条
    const progress = Math.min(this.hitCount / this.targetBeats, 1);
    const barWidth = this.width - 40;
    const barHeight = 12;
    const barX = 20;
    const barY = 70;

    ctx.fillStyle = this.colors.track;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = this.colors.beatPerfect;
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);

    // 提示文字
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('跟随节拍点击屏幕！', centerX, this.height - 40);
  }

  /** 处理点击 */
  handleTap() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;

    // 找到最近的未击中节拍
    let nearestBeat: Beat | null = null;
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

      // 计算分数
      const radiusDiff = Math.abs(nearestBeat.radius - (maxRadius - 35));
      if (radiusDiff < 15) {
        this.score += 100 * (1 + this.combo * 0.1); // 完美
      } else if (radiusDiff < 25) {
        this.score += 50 * (1 + this.combo * 0.05);  // 良好
      } else {
        this.score += 20;
      }

      this.callbacks.onComboChange(this.combo);
      this.callbacks.onProgressChange(this.hitCount / this.targetBeats);
    } else {
      // 空击不惩罚，只重置 combo
      this.combo = 0;
      this.callbacks.onComboChange(this.combo);
    }
  }
}
