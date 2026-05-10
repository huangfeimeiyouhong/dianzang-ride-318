/**
 * 站点特色大事件系统
 * 到达特定站点时触发的独特剧情事件
 * 与随机事件不同，特色事件是站点绑定的确定性内容
 */

import { PlayerData } from '../models/player';

export interface SpecialEvent {
  id: string;
  stationIndex: number;
  name: string;
  icon: string;
  desc: string;
  type: 'story' | 'challenge' | 'celebration';
  rewards: SpecialEventReward;
  choices?: SpecialEventChoice[];
}

export interface SpecialEventReward {
  coins?: number;
  energy?: number;
  mood?: number;
  item?: string;
  itemName?: string;
  title?: string;
  adaptBoost?: number;
}

export interface SpecialEventChoice {
  text: string;
  desc: string;
  reward: SpecialEventReward;
  penalty?: { energy?: number; mood?: number };
}

const SPECIAL_EVENTS: SpecialEvent[] = [
  {
    id: 'sunrise_golden',
    stationIndex: 3,
    name: '日照金山',
    icon: '🌅',
    desc: '凌晨五点，你裹着厚外套站在飞来寺观景台。梅里雪山的卡瓦格博峰在黑暗中沉默矗立...\n\n突然，第一缕阳光刺破云层，雪山之巅泛起金光，整座山峰仿佛镀上了一层黄金！这一刻的壮美让你忘记了所有疲惫。',
    type: 'celebration',
    rewards: { coins: 50, mood: 20, item: 'warm_clothing', itemName: '保暖衣物', title: '追光者' },
    choices: [
      {
        text: '拍照留念',
        desc: '用手机记录下这壮丽的一刻',
        reward: { coins: 20, mood: 10 },
      },
      {
        text: '静心感悟',
        desc: '闭上眼睛，用心感受雪山的庄严',
        reward: { mood: 25, adaptBoost: 2 },
      },
      {
        text: '虔诚祈福',
        desc: '按藏传佛教传统，面向梅里雪山虔诚祈福',
        reward: { mood: 15, adaptBoost: 5, coins: 30 },
      },
    ],
  },
  {
    id: 'salt_harvest',
    stationIndex: 4,
    name: '千年盐田',
    icon: '🧂',
    desc: '澜沧江峡谷两岸，层层叠叠的盐田在阳光下闪烁。一位年迈的藏族阿妈正在用木桶从盐井中汲水，邀请你一起体验这传承千年的制盐工艺。',
    type: 'story',
    rewards: { coins: 30, mood: 10, item: 'tsampa', itemName: '糌粑' },
    choices: [
      {
        text: '帮忙收盐',
        desc: '卷起袖子帮阿妈干农活，体验盐田生活',
        reward: { coins: 40, mood: 15, item: 'tsampa', itemName: '糌粑' },
      },
      {
        text: '在一旁观看',
        desc: '安静地坐在旁边，听阿妈讲述盐田的故事',
        reward: { mood: 20 },
      },
    ],
  },
  {
    id: 'tongmai_gauntlet',
    stationIndex: 10,
    name: '通麦天险挑战',
    icon: '⚠️',
    desc: '通麦——全程最危险的路段。塌方碎石散落路间，泥石流的痕迹随处可见。你必须打起十二分精神，小心翼翼地通过这片死亡地带。',
    type: 'challenge',
    rewards: { coins: 80, title: '天险勇者' },
    choices: [
      {
        text: '快速通过',
        desc: '猛踩踏板快速冲过危险区域，赌一把运气',
        reward: { coins: 60, mood: 10 },
        penalty: { energy: -20 },
      },
      {
        text: '谨慎前行',
        desc: '下车推行，每一步都仔细观察路面状况',
        reward: { coins: 40, mood: 5 },
        penalty: { energy: -10 },
      },
      {
        text: '等待队友',
        desc: '与其他骑友组队，互相照应着通过',
        reward: { coins: 50, mood: 15 },
      },
    ],
  },
  {
    id: 'peach_festival',
    stationIndex: 11,
    name: '林芝桃花节',
    icon: '🌺',
    desc: '三月正是林芝最美的时候！雅鲁藏布江畔，漫山遍野的桃花盛开，粉色花瓣随风飘落，远处是皑皑雪山。村民们身着盛装，载歌载舞庆祝桃花节。',
    type: 'celebration',
    rewards: { coins: 40, mood: 25, item: 'energy_drink', itemName: '能量饮料', title: '桃花骑士' },
    choices: [
      {
        text: '加入歌舞',
        desc: '和村民们一起跳锅庄舞，尽情狂欢',
        reward: { mood: 30, coins: 20 },
      },
      {
        text: '赏花休息',
        desc: '在桃花树下铺上垫子，好好休息一天',
        reward: { energy: 30, mood: 20 },
      },
      {
        text: '参加骑行比赛',
        desc: '桃花节有传统骑行竞速活动，参加赢取奖品！',
        reward: { coins: 60, mood: 10 },
        penalty: { energy: -15 },
      },
    ],
  },
  {
    id: 'finale',
    stationIndex: 13,
    name: '拉萨终点庆典',
    icon: '🏆',
    desc: '布达拉宫！经过2100公里的艰苦骑行，你终于到达了终点！\n\n金碧辉煌的宫殿矗立在红山之上，蓝天白云下格外庄严。其他骑友已经在此等候，大家相拥而泣。这不是结束，而是人生中一段永难忘怀的传奇。',
    type: 'celebration',
    rewards: { coins: 200, mood: 50, title: '滇藏勇士' },
    choices: [
      {
        text: '登顶布达拉宫',
        desc: '一步一步攀登布达拉宫的台阶，在最高处俯瞰拉萨',
        reward: { coins: 100, mood: 30, title: '拉萨朝圣者' },
      },
      {
        text: '与骑友庆祝',
        desc: '和一起完成旅途的骑友们举杯庆祝',
        reward: { mood: 40, coins: 80 },
      },
      {
        text: '独自沉思',
        desc: '坐在大昭寺前，回想这一路的点点滴滴',
        reward: { mood: 50, adaptBoost: 10 },
      },
    ],
  },
];

