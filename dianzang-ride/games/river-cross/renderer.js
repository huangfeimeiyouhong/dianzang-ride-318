/**
 * 过河渡口游戏渲染器
 * 横向移动躲避木桩和漩涡
 */
const { BaseGame } = require('../base-game');

class RiverCrossGame extends BaseGame {
  constructor(canvas, width, height, dpr, callbacks) {
    super(canvas, width, height, dpr);
    this.callbacks = callbacks;
    this.bikeX = width / 2;
    this.hp = 100;
    this.distance = 0;
    this.targetDistance = 500;
    this.obstacles = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1200;
    this.speed = 2;
    this.lanes = 3;
    this.laneWidth = width / this.lanes;
    this.time = 0;
    this.colors = {
      bg: '#1e3a5f',
      water: '#2980b9',
      waterLine: '#3498db',
      bike: '#f8f8f2',
      log: '#8b4513',
      whirlpool: '#1a5276',
      danger: '#e74c3c',
      safe: '#27ae60',
    };
  }

  onInit() {
    this.bikeX = this.width / 2;
    this.hp = 100;
    this.distance = 0;
    this.obstacles = [];
    this.spawnTimer = 0;
  }

  onUpdate(dt) {
    this.time += dt;
    this.distance += this.speed * dt * 0.05;
    this.callbacks.onDistanceChange(Math.floor(this.distance));

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

    for (const obs of this.obstacles) {
      obs.y += this.speed * dt * 0.1;
      if (!obs.hit && obs.y > this.height - 150 && obs.y < this.height - 80) {
        const bikeLane = Math.floor(this.bikeX / this.laneWidth);
        const obsLane = Math.floor(obs.x / this.laneWidth);
        if (bikeLane === obsLane) {
          obs.hit = true;
          this.hp -= obs.type === 'whirlpool' ? 20 : 15;
          this.callbacks.onHpChange(this.hp);
          if (this.hp <= 0) {
            this.callbacks.onFinish(false);
            this.stop();
            return;
          }
        }
      }
    }

    this.obstacles = this.obstacles.filter(o => o.y < this.height + 50);

    if (this.distance >= this.targetDistance) {
      this.callbacks.onFinish(true);
      this.stop();
    }
  }

  onRender() {
    const ctx = this.ctx;
    ctx.fillStyle = this.colors.bg;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = this.colors.waterLine;
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const y = ((this.time * 0.05 + i * 40) % (this.height + 100)) - 50;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      for (let x = 0; x < this.width; x += 20) {
        const waveY = y + Math.sin(x * 0.05 + this.time * 0.003) * 5;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i < this.lanes; i++) {
      ctx.beginPath();
      ctx.moveTo(i * this.laneWidth, 0);
      ctx.lineTo(i * this.laneWidth, this.height);
      ctx.stroke();
    }

    for (const obs of this.obstacles) {
      if (obs.type === 'log') {
        ctx.fillStyle = obs.hit ? this.colors.danger : this.colors.log;
        ctx.fillRect(obs.x - obs.width / 2, obs.y - 15, obs.width, 30);
      } else {
        ctx.strokeStyle = obs.hit ? this.colors.danger : this.colors.whirlpool;
        ctx.lineWidth = 3;
        for (let r = 10; r < 30; r += 8) {
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚴', this.bikeX, this.height - 100);

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 120, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`HP: ${this.hp}%`, 20, 35);
    ctx.fillText(`进度: ${Math.floor(this.distance)}m`, 20, 60);
  }

  move(direction) {
    const newX = this.bikeX + direction * this.laneWidth;
    this.bikeX = Math.max(this.laneWidth / 2, Math.min(this.width - this.laneWidth / 2, newX));
  }
}

module.exports = { RiverCrossGame };
