/**
 * 落石躲避 - 游戏渲染器
 * 3 条车道，左右滑动切换，石头从上方掉落，3 波递增速度
 */
import { BaseGame } from '../base-game';
import { clamp, randInt, rectCollision } from '../../utils/math';
import { fillRoundRect, fillCircle, drawCenteredText } from '../../utils/canvas-helper';

interface Rock {
  lane: number;      // 0/1/2
  x: number;
  y: number;
  size: number;
  speed: number;
}

export interface RockDodgeCallbacks {
  onHpChange: (hp: number) => void;
  onWaveChange: (wave: number) => void;
  onFinish: (won: boolean) => void;
}

// 基础波次配置
const BASE_WAVE_CONFIG = [
  { count: 6,  baseSpeed: 2.5, interval: 600 },
  { count: 10, baseSpeed: 3.5, interval: 450 },
  { count: 14, baseSpeed: 4.5, interval: 350 },
];

// 难度倍率：1(简单) → 2(普通) → 3(困难) → 4(噩梦)
const DIFF_MULT: Record<number, { speedMult: number; extraCount: number; intervalMult: number }> = {
  1: { speedMult: 0.8, extraCount: 0, intervalMult: 1.3 },
  2: { speedMult: 1.0, extraCount: 0, intervalMult: 1.0 },
  3: { speedMult: 1.2, extraCount: 2, intervalMult: 0.85 },
  4: { speedMult: 1.4, extraCount: 4, intervalMult: 0.7 },
};

function getWaveConfig(difficulty: number) {
  const dm = DIFF_MULT[difficulty] || DIFF_MULT[2];
  return BASE_WAVE_CONFIG.map(w => ({
    count: w.count + dm.extraCount,
    baseSpeed: w.baseSpeed * dm.speedMult,
    interval: Math.round(w.interval * dm.intervalMult),
  }));
}

const MAX_HP = 100;
const HIT_DAMAGE = 20;
const LANES = 3;

export class RockDodgeGame extends BaseGame {
  private playerLane = 1;     // 当前车道（0/1/2）
  private targetLane = 1;
  private playerX = 0;
  private playerY = 0;
  private laneWidth = 0;
  private rocks: Rock[] = [];
  private hp = MAX_HP;
  private wave = 0;           // 当前波次（0-based）
  private spawnTimer = 0;
  private spawnedCount = 0;
  private callbacks: RockDodgeCallbacks;
  private waveCleared = false;
  private gameOver = false;
  private waveConfig: { count: number; baseSpeed: number; interval: number }[];

  constructor(canvas: any, w: number, h: number, dpr: number, callbacks: RockDodgeCallbacks, difficulty: number = 2) {
    super(canvas, w, h, dpr);
    this.callbacks = callbacks;
    this.waveConfig = getWaveConfig(difficulty);
  }

  onInit() {
    this.laneWidth = this.width / LANES;
    this.playerY = this.height - 80;
    this.playerLane = 1;
    this.targetLane = 1;
    this.playerX = this.getLaneX(1);
    this.hp = MAX_HP;
    this.wave = 0;
    this.rocks = [];
    this.spawnTimer = 0;
    this.spawnedCount = 0;
    this.waveCleared = false;
    this.gameOver = false;
    this.callbacks.onHpChange(this.hp);
    this.callbacks.onWaveChange(this.wave + 1);
  }

  private getLaneX(lane: number): number {
    return this.laneWidth * lane + this.laneWidth / 2;
  }

  /** 外部调用：设置目标车道 */
  setLane(lane: number) {
    this.targetLane = clamp(lane, 0, LANES - 1);
  }

  /** 左右滑动 */
  swipe(dir: 'left' | 'right') {
    if (dir === 'left') this.targetLane = Math.max(0, this.playerLane - 1);
    else this.targetLane = Math.min(LANES - 1, this.playerLane + 1);
  }

  onUpdate(dt: number) {
    if (this.gameOver) return;

    const config = this.waveConfig[this.wave];
    if (!config) return;

    // 平滑移动到目标车道
    const targetX = this.getLaneX(this.targetLane);
    this.playerX += (targetX - this.playerX) * 0.15;
    if (Math.abs(this.playerX - targetX) < 2) {
      this.playerX = targetX;
      this.playerLane = this.targetLane;
    }

    // 生成石头
    this.spawnTimer += dt;
    if (this.spawnedCount < config.count && this.spawnTimer >= config.interval) {
      this.spawnTimer = 0;
      this.spawnedCount++;
      const lane = randInt(0, LANES - 1);
      this.rocks.push({
        lane,
        x: this.getLaneX(lane),
        y: -40,
        size: randInt(24, 36),
        speed: config.baseSpeed + Math.random() * 1.5,
      });
    }

    // 更新石头位置
    for (let i = this.rocks.length - 1; i >= 0; i--) {
      const rock = this.rocks[i];
      rock.y += rock.speed * (dt / 16);

      // 碰撞检测
      const playerSize = 30;
      if (rectCollision(
        this.playerX - playerSize / 2, this.playerY - playerSize / 2, playerSize, playerSize,
        rock.x - rock.size / 2, rock.y - rock.size / 2, rock.size, rock.size,
      )) {
        this.rocks.splice(i, 1);
        this.hp = Math.max(0, this.hp - HIT_DAMAGE);
        this.callbacks.onHpChange(this.hp);

        if (this.hp <= 0) {
          this.gameOver = true;
          this.callbacks.onFinish(false);
          return;
        }
        continue;
      }

      // 超出屏幕
      if (rock.y > this.height + 50) {
        this.rocks.splice(i, 1);
      }
    }

    // 检查波次是否完成
    if (this.spawnedCount >= config.count && this.rocks.length === 0 && !this.waveCleared) {
      this.waveCleared = true;
      if (this.wave < this.waveConfig.length - 1) {
        // 下一波
        setTimeout(() => {
          this.wave++;
          this.spawnedCount = 0;
          this.spawnTimer = 0;
          this.waveCleared = false;
          this.callbacks.onWaveChange(this.wave + 1);
        }, 800);
      } else {
        // 全部通关
        this.gameOver = true;
        this.callbacks.onFinish(true);
      }
    }
  }

  onRender() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 背景
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, w, h);

    // 车道分割线
    ctx.strokeStyle = 'rgba(79,209,197,0.1)';
    ctx.lineWidth = 1;
    for (let i = 1; i < LANES; i++) {
      const x = this.laneWidth * i;
      ctx.beginPath();
      ctx.setLineDash([8, 12]);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 山体装饰（底部渐变）
    const grad = ctx.createLinearGradient(0, h - 120, 0, h);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(79,209,197,0.05)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - 120, w, 120);

    // 石头
    for (const rock of this.rocks) {
      fillCircle(ctx, rock.x, rock.y, rock.size / 2, '#6b7280');
      // 石头高光
      fillCircle(ctx, rock.x - rock.size * 0.15, rock.y - rock.size * 0.15, rock.size * 0.15, '#9ca3af');
    }

    // 骑手
    drawCenteredText(ctx, '🚴', this.playerX, this.playerY, '32px sans-serif', '#fff');

    // 波次提示（波次切换时短暂显示）
    if (this.waveCleared && this.wave < this.waveConfig.length - 1) {
      fillRoundRect(ctx, w / 2 - 80, h / 2 - 24, 160, 48, 12, 'rgba(79,209,197,0.2)');
      drawCenteredText(ctx, `第 ${this.wave + 2} 波来袭！`, w / 2, h / 2, '16px sans-serif', '#4fd1c5');
    }
  }
}