/** 获取站点对应的特色事件 */
export function getSpecialEvent(stationIndex: number): SpecialEvent | undefined {
  return SPECIAL_EVENTS.find(e => e.stationIndex === stationIndex);
}

/** 检查特色事件是否已完成 */
export function isSpecialEventCompleted(player: PlayerData, eventId: string): boolean {
  const completed = (player as any).completedSpecialEvents || [];
  return completed.includes(eventId);
}

/**
 * 完成特色事件
 * @returns 获得的奖励描述
 */
export function completeSpecialEvent(
  player: PlayerData,
  eventId: string,
  choiceIndex?: number
): {
  success: boolean;
  message: string;
  reward: SpecialEventReward;
  penalty?: { energy?: number; mood?: number };
} {
  const event = SPECIAL_EVENTS.find(e => e.id === eventId);
  if (!event) return { success: false, message: '事件不存在', reward: {} };

  if (isSpecialEventCompleted(player, eventId)) {
    return { success: false, message: '此事件已完成', reward: {} };
  }

  // 确定奖励
  let reward: SpecialEventReward = { ...event.rewards };
  let penalty: { energy?: number; mood?: number } | undefined;

  if (event.choices && choiceIndex !== undefined && choiceIndex < event.choices.length) {
    const choice = event.choices[choiceIndex];
    reward = { ...choice.reward };
    penalty = choice.penalty;
  }

  // 应用奖励
  if (reward.coins) player.inventory.coins += reward.coins;
  if (reward.energy) player.stats.energy = Math.min(200, player.stats.energy + reward.energy);
  if (reward.mood) player.stats.mood = Math.min(100, player.stats.mood + reward.mood);
  if (reward.adaptBoost) player.stats.altitudeAdapt = Math.min(50, player.stats.altitudeAdapt + reward.adaptBoost);
  if (reward.title) player.rider.title = reward.title;

  // 应用物品奖励
  if (reward.item) {
    const existing = player.inventory.items.find(i => i.id === reward.item);
    if (existing) { existing.count++; }
    else { player.inventory.items.push({ id: reward.item!, count: 1 }); }
  }

  // 应用惩罚
  if (penalty) {
    if (penalty.energy) player.stats.energy = Math.max(0, player.stats.energy + penalty.energy);
    if (penalty.mood) player.stats.mood = Math.max(0, player.stats.mood + penalty.mood);
  }

  // 标记已完成
  const completed = (player as any).completedSpecialEvents || [];
  if (!completed.includes(eventId)) {
    completed.push(eventId);
    (player as any).completedSpecialEvents = completed;
  }

  // 构建奖励描述
  const parts: string[] = [];
  if (reward.coins) parts.push(`+${reward.coins}金币`);
  if (reward.energy) parts.push(`+${reward.energy}体能`);
  if (reward.mood) parts.push(`+${reward.mood}心情`);
  if (reward.adaptBoost) parts.push(`+${reward.adaptBoost}适应度`);
  if (reward.itemName) parts.push(`+${reward.itemName}`);
  if (reward.title) parts.push(`称号:${reward.title}`);
  if (penalty?.energy) parts.push(`${penalty.energy}体能`);
  if (penalty?.mood) parts.push(`${penalty.mood}心情`);

  return {
    success: true,
    message: parts.join('  '),
    reward,
    penalty,
  };
}

/** 获取所有特色事件列表 */
export function getAllSpecialEvents(): SpecialEvent[] {
  return SPECIAL_EVENTS;
}
