/**
 * 成就/称号系统
 * 检查玩家是否满足成就条件，自动解锁并发放奖励
 */

import { PlayerData } from '../models/player';
import { STATIONS } from '../models/station';

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  condition: (player: PlayerData) => boolean;
  reward: { coins?: number; title?: string; avatarFrame?: string };
}

export const ACHIEVEMENT_LIST: Achievement[] = [
  {
    id: 'first_ride',
    name: '初出茅庐',
    desc: '完成第一次骑行',
    icon: '🚴',
    condition: (p) => (p.totalDistance || 0) > 0,
    reward: { coins: 20, title: '新手骑手' },
  },
  {
    id: 'reach_lijiang',
    name: '丽江初见',
    desc: '到达丽江',
    icon: '🏔',
    condition: (p) => p.progress.currentStation >= 1,
    reward: { coins: 30 },
  },
  {
    id: 'first_summit',
    name: '高原新客',
    desc: '到达海拔 3000m 以上的站点',
    icon: '⛰️',
    condition: (p) => {
      const station = STATIONS[p.progress.currentStation];
      return station && station.elev >= 3000;
    },
    reward: { coins: 50, title: '高原新客' },
  },
  {
    id: 'altitude_master',
    name: '高原老手',
    desc: '高原适应度达到 30%',
    icon: '🫁',
    condition: (p) => p.stats.altitudeAdapt >= 30,
    reward: { coins: 80, title: '高原老手' },
  },
  {
    id: 'survive_storm',
    name: '风暴骑士',
    desc: '在暴风雪事件中存活',
    icon: '🌧',
    condition: (p) => p.achievements.includes('_blizzard_win'),
    reward: { coins: 60, title: '风暴骑士' },
  },
  {
    id: 'streak_7',
    name: '周骑行者',
    desc: '连续骑行 7 天',
    icon: '🔥',
    condition: (p) => (p.loginStreak || 0) >= 7,
    reward: { coins: 100, title: '周骑行者' },
  },
  {
    id: 'streak_14',
    name: '半月骑侠',
    desc: '连续骑行 14 天',
    icon: '🔥',
    condition: (p) => (p.loginStreak || 0) >= 14,
    reward: { coins: 150, title: '半月骑侠' },
  },
  {
    id: 'rich_cyclist',
    name: '装备党',
    desc: '拥有 4 件以上装备',
    icon: '🎒',
    condition: (p) => p.equipment.length >= 4,
    reward: { coins: 50, title: '装备党' },
  },
  {
    id: 'event_master',
    name: '历劫骑手',
    desc: '累计成功通过 10 次事件',
    icon: '⭐',
    condition: (p) => (p.totalEventsWon || 0) >= 10,
    reward: { coins: 80, title: '历劫骑手' },
  },
  {
    id: 'speed_demon',
    name: '追风者',
    desc: '单日骑行超过 60km',
    icon: '💨',
    condition: (p) => false, // 需要在骑行完成时检查，通过 extra context
    reward: { coins: 60, title: '追风者' },
  },
  {
    id: 'iron_will',
    name: '铁人骑手',
    desc: '连续 3 天不休',
    icon: '💪',
    condition: (p) => (p.loginStreak || 0) >= 3,
    reward: { coins: 100, title: '铁人骑手' },
  },
  {
    id: 'explorer',
    name: '滇藏行者',
    desc: '到达全部 13 个站点',
    icon: '🗺',
    condition: (p) => p.progress.currentStation >= 13,
    reward: { coins: 200, title: '滇藏行者' },
  },
  {
    id: 'lhasa_hero',
    name: '拉萨勇士',
    desc: '到达拉萨！',
    icon: '🏆',
    condition: (p) => p.progress.currentStation >= 13,
    reward: { coins: 300, title: '拉萨勇士', avatarFrame: 'lhasa' },
  },
];

/** 检查并解锁新成就，返回新获得的成就列表 */
export function checkAchievements(player: PlayerData, context?: { dailyKm?: number }): Achievement[] {
  const newOnes: Achievement[] = [];

  for (const ach of ACHIEVEMENT_LIST) {
    // 跳过已获得的成就
    if (player.achievements.includes(ach.id)) continue;

    // 特殊处理：speed_demon 需要上下文
    let met = false;
    if (ach.id === 'speed_demon' && context?.dailyKm && context.dailyKm > 60) {
      met = true;
    } else {
      met = ach.condition(player);
    }

    if (met) {
      player.achievements.push(ach.id);

      // 发放奖励
      if (ach.reward.coins) {
        player.inventory.coins += ach.reward.coins;
      }
      if (ach.reward.title) {
        player.rider.title = ach.reward.title;
      }
      if (ach.reward.avatarFrame) {
        player.rider.titleFrame = ach.reward.avatarFrame;
      }

      newOnes.push(ach);
    }
  }

  return newOnes;
}

/** 获取已获得的成就详情 */
export function getUnlockedAchievements(player: PlayerData): Achievement[] {
  return ACHIEVEMENT_LIST.filter(a => player.achievements.includes(a.id));
}

/** 获取未获得的成就详情 */
export function getLockedAchievements(player: PlayerData): Achievement[] {
  return ACHIEVEMENT_LIST.filter(a => !player.achievements.includes(a.id));
}
