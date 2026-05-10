export interface GameEvent {
  id: string;
  name: string;
  icon: string;
  desc: string;
  minKm: number;
  zones: number[] | 'all';   // 出现的站点区段
  weight: number;             // 触发权重
  gamePage: string | null;    // 关卡页面路径，null 表示纯对话/被动事件
  rewards: EventReward;
  penalties: EventPenalty;
}

export interface EventReward {
  energy?: number;
  coins?: number;
  mood?: number;
  item?: string;
  skipNextEvent?: boolean;
}

export interface EventPenalty {
  energy?: number;
  coins?: number;
  mood?: number;
  durability?: number;
  kmBack?: number;
  triggerHighAlt?: boolean;
}

export const EVENT_POOL: GameEvent[] = [
  {
    id: 'rock', name: '落石', icon: '🪨',
    desc: '前方落石！左右滑动躲避滚石，共 3 波',
    minKm: 0, zones: [2, 3, 4, 5, 6, 7, 8], weight: 30,
    gamePage: '/games/rock-dodge/index',
    rewards: { coins: 30, energy: 10 },
    penalties: { energy: -15, durability: -5 },
  },
  {
    id: 'dog', name: '野狗追咬', icon: '🐕',
    desc: '野狗来袭！快速点击加速逃离',
    minKm: 0, zones: [0, 1, 2, 4, 5, 9], weight: 25,
    gamePage: '/games/dog-chase/index',
    rewards: { coins: 50, item: 'energy_drink' },
    penalties: { energy: -10, mood: -8 },
  },
  {
    id: 'avalanche', name: '雪崩', icon: '🏔',
    desc: '雪崩警报！快速找到安全区',
    minKm: 400, zones: [3, 8], weight: 10,
    gamePage: '/games/avalanche/index',
    rewards: { coins: 80, item: 'rare_supply' },
    penalties: { energy: -25, triggerHighAlt: true },
  },
  {
    id: 'blizzard', name: '暴风雪', icon: '🌧',
    desc: '暴风雪来袭，能见度极低',
    minKm: 300, zones: [2, 3], weight: 15,
    gamePage: null,
    rewards: { coins: 40, mood: 10 },
    penalties: { energy: -10, kmBack: 15 },
  },
  {
    id: 'wind', name: '横风', icon: '💨',
    desc: '强烈横风！保持平衡不摔车',
    minKm: 600, zones: [5, 6, 7, 8, 12], weight: 20,
    gamePage: '/games/wind-balance/index',
    rewards: { coins: 25, energy: 5 },
    penalties: { energy: -10 },
  },
  {
    id: 'flat_tire', name: '爆胎', icon: '🚧',
    desc: '轮胎被扎！限时修补',
    minKm: 0, zones: 'all', weight: 20,
    gamePage: '/games/tire-fix/index',
    rewards: { coins: 30 },
    penalties: { energy: -15 },
  },
  {
    id: 'eagle', name: '鹰袭', icon: '🦅',
    desc: '秃鹰俯冲！长按遮挡头部',
    minKm: 800, zones: [6, 7, 8, 12], weight: 10,
    gamePage: null,
    rewards: { coins: 20 },
    penalties: { mood: -15 },
  },
  {
    id: 'mudslide', name: '泥石流', icon: '🌊',
    desc: '泥石流！倒计时内冲过危险路段',
    minKm: 1100, zones: [10], weight: 15,
    gamePage: '/games/avalanche/index',
    rewards: { coins: 100, skipNextEvent: true },
    penalties: { kmBack: 40, energy: -10 },
  },
  {
    id: 'tibetan', name: '遇到藏民', icon: '🙏',
    desc: '遇到了友好的藏民，回答文化知识获取补给',
    minKm: 300, zones: [3, 4, 5, 9, 11], weight: 20,
    gamePage: null,
    rewards: { coins: 40, item: 'supply_pack', mood: 10 },
    penalties: { coins: -0 },  // 无惩罚，纯正面事件
  },
  {
    id: 'supply', name: '补给站', icon: '☕',
    desc: '路边补给站！随机获取物资',
    minKm: 0, zones: 'all', weight: 25,
    gamePage: null,
    rewards: { item: 'random_supply', energy: 10 },
    penalties: {},
  },
];
