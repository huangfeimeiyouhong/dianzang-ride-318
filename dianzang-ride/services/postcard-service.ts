/**
 * 明信片收集服务
 * 到达新站点时自动解锁对应明信片
 */

import { PlayerData } from '../models/player';
import { Postcard, POSTCARD_LIST, getPostcard } from '../models/postcard';

const POSTCARD_KEY = 'collectedPostcards';

/** 获取玩家已收集的明信片ID列表 */
export function getCollectedPostcards(player: PlayerData): string[] {
  return (player as any)[POSTCARD_KEY] || [];
}

/** 检查是否已收集某站点的明信片 */
export function hasPostcard(player: PlayerData, stationIndex: number): boolean {
  const collected = getCollectedPostcards(player);
  return collected.includes(`station_${stationIndex}`);
}

/**
 * 到达新站点时收集明信片
 * @returns 新解锁的明信片，null 表示已拥有或无对应明信片
 */
export function collectPostcard(player: PlayerData, stationIndex: number): Postcard | null {
  if (hasPostcard(player, stationIndex)) return null;

  const postcard = getPostcard(stationIndex);
  if (!postcard) return null;

  const collected = getCollectedPostcards(player);
  collected.push(postcard.id);
  (player as any)[POSTCARD_KEY] = collected;

  // 传说级明信片额外奖励
  if (postcard.rarity === 'legendary') {
    player.inventory.coins += 20;
  }

  return postcard;
}

/** 获取收集进度 */
export function getPostcardProgress(player: PlayerData): {
  collected: number;
  total: number;
  percent: number;
} {
  const collected = getCollectedPostcards(player).length;
  const total = POSTCARD_LIST.length;
  return {
    collected,
    total,
    percent: Math.floor((collected / total) * 100),
  };
}

/** 获取所有明信片（含收集状态） */
export function getAllPostcardsWithStatus(player: PlayerData): (Postcard & { collected: boolean })[] {
  const collectedIds = getCollectedPostcards(player);
  return POSTCARD_LIST.map(p => ({
    ...p,
    collected: collectedIds.includes(p.id),
  }));
}
