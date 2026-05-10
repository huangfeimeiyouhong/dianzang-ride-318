/**
 * 游戏奖惩统一服务
 * 提供统一的 applyGameResult(eventId, won, difficulty) 方法
 * 替代各游戏硬编码的惩罚值，确保与 event.ts 定义一致
 */
const GAME_PENALTIES = {
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

const GAME_WIN_BONUS = {
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

/** 根据站点索引计算难度 */
function getDifficulty(stationIndex) {
  if (stationIndex <= 3) return 1;
  if (stationIndex <= 7) return 2;
  if (stationIndex <= 10) return 3;
  return 4;
}

/** 添加物品到背包 */
function addItemToInventory(player, itemType) {
  const itemMap = {
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

/**
 * 统一的游戏结果处理
 * @param eventId 游戏对应的 event id
 * @param won 是否胜利
 * @param stationIndex 站点索引（用于计算难度）
 */
function applyGameResult(eventId, won, stationIndex) {
  const player = wx.$player || (wx.getApp ? wx.getApp().globalData?.player : null);
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
    const reward = { energy: 10, coins: 20 }; // 默认奖励
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
    player.progress.lastEventFailed = false;
  } else {
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
    player.progress.lastEventFailed = true;
  }

  const { saveLocal } = require('../utils/storage');
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

/** 获取游戏名称 */
function getGameName(eventId) {
  const names = {
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

module.exports = { applyGameResult, getGameName };
