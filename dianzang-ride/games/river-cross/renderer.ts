/**
 * 过河渡口游戏渲染器
 * 横向移动躲避木桩和漩涡
 */
import { BaseGame } from '../base-game';

interface RiverCrossCallbacks {
  onHpChange: (hp: number) => void;
  onDistanceChange: (dist: number) => void;
  onFinish: (won: boolean) => void;
}

interface Obstacle {
  x: number;
  y: number;
  type: 'log' | 'whirlpool';
  width: number;
  hit: boolean;
}

export class RiverCrossGame extends BaseGame {
  private callbacks: RiverCrossCallbacks;
  private bikeX: number;
  private hp = 100;
  private distance = 0;
  private targetDistance = 500;
  private obstacles: Obstacle[] = [];
  private spawnTimer = 0;
  private spawnInterval = 1200;
  private speed = 2;
  private colors = {
    bg: '#1e3a5f',
    water: '#2980b9',
    waterLine: '#3498db',
    bike: '#f8f8f2',
    log: '#8b4513',
    whirlpool: '#1a5276',
    danger: '#e74c3c',
    safe: '#27ae60',
  };
  private lanes = 3;
  private laneWidth = 0;
  private time = 0;

  constructor(canvas: any, width: number, height: number, dpr: number, callbacks: RiverCrossCallbacks) {
    super(canvas, width, height, dpr);
    this.callbacks = callbacks;
    this.bikeX = width / 2;
    this.laneWidth = width / this.lanes;
  }

  onInit() {
    this.bikeX = this.width / 2;
    this.hp = 100;
    this.distance = 0;
    this.obstacles = [];
    this.spawnTimer = 0;
  }

  onUpdate(dt: number) {
    this.time += dt;

    // 前进
    this.distance += this.speed * dt * 0.05;
    this.callbacks.onDistanceChange(Math.floor(this.distance));

    // 生成障碍物
    this.spawnTimer += dt;
    if (this.spawnTimer > this.spawnInterval) {
      this.spawnTimer = 0;
      const lane = Math.floor(Math.random() * this.lanes);
      const type = Math.random() < 0.7 ? 'log' : 'whirlpool';
      this.obstacles.push({
        x: lane * this.laneWidth + this.laneWidth / 2,
        y: -50,
        type,
        width: this.laneWidth * 0.6,
        hit: false,
      });
    }

    // 更新障碍物
    for (const obs of this.obstacles) {
      obs.y += this.speed * dt * 0.1;

      // 碰撞检测
      if (!obs.hit && obs.y > this.height - 150 && obs.y < this.height - 80) {
        const bikeLane = Math.floor(this.bikeX / this.laneWidth);
        const obsLane = Math.floor(obs.x / this.laneWidth);
        if (bikeLane === obsLane) {
          obs.hit = true;
          if (obs.type === 'whirlpool') {
            this.hp -= 20;
          } else {
            this.hp -= 15;
          }
          this.callbacks.onHpChange(this.hp);

          if (this.hp <= 0) {
            this.callbacks.onFinish(false);
            this.stop();
            return;
          }
        }
      }
    }

    // 移除过远障碍物
    this.obstacles = this.obstacles.filter(o => o.y < this.height + 50);

    // 检查完成
    if (this.distance >= this.targetDistance) {
      this.callbacks.onFinish(true);
      this.stop();
    }
  }

  onRender() {
    const ctx = this.ctx;

    // 背景 - 河流
    ctx.fillStyle = this.colors.bg;
    ctx.fillRect(0, 0, this.width, this.height);

    // 水波纹
    ctx.strokeStyle = this.colors.waterLine;
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const y = ((this.time * 0.05 + i * 40) % (this.height + 100)) - 50;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      for (let x = 0; x < this.width; x += 20) {
        const waveY = y + Math.sin(x * 0.05 + this.time * 0.003) * 5;
        if (x === 0) {
          ctx.moveTo(x, waveY);
        } else {
          ctx.lineTo(x, waveY);
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 绘制车道线
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i < this.lanes; i++) {
      ctx.beginPath();
      ctx.moveTo(i * this.laneWidth, 0);
      ctx.lineTo(i * this.laneWidth, this.height);
      ctx.stroke();
    }

    // 绘制障碍物
    for (const obs of this.obstacles) {
      if (obs.type === 'log') {
        // 木桩
        ctx.fillStyle = obs.hit ? this.colors.danger : this.colors.log;
        ctx.fillRect(obs.x - obs.width / 2, obs.y - 15, obs.width, 30);
        ctx.strokeStyle = '#5d3a1a';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x - obs.width / 2, obs.y - 15, obs.width, 30);
      } else {
        // 漩涡
        ctx.strokeStyle = obs.hit ? this.colors.danger : this.colors.whirlpool;
        ctx.lineWidth = 3;
        for (let r = 10; r < 30; r += 8) {
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // 绘制骑行小人
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚴', this.bikeX, this.height - 100);

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 120, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`HP: ${this.hp}%`, 20, 35);
    ctx.fillText(`进度: ${Math.floor(this.distance)}m`, 20, 60);

    // 进度条
    const progress = Math.min(this.distance / this.targetDistance, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(this.width - 130, 10, 120, 20);
    ctx.fillStyle = this.colors.safe;
    ctx.fillRect(this.width - 130, 10, 120 * progress, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.width - 130, 10, 120, 20);

    // 提示
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('← → 滑动移动躲避障碍', this.width / 2, this.height - 30);
  }

  move(direction: number) {
    const newX = this.bikeX + direction * this.laneWidth;
    this.bikeX = Math.max(this.laneWidth / 2, Math.min(this.width - this.laneWidth / 2, newX));
  }
}
