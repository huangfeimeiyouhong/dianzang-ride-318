/**
 * 游戏奖惩统一服务
 * 提供统一的 applyGameResult(eventId, won, difficulty) 方法
 * 替代各游戏硬编码的惩罚值，确保与 event.ts 定义一致
 */
import { PlayerData } from '../models/player';
import { EVENT_POOL } from '../models/event';
import { getDifficulty } from './event-service';
import { loadLocal, saveLocal } from '../utils/storage';

// 各游戏失败惩罚配置（与 event.ts penalties 对齐）
const GAME_PENALTIES: Record<string, {
  energy: number;
  durability?: number;
  mood?: number;
  coins?: number;
  kmBack?: number;
}> = {
  'rock':       { energy: -15, durability: -5 },
  'dog':        { energy: -10, mood: -8 },
  'avalanche':  { energy: -25, durability: -10, kmBack: 20 },
  'wind':       { energy: -10 },
  'tire-fix':   { energy: -15 },
  'rhythm-tap':     { energy: -10 },
  'energy-sprint':  { energy: -15 },
  'river-cross':    { energy: -12, mood: -5 },
  'climb-charge':   { energy: -20, mood: -10 },
  'photo-checkin':  { energy: -5 },
};

// 各游戏成功奖励加成（基于 event rewards 上浮一定比例）
const GAME_WIN_BONUS: Record<string, {
  coins?: number;
  energy?: number;
  mood?: number;
}> = {
  'rock':       { coins: 10 },
  'dog':        { coins: 20, energy: 5 },
  'avalanche':  { coins: 30 },
  'wind':       { energy: 5 },
  'tire-fix':   { coins: 10 },
  'rhythm-tap':     { coins: 15, energy: 5 },
  'energy-sprint':  { coins: 20, energy: 8 },
  'river-cross':    { coins: 15 },
  'climb-charge':   { coins: 25, energy: 10, mood: 5 },
  'photo-checkin':  { coins: 10, mood: 5 },
};

export interface GameResult {
  won: boolean;
  eventId: string;
  difficulty: number;
  coinsEarned: number;
  energyChanged: number;
  durabilityChanged: number;
  moodChanged: number;
}

/**
 * 统一的游戏结果处理
 * @param eventId 游戏对应的 event id
 * @param won 是否胜利
 * @param stationIndex 站点索引（用于计算难度）
 */
export function applyGameResult(
  eventId: string,
  won: boolean,
  stationIndex: number
): GameResult {
  const player = loadLocal();
  if (!player) {
    return { won, eventId, difficulty: 1, coinsEarned: 0, energyChanged: 0, durabilityChanged: 0, moodChanged: 0 };
  }

  const difficulty = getDifficulty(stationIndex);
  const penalties = GAME_PENALTIES[eventId] || { energy: -10 };
  const bonuses = GAME_WIN_BONUS[eventId] || {};

  let coinsEarned = 0;
  let energyChanged = 0;
  let durabilityChanged = 0;
  let moodChanged = 0;

  if (won) {
    // 胜利：从 event pool 获取对应事件的奖励
    const event = EVENT_POOL.find(e => e.id === eventId);
    if (event?.rewards) {
      const reward = event.rewards;
      if (reward.energy) {
        const bonusEnergy = Math.round(reward.energy * (1 + (difficulty - 1) * 0.2));
        player.stats.energy = Math.min(200, player.stats.energy + bonusEnergy);
        energyChanged = bonusEnergy;
      }
      if (reward.coins) {
        const bonusCoins = Math.round(reward.coins * (1 + (difficulty - 1) * 0.3));
        player.inventory.coins += bonusCoins;
        coinsEarned = bonusCoins;
      }
      if (reward.mood) {
        player.stats.mood = Math.min(100, player.stats.mood + reward.mood);
        moodChanged = reward.mood;
      }
      if (reward.item) {
        addItemToInventory(player, reward.item);
      }
    }
    // 额外胜利加成
    if (bonuses.coins) {
      player.inventory.coins += bonuses.coins;
      coinsEarned += bonuses.coins;
    }
    if (bonuses.energy) {
      player.stats.energy = Math.min(200, player.stats.energy + bonuses.energy);
      energyChanged += bonuses.energy;
    }
    if (bonuses.mood) {
      player.stats.mood = Math.min(100, player.stats.mood + bonuses.mood);
      moodChanged += bonuses.mood;
    }

    // 重置失败标记
    player.progress.lastEventFailed = false;
  } else {
    // 失败：根据难度放大惩罚
    const multiplier = 1 + (difficulty - 1) * 0.5;

    if (penalties.energy) {
      const dmg = Math.round(penalties.energy * multiplier);
      player.stats.energy = Math.max(0, player.stats.energy + dmg);
      energyChanged = dmg;
    }
    if (penalties.durability) {
      const dmg = Math.round(penalties.durability * multiplier);
      player.stats.durability = Math.max(0, player.stats.durability + dmg);
      durabilityChanged = dmg;
    }
    if (penalties.mood) {
      const dmg = Math.round(penalties.mood * multiplier);
      player.stats.mood = Math.max(0, player.stats.mood + dmg);
      moodChanged = dmg;
    }
    if (penalties.kmBack) {
      const back = Math.round(penalties.kmBack * multiplier);
      player.progress.km = Math.max(0, player.progress.km - back);
    }

    // 标记失败
    player.progress.lastEventFailed = true;
  }

  saveLocal(player);

  return {
    won,
    eventId,
    difficulty,
    coinsEarned,
    energyChanged,
    durabilityChanged,
    moodChanged,
  };
}

/** 添加物品到背包 */
function addItemToInventory(player: PlayerData, itemType: string): void {
  const itemMap: Record<string, string[]> = {
    rare_supply: ['energy_drink', 'oxygen_bottle', 'warm_clothing', 'tsampa'],
    supply_pack: ['energy_drink', 'oxygen_bottle', 'warm_clothing'],
    random_supply: ['energy_drink', 'oxygen_bottle', 'repair_kit', 'warm_clothing', 'tsampa'],
  };

  if (itemMap[itemType]) {
    const pool = itemMap[itemType];
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const existing = player.inventory.items.find(i => i.id === chosen);
    if (existing) {
      existing.count++;
    } else {
      player.inventory.items.push({ id: chosen, count: 1 });
    }
  } else {
    const existing = player.inventory.items.find(i => i.id === itemType);
    if (existing) {
      existing.count++;
    } else {
      player.inventory.items.push({ id: itemType, count: 1 });
    }
  }
}

/** 获取游戏名称（用于结果展示） */
export function getGameName(eventId: string): string {
  const names: Record<string, string> = {
    'rock': '落石躲避',
    'dog': '野狗追咬',
    'avalanche': '雪崩逃生',
    'wind': '横风平衡',
    'tire-fix': '爆胎修补',
    'rhythm-tap': '踏频节奏',
    'energy-sprint': '能量冲刺',
    'river-cross': '过河渡口',
    'climb-charge': '爬坡挑战',
    'photo-checkin': '风景打卡',
  };
  return names[eventId] || eventId;
}
