/**
 * 游戏序列服务
 * 根据站点难度动态选择本次骑行的小游戏组合
 */

// 可用游戏库
const GAME_LIBRARY = [
  { id: 'rhythm-tap',     name: '踏频节奏',  icon: '🎵', desc: '跟随节拍踩点加速', difficulty: 1 },
  { id: 'energy-sprint',  name: '能量冲刺',  icon: '⚡', desc: '快速连点击败坡度', difficulty: 1 },
  { id: 'river-cross',    name: '过河渡口',  icon: '🌊', desc: '躲避河道障碍物',   difficulty: 2 },
  { id: 'climb-charge',   name: '爬坡挑战',  icon: '⛰️', desc: '蓄力冲上陡坡',     difficulty: 2 },
  { id: 'photo-checkin',  name: '风景打卡',  icon: '📸', desc: '寻找最佳角度拍照',  difficulty: 1 },
  { id: 'rock',           name: '落石躲避',  icon: '🪨', desc: '左右躲避落石',     difficulty: 2 },
  { id: 'wind',           name: '横风平衡',  icon: '💨', desc: '保持平衡不摔车',   difficulty: 2 },
  { id: 'tire-fix',       name: '爆胎修补',  icon: '🚧', desc: '快速修补轮胎',     difficulty: 1 },
];

// 高难度专属游戏
const HARD_GAMES = ['rock', 'river-cross', 'climb-charge'];

// 简单区段游戏池
const EASY_GAMES = ['rhythm-tap', 'energy-sprint', 'photo-checkin', 'tire-fix'];

// 中等难度游戏
const MEDIUM_GAMES = ['wind', 'river-cross', 'rock', 'climb-charge'];

/** 根据站点索引计算难度 */
function getDifficulty(stationIndex) {
  if (stationIndex <= 3) return 1;
  if (stationIndex <= 7) return 2;
  if (stationIndex <= 10) return 3;
  return 4;
}

/**
 * 为指定站点骑行选择小游戏组合
 * @param stationIndex 目标站点索引
 * @param segmentKm 区段里程（影响游戏数量）
 */
function selectGamesForRide(stationIndex, segmentKm = 50) {
  const difficulty = getDifficulty(stationIndex);
  const games = [];

  // 根据里程确定游戏数量：每 30km 一个游戏，至少 2 个
  const gameCount = Math.max(2, Math.min(4, Math.ceil(segmentKm / 30)));

  // 根据难度选择游戏池
  let pool;
  if (difficulty <= 1) {
    pool = EASY_GAMES.map(id => GAME_LIBRARY.find(g => g.id === id)).filter(Boolean);
  } else if (difficulty <= 2) {
    const combined = [...EASY_GAMES, ...MEDIUM_GAMES];
    const seen = new Set();
    pool = combined
      .map(id => GAME_LIBRARY.find(g => g.id === id))
      .filter(g => {
        if (!g || seen.has(g.id)) return false;
        seen.add(g.id);
        return true;
      });
  } else {
    pool = GAME_LIBRARY.filter(g => !HARD_GAMES.includes(g.id) || Math.random() > 0.3);
  }

  // 随机选择不重复的游戏
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(gameCount, shuffled.length); i++) {
    const game = shuffled[i];
    games.push({
      ...game,
      route: `/games/${game.id}/index`,
    });
  }

  // 确保至少有 2 个游戏
  while (games.length < 2) {
    const fallbackId = EASY_GAMES[Math.floor(Math.random() * EASY_GAMES.length)];
    const fallback = GAME_LIBRARY.find(g => g.id === fallbackId);
    if (fallback && !games.find(g => g.id === fallback.id)) {
      games.push({ ...fallback, route: `/games/${fallback.id}/index` });
    }
  }

  return games;
}

/** 获取游戏的预期奖励描述 */
function getGameRewardHint(gameId, difficulty) {
  const base = difficulty * 10;
  const bonus = difficulty * 5;
  return `胜利 +${base + bonus}金币`;
}

/** 获取游戏失败惩罚描述 */
function getGamePenaltyHint(gameId, difficulty) {
  const penalty = difficulty * 8;
  return `失败 -${penalty}体能`;
}

module.exports = {
  GAME_LIBRARY,
  selectGamesForRide,
  getGameRewardHint,
  getGamePenaltyHint,
};
