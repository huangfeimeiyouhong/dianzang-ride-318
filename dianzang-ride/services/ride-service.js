/**
 * 骑行里程计算服务
 * 根据体能、海拔、装备计算实际可骑行距离和消耗
 */
import { STATIONS } from '../models/station';
import { getDurabilityPenalty } from './equip-service';
import { getWeatherCostMult } from './weather-service';
const MAX_KM_PER_RIDE = 80; // 单次骑行上限
/** 计算海拔消耗系数 */
function getAltitudeCost(elevation) {
    if (elevation > 4000)
        return 1.5;
    if (elevation > 3000)
        return 1.2;
    return 1.0;
}
/** 计算每体能点推进的公里数 */
function getKmPerEnergy(elevation) {
    if (elevation > 3500)
        return 0.5;
    if (elevation > 3000)
        return 1.0;
    return 2.0;
}
/** 执行一次骑行计算 */
export function calculateRide(player) {
    const { progress, stats, equipment } = player;
    const current = STATIONS[progress.currentStation];
    const next = progress.currentStation < STATIONS.length - 1
        ? STATIONS[progress.currentStation + 1]
        : null;
    if (!next || stats.energy <= 0) {
        return { actualKm: 0, energyCost: 0, costMultiplier: 1, reachedNext: false, newStation: progress.currentStation, coinsEarned: 0 };
    }
    // 取当前段平均海拔
    const avgElev = (current.elev + next.elev) / 2;
    // 基础消耗系数
    let costMultiplier = getAltitudeCost(avgElev);
    // 高原适应度减免
    costMultiplier *= (1 - stats.altitudeAdapt / 100);
    // 装备减免
    const hasKneeGuard = equipment.some(e => e.id === 'knee_guard');
    if (hasKneeGuard)
        costMultiplier *= 0.9;
    // 耐久度惩罚（装备磨损时消耗增加）
    costMultiplier *= getDurabilityPenalty(player);
    // 天气影响
    costMultiplier *= getWeatherCostMult(player);
    // 确保系数不低于 0.5
    costMultiplier = Math.max(costMultiplier, 0.5);
    // 每体能点可推进的距离
    let kmPerEnergy = getKmPerEnergy(avgElev);
    // 公路车平路速度加成
    const hasRoadBike = equipment.some(e => e.id === 'road_bike' && e.durability > 0);
    if (hasRoadBike && avgElev < 3000) {
        kmPerEnergy *= 1.3;
    }
    // 本次可骑行上限
    const maxKmByEnergy = Math.floor(stats.energy / costMultiplier * kmPerEnergy);
    const distToNext = next.km - progress.km;
    const actualKm = Math.min(maxKmByEnergy, distToNext, MAX_KM_PER_RIDE);
    // 实际消耗体能
    const energyCost = Math.ceil(actualKm / kmPerEnergy * costMultiplier);
    // 是否到达下一站
    const newKm = progress.km + actualKm;
    let newStation = progress.currentStation;
    let reachedNext = false;
    if (newKm >= next.km) {
        newStation = progress.currentStation + 1;
        reachedNext = true;
    }
    // 计算金币奖励：每骑行 10km = +5 金币，上限 40/次；到站额外 +30
    let coinsEarned = Math.min(Math.floor(actualKm / 10) * 5, 40);
    if (reachedNext)
        coinsEarned += 30;
    // 高原适应度增长：海拔 >3000m 骑行 50km +3，>4000m 骑行 50km +5
    let adaptGain = 0;
    if (actualKm > 0 && avgElev > 3000) {
        const adaptPer50km = avgElev > 4000 ? 5 : 3;
        adaptGain = Math.floor(actualKm / 50) * adaptPer50km;
        stats.altitudeAdapt = Math.min(50, stats.altitudeAdapt + adaptGain);
    }
    return { actualKm, energyCost, costMultiplier, reachedNext, newStation, coinsEarned };
}
/** 获取当前路段描述文字 */
export function getTerrainDesc(elevation) {
    if (elevation > 4000)
        return '极高海拔，呼吸困难';
    if (elevation > 3500)
        return '高海拔，体能消耗加倍';
    if (elevation > 3000)
        return '高原路段，注意高反';
    return '平缓路段，适合骑行';
}
