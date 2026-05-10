/**
 * 随机事件触发引擎
 * 根据当前位置、区段、心情值等计算触发的事件
 */

import { GameEvent, EVENT_POOL } from '../models/event';
import { PlayerData } from '../models/player';
import { STATIONS } from '../models/station';

const MIN_EVENT_DISTANCE = 30;  // 最短触发间隔 30km
const MAX_EVENT_DISTANCE = 50;  // 超过 50km 必定触发

export interface EventTriggerResult {
  triggered: boolean;
  event: GameEvent | null;
  difficulty?: number;
}

/** 根据站点索引计算难度等级 1-4 */
export function getDifficulty(stationIndex: number): number {
  if (stationIndex <= 3) return 1;  // 简单
  if (stationIndex <= 7) return 2;  // 普通
  if (stationIndex <= 10) return 3; // 困难
  return 4;                        // 噩梦
}

/** 尝试触发随机事件 */
export function tryTriggerEvent(player: PlayerData): EventTriggerResult {
  const { progress, stats, equipment } = player;
  const distSinceLast = progress.km - progress.lastEventKm;

  // 跳过下一个事件（如泥石流成功后的奖励）
  if (progress.skipNextEvent) {
    progress.skipNextEvent = false;
    progress.lastEventKm = progress.km;
    return { triggered: false, event: null };
  }

  // 未达到最短间隔
  if (distSinceLast < MIN_EVENT_DISTANCE) {
    return { triggered: false, event: null };
  }

  // 触发概率随距离线性增加
  const triggerChance = Math.min((distSinceLast - MIN_EVENT_DISTANCE) / (MAX_EVENT_DISTANCE - MIN_EVENT_DISTANCE), 1.0);

  // 当前站点危险等级加成
  const station = STATIONS[progress.currentStation];
  const dangerBonus = station.dangerLevel * 0.1;

  // 心情值影响：心情越低，负面事件越容易触发
  const moodFactor = stats.mood < 50 ? 1.3 : 1.0;

  // 连续失败保护：上次失败后，下次正面事件概率 +30%
  const positiveBoost = progress.lastEventFailed ? 0.3 : 0;

  const finalChance = Math.min(triggerChance * moodFactor + dangerBonus + positiveBoost, 1.0);

  if (Math.random() > finalChance) {
    return { triggered: false, event: null };
  }

  // 新手保护区：前 100km 只触发正面事件（惩罚体能 ≤ -5 的过滤掉）
  const isBeginner = progress.km < 100;

  // 筛选可触发的事件
  const candidates = EVENT_POOL.filter(e => {
    // 新手保护：只触发正面事件
    if (isBeginner && e.penalties.energy && (e.penalties.energy as number) < -5) return false;

    // 里程限制
    if (progress.km < e.minKm) return false;

    // 区段限制
    if (e.zones !== 'all' && !e.zones.includes(progress.currentStation)) return false;

    // 装备免疫
    const isImmune = equipment.some(eq => {
      if (eq.id === 'puncture_proof_tire' && e.id === 'flat_tire') return true;
      if (eq.id === 'dog_repeller' && e.id === 'dog') return true;
      return false;
    });
    if (isImmune) return false;

    return true;
  });

  if (candidates.length === 0) {
    return { triggered: false, event: null };
  }

  // 加权随机抽取
  const event = weightedRandom(candidates);
  return { triggered: true, event, difficulty: getDifficulty(progress.currentStation) };
}

/** 加权随机选择 */
function weightedRandom(events: GameEvent[]): GameEvent {
  const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const event of events) {
    rand -= event.weight;
    if (rand <= 0) return event;
  }

  return events[events.length - 1];
}

/** 应用事件奖励 */
export function applyReward(player: PlayerData, event: GameEvent): PlayerData {
  const r = event.rewards;
  if (r.energy) player.stats.energy = Math.min(200, player.stats.energy + r.energy);
  if (r.coins) player.inventory.coins += r.coins;
  if (r.mood) player.stats.mood = Math.min(100, player.stats.mood + r.mood);

  // 物品奖励：添加到背包
  if (r.item) {
    const itemMap: Record<string, string[]> = {
      rare_supply: ['energy_drink', 'oxygen_bottle', 'warm_clothing', 'tsampa'],
      supply_pack: ['energy_drink', 'oxygen_bottle', 'warm_clothing'],
      random_supply: ['energy_drink', 'oxygen_bottle', 'repair_kit', 'warm_clothing', 'tsampa'],
    };
    if (itemMap[r.item]) {
      // 稀有/补给包/随机补给：随机获得其中一件
      const pool = itemMap[r.item];
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      const existing = player.inventory.items.find(i => i.id === chosen);
      if (existing) {
        existing.count++;
      } else {
        player.inventory.items.push({ id: chosen, count: 1 });
      }
    } else {
      // 直接物品（如 energy_drink、oxygen_bottle 等具体物品）
      const existing = player.inventory.items.find(i => i.id === r.item);
      if (existing) {
        existing.count++;
      } else {
        player.inventory.items.push({ id: r.item, count: 1 });
      }
    }
  }

  // 跳过下一个事件（泥石流等特殊奖励）
  if (r.skipNextEvent) {
    player.progress.skipNextEvent = true;
  }

  // 重置失败标记（奖励 = 成功）
  player.progress.lastEventFailed = false;

  return player;
}

/** 应用事件惩罚 */
export function applyPenalty(player: PlayerData, event: GameEvent): PlayerData {
  const p = event.penalties;

  // 安全帽减伤：落石事件伤害减半
  let dmgMultiplier = 1;
  if (p.energy && event.id === 'rock') {
    const hasHelmet = player.equipment.some(eq => eq.id === 'helmet_basic' && eq.durability > 0);
    if (hasHelmet) dmgMultiplier = 0.5;
  }

  if (p.energy) player.stats.energy = Math.max(0, player.stats.energy + Math.round(p.energy * dmgMultiplier));
  if (p.mood) player.stats.mood = Math.max(0, player.stats.mood + p.mood);
  if (p.durability) player.stats.durability = Math.max(0, player.stats.durability + p.durability);

  // 里程倒退
  if (p.kmBack) {
    const stationKm = event.penalties.kmBack || 0;
    player.progress.km = Math.max(
      STATIONS[player.progress.currentStation].km,
      player.progress.km - stationKm
    );
  }

  // 高原反应状态标记（雪崩等触发）
  if (p.triggerHighAlt) {
    player.stats.highAltSickness = true;
  }

  // 标记上次事件失败（触发保护机制）
  player.progress.lastEventFailed = true;

  return player;
}
