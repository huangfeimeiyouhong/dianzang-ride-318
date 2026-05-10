/**
 * 天气系统
 * 每天生成当天天气，影响骑行消耗和事件概率
 */

import { PlayerData } from '../models/player';

export type WeatherType = 'sunny' | 'cloudy' | 'light_rain' | 'heavy_rain' | 'snow' | 'blizzard' | 'wind';

export interface Weather {
  type: WeatherType;
  name: string;
  icon: string;
  desc: string;
  costMult: number;      // 体能消耗倍率
  moodEffect: number;     // 心情变化
  eventMod: Record<string, number>; // 事件概率修正
}

export const WEATHER_LIST: Record<WeatherType, Weather> = {
  sunny: {
    type: 'sunny', name: '晴天', icon: '☀️', desc: '万里无云，适合骑行',
    costMult: 1.0, moodEffect: 5,
    eventMod: {},
  },
  cloudy: {
    type: 'cloudy', name: '多云', icon: '⛅', desc: '薄云遮日，温度适中',
    costMult: 1.0, moodEffect: 0,
    eventMod: {},
  },
  light_rain: {
    type: 'light_rain', name: '小雨', icon: '🌦', desc: '淅沥小雨，注意路滑',
    costMult: 1.1, moodEffect: -3,
    eventMod: { rock: -0.2, flat_tire: 0.1 },
  },
  heavy_rain: {
    type: 'heavy_rain', name: '大雨', icon: '🌧', desc: '倾盆大雨，视野不佳',
    costMult: 1.3, moodEffect: -8,
    eventMod: { rock: -0.3, flat_tire: 0.2 },
  },
  snow: {
    type: 'snow', name: '小雪', icon: '🌨', desc: '飘着小雪，路面湿滑',
    costMult: 1.2, moodEffect: -5,
    eventMod: { avalanche: 0.2 },
  },
  blizzard: {
    type: 'blizzard', name: '暴风雪', icon: '❄️', desc: '暴风雪来袭！极度危险',
    costMult: 1.5, moodEffect: -15,
    eventMod: { blizzard: 0.4, avalanche: 0.3 },
  },
  wind: {
    type: 'wind', name: '大风', icon: '💨', desc: '横风呼啸，保持平衡',
    costMult: 1.2, moodEffect: -5,
    eventMod: { wind: 0.3 },
  },
};

// 天气生成权重
const WEATHER_WEIGHTS: { type: WeatherType; weight: number }[] = [
  { type: 'sunny', weight: 35 },
  { type: 'cloudy', weight: 25 },
  { type: 'light_rain', weight: 15 },
  { type: 'snow', weight: 8 },
  { type: 'heavy_rain', weight: 5 },
  { type: 'wind', weight: 7 },
  { type: 'blizzard', weight: 5 },
];

/** 获取今天的日期字符串 */
function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 生成或获取今日天气 */
export function getTodayWeather(player: PlayerData): Weather {
  const today = getTodayStr();

  // 如果今天已生成过且站点没变，直接返回
  if ((player.stats as any).todayWeather && (player.stats as any).lastWeatherDate === today) {
    return WEATHER_LIST[(player.stats as any).todayWeather as WeatherType];
  }

  // 根据当前海拔调整天气概率
  const station = require('../models/station').STATIONS[player.progress.currentStation];
  const elevation = station ? station.elev : 2000;

  // 高海拔更多雪和暴风雪，低海拔更多雨
  let weights = WEATHER_WEIGHTS.map(w => ({ ...w }));
  if (elevation > 3000) {
    weights = weights.map(w => {
      if (w.type === 'snow') return { ...w, weight: w.weight * 2 };
      if (w.type === 'blizzard') return { ...w, weight: w.weight * 2 };
      if (w.type === 'light_rain') return { ...w, weight: w.weight * 0.5 };
      if (w.type === 'heavy_rain') return { ...w, weight: w.weight * 0.5 };
      return w;
    });
  }

  // 加权随机选择
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let rand = Math.random() * totalWeight;
  let chosen: WeatherType = 'sunny';
  for (const w of weights) {
    rand -= w.weight;
    if (rand <= 0) { chosen = w.type; break; }
  }

  // 保存到玩家数据
  (player.stats as any).todayWeather = chosen;
  (player.stats as any).lastWeatherDate = today;

  // 心情影响
  player.stats.mood = Math.max(0, Math.min(100, player.stats.mood + WEATHER_LIST[chosen].moodEffect));

  return WEATHER_LIST[chosen];
}

/** 获取天气对骑行消耗的倍率 */
export function getWeatherCostMult(player: PlayerData): number {
  const weather = getTodayWeather(player);
  if (player.stats.weatherImmune) return 1.0; // 保暖衣物免疫天气
  return weather.costMult;
}

/** 获取天气对特定事件概率的修正 */
export function getWeatherEventMod(player: PlayerData, eventId: string): number {
  const weather = getTodayWeather(player);
  return weather.eventMod[eventId] || 0;
}
