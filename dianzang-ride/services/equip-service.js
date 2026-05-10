/**
 * 装备管理服务
 */
import { EQUIPMENT_LIST, getEquipment } from '../models/equipment';
/** 获取玩家已装备列表（完整信息） */
export function getPlayerEquipment(player) {
    return player.equipment
        .map(e => {
        const def = getEquipment(e.id);
        if (!def)
            return null;
        return Object.assign(Object.assign({}, def), { durability: e.durability });
    })
        .filter(Boolean);
}
/** 获取当前站点可购买的装备 */
export function getShopItems(stationIndex) {
    return EQUIPMENT_LIST.filter(e => {
        if (!e.price)
            return false;
        if (e.unlockStation !== undefined && e.unlockStation > stationIndex)
            return false;
        return true;
    });
}
/** 购买装备 */
export function buyEquipment(player, equipId) {
    const equip = getEquipment(equipId);
    if (!equip || !equip.price)
        return { success: false, message: '无效装备' };
    if (player.inventory.coins < equip.price) {
        return { success: false, message: '金币不足' };
    }
    // 检查是否已拥有（非消耗品）
    if (equip.type !== 'consumable') {
        const owned = player.equipment.find(e => e.id === equipId);
        if (owned)
            return { success: false, message: '已拥有此装备' };
    }
    // 扣除金币
    player.inventory.coins -= equip.price;
    if (equip.type === 'consumable') {
        // 消耗品加入背包
        const existing = player.inventory.items.find(i => i.id === equipId);
        if (existing) {
            existing.count++;
        }
        else {
            player.inventory.items.push({ id: equipId, count: 1 });
        }
    }
    else {
        // 装备直接穿戴
        player.equipment.push({ id: equipId, durability: 100 });
    }
    return { success: true, message: `获得 ${equip.name}` };
}
/** 使用消耗品 */
export function useConsumable(player, itemId) {
    const item = player.inventory.items.find(i => i.id === itemId);
    if (!item || item.count <= 0)
        return { success: false, message: '物品不足' };
    const equip = getEquipment(itemId);
    if (!equip)
        return { success: false, message: '无效物品' };
    item.count--;
    if (item.count <= 0) {
        player.inventory.items = player.inventory.items.filter(i => i.id !== itemId);
    }
    const effect = equip.effect;
    // 恢复体能
    if (effect.energyRestore) {
        player.stats.energy = Math.min(200, player.stats.energy + effect.energyRestore);
    }
    // 恢复心情
    if (effect.moodRestore) {
        player.stats.mood = Math.min(100, player.stats.mood + effect.moodRestore);
    }
    // 高原适应度提升
    if (effect.adaptBoost) {
        player.stats.altitudeAdapt = Math.min(50, player.stats.altitudeAdapt + effect.adaptBoost);
    }
    // 修复装备耐久
    if (effect.repairDurability) {
        for (const eq of player.equipment) {
            eq.durability = 100;
        }
        player.stats.durability = 100;
    }
    // 天气免疫（标记到 stats，由 ride-service 读取）
    if (effect.weatherImmune) {
        player.stats.weatherImmune = true;
    }
    return { success: true, message: `使用了 ${equip.name}` };
}
/** 降低装备耐久（所有装备，非仅自行车） */
export function degradeEquipment(player, amount) {
    for (const eq of player.equipment) {
        eq.durability = Math.max(0, eq.durability - amount);
    }
    // 更新整体耐久状态为最低值
    const minDur = player.equipment.reduce((min, eq) => Math.min(min, eq.durability), 100);
    player.stats.durability = minDur;
}
/** 获取当前耐久度惩罚系数（耐久低时增加消耗） */
export function getDurabilityPenalty(player) {
    const minDur = player.stats.durability;
    if (minDur < 20)
        return 1.5; // 严重磨损：消耗 x1.5
    if (minDur < 50)
        return 1.2; // 轻度磨损：消耗 x1.2
    return 1.0;
}
/** 检查耐久是否过低（触发警告） */
export function isDurabilityLow(player) {
    return player.stats.durability < 30;
}
/** 检查是否有免疫某事件的装备 */
export function isImmuneToEvent(player, eventId) {
    return player.equipment.some(eq => {
        const def = getEquipment(eq.id);
        return (def === null || def === void 0 ? void 0 : def.effect.immuneEvent) === eventId && eq.durability > 0;
    });
}
