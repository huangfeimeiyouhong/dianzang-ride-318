/**
 * 风景打卡游戏渲染器
 * 3 秒内移动取景框对齐风景拍照
 */
import { BaseGame } from '../base-game';

interface PhotoCheckinCallbacks {
  onTimerChange: (sec: number) => void;
  onAlignmentChange: (aligned: boolean) => void;
  onPhotoTaken: () => void;
  onFinish: (won: boolean) => void;
}

interface Scenery {
  x: number;
  y: number;
  type: 'mountain' | 'lake' | 'temple' | 'grassland';
  width: number;
  height: number;
  captured: boolean;
}

export class PhotoCheckinGame extends BaseGame {
  private callbacks: PhotoCheckinCallbacks;
  private frameX: number;
  private targetX: number;
  private timer = 3000;
  private aligned = false;
  private photoTaken = false;
  private sceneries: Scenery[] = [];
  private colors = {
    bg: '#87ceeb',
    frame: '#ffffff',
    frameAlign: '#27ae60',
    sky: '#3498db',
    mountain: '#7f8c8d',
    lake: '#2980b9',
    temple: '#e74c3c',
    grassland: '#27ae60',
    timer: '#e74c3c',
  };
  private frameWidth = 120;
  private frameHeight = 80;

  constructor(canvas: any, width: number, height: number, dpr: number, callbacks: PhotoCheckinCallbacks) {
    super(canvas, width, height, dpr);
    this.callbacks = callbacks;
    this.frameX = width / 2;
    this.targetX = width * 0.3 + Math.random() * width * 0.4;
  }

  onInit() {
    this.frameX = this.width / 2;
    this.targetX = this.width * 0.25 + Math.random() * this.width * 0.5;
    this.timer = 3000;
    this.aligned = false;
    this.photoTaken = false;
    this.sceneries = this.generateSceneries();
  }

  generateSceneries(): Scenery[] {
    const types: Scenery['type'][] = ['mountain', 'lake', 'temple', 'grassland'];
    return types.map((type, i) => ({
      x: this.width * (0.2 + i * 0.2),
      y: this.height * 0.3,
      type,
      width: 80,
      height: 60,
      captured: false,
    }));
  }

  onUpdate(dt: number) {
    if (this.photoTaken) return;

    this.timer -= dt;
    this.callbacks.onTimerChange(Math.ceil(this.timer / 1000));

    // 检测对齐
    const tolerance = 30;
    const isAligned = Math.abs(this.frameX - this.targetX) < tolerance;
    if (isAligned !== this.aligned) {
      this.aligned = isAligned;
      this.callbacks.onAlignmentChange(isAligned);
    }

    // 超时
    if (this.timer <= 0) {
      this.callbacks.onFinish(false);
      this.stop();
    }
  }

  onRender() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 天空渐变
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#1a1a2e');
    skyGrad.addColorStop(0.3, this.colors.sky);
    skyGrad.addColorStop(1, this.colors.grassland);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 绘制风景
    for (const sc of this.sceneries) {
      this.drawScenery(ctx, sc);
    }

    // 取景框
    const frameY = h * 0.35;
    ctx.strokeStyle = this.aligned ? this.colors.frameAlign : this.colors.frame;
    ctx.lineWidth = this.aligned ? 4 : 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(
      this.frameX - this.frameWidth / 2,
      frameY - this.frameHeight / 2,
      this.frameWidth,
      this.frameHeight
    );
    ctx.setLineDash([]);

    // 目标指示器
    ctx.fillStyle = this.aligned ? 'rgba(39, 174, 96, 0.3)' : 'rgba(231, 76, 60, 0.3)';
    ctx.fillRect(
      this.targetX - this.frameWidth / 2,
      frameY - this.frameHeight / 2,
      this.frameWidth,
      this.frameHeight
    );

    // 骑手小人
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📷', this.frameX, h - 100);

    // 计时器
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(w / 2 - 50, 30, 100, 50);
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.timer < 1000 ? '#e74c3c' : '#ffffff';
    ctx.fillText(`${Math.ceil(this.timer / 1000)}s`, w / 2, 68);

    // 对齐提示
    if (this.aligned) {
      ctx.fillStyle = this.colors.frameAlign;
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('✓ 对齐！点击拍照！', w / 2, h - 40);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '16px sans-serif';
      ctx.fillText('← → 移动取景框对齐风景', w / 2, h - 40);
    }
  }

  drawScenery(ctx: any, sc: Scenery) {
    ctx.save();
    ctx.translate(sc.x, sc.y);

    if (sc.type === 'mountain') {
      ctx.fillStyle = this.colors.mountain;
      ctx.beginPath();
      ctx.moveTo(-40, 30);
      ctx.lineTo(0, -30);
      ctx.lineTo(40, 30);
      ctx.closePath();
      ctx.fill();
      // 雪顶
      ctx.fillStyle = '#ecf0f1';
      ctx.beginPath();
      ctx.moveTo(-15, -10);
      ctx.lineTo(0, -30);
      ctx.lineTo(15, -10);
      ctx.closePath();
      ctx.fill();
    } else if (sc.type === 'lake') {
      ctx.fillStyle = this.colors.lake;
      ctx.beginPath();
      ctx.ellipse(0, 10, 35, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (sc.type === 'temple') {
      ctx.fillStyle = this.colors.temple;
      ctx.fillRect(-25, -10, 50, 40);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-30, -10);
      ctx.lineTo(0, -35);
      ctx.lineTo(30, -10);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = this.colors.grassland;
      ctx.fillRect(-30, 0, 60, 30);
      ctx.fillStyle = '#2ecc71';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(i * 15, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  move(direction: number) {
    const speed = 8;
    this.frameX = Math.max(this.frameWidth / 2, Math.min(this.width - this.frameWidth / 2, this.frameX + direction * speed));
  }

  takePhoto() {
    if (!this.aligned || this.photoTaken) return;

    this.photoTaken = true;
    this.callbacks.onPhotoTaken();

    // 拍照动画
    setTimeout(() => {
      this.callbacks.onFinish(true);
      this.stop();
    }, 500);
  }
}
