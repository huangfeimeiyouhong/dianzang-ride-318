/**
 * 风景打卡游戏渲染器
 * 3 秒内移动取景框对齐风景拍照
 */
const { BaseGame } = require('../base-game');

class PhotoCheckinGame extends BaseGame {
  constructor(canvas, width, height, dpr, callbacks) {
    super(canvas, width, height, dpr);
    this.callbacks = callbacks;
    this.frameX = width / 2;
    this.targetX = width * 0.3 + Math.random() * width * 0.4;
    this.timer = 3000;
    this.aligned = false;
    this.photoTaken = false;
    this.sceneries = [];
    this.colors = {
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
    this.frameWidth = 120;
    this.frameHeight = 80;
  }

  onInit() {
    this.frameX = this.width / 2;
    this.targetX = this.width * 0.25 + Math.random() * this.width * 0.5;
    this.timer = 3000;
    this.aligned = false;
    this.photoTaken = false;
    this.sceneries = this.generateSceneries();
  }

  generateSceneries() {
    const types = ['mountain', 'lake', 'temple', 'grassland'];
    return types.map((type, i) => ({
      x: this.width * (0.2 + i * 0.2),
      y: this.height * 0.3,
      type,
      width: 80,
      height: 60,
      captured: false,
    }));
  }

  onUpdate(dt) {
    if (this.photoTaken) return;
    this.timer -= dt;
    this.callbacks.onTimerChange(Math.ceil(this.timer / 1000));

    const tolerance = 30;
    const isAligned = Math.abs(this.frameX - this.targetX) < tolerance;
    if (isAligned !== this.aligned) {
      this.aligned = isAligned;
      this.callbacks.onAlignmentChange(isAligned);
    }

    if (this.timer <= 0) {
      this.callbacks.onFinish(false);
      this.stop();
    }
  }

  onRender() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#1a1a2e');
    skyGrad.addColorStop(0.3, this.colors.sky);
    skyGrad.addColorStop(1, this.colors.grassland);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    for (const sc of this.sceneries) {
      this.drawScenery(ctx, sc);
    }

    const frameY = h * 0.35;
    ctx.strokeStyle = this.aligned ? this.colors.frameAlign : this.colors.frame;
    ctx.lineWidth = this.aligned ? 4 : 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(this.frameX - this.frameWidth / 2, frameY - this.frameHeight / 2, this.frameWidth, this.frameHeight);
    ctx.setLineDash([]);

    ctx.fillStyle = this.aligned ? 'rgba(39, 174, 96, 0.3)' : 'rgba(231, 76, 60, 0.3)';
    ctx.fillRect(this.targetX - this.frameWidth / 2, frameY - this.frameHeight / 2, this.frameWidth, this.frameHeight);

    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📷', this.frameX, h - 100);

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(w / 2 - 50, 30, 100, 50);
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.timer < 1000 ? '#e74c3c' : '#ffffff';
    ctx.fillText(`${Math.ceil(this.timer / 1000)}s`, w / 2, 68);

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

  drawScenery(ctx, sc) {
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
    }
    ctx.restore();
  }

  move(direction) {
    const speed = 8;
    this.frameX = Math.max(this.frameWidth / 2, Math.min(this.width - this.frameWidth / 2, this.frameX + direction * speed));
  }

  takePhoto() {
    if (!this.aligned || this.photoTaken) return;
    this.photoTaken = true;
    this.callbacks.onPhotoTaken();
    setTimeout(() => {
      this.callbacks.onFinish(true);
      this.stop();
    }, 500);
  }
}

module.exports = { PhotoCheckinGame };
