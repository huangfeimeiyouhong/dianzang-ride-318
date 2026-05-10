export const EQUIPMENT_LIST = [
    {
        id: 'mountain_bike', name: '登山车', icon: '🚲', type: 'bike',
        desc: '基础登山车，适合各种路况',
        effect: {},
        obtainMethod: '初始装备',
    },
    {
        id: 'road_bike', name: '公路车', icon: '🚴', type: 'bike',
        desc: '轻量公路车，平路效率极高',
        effect: { flatSpeedBonus: 1.3 },
        obtainMethod: '丽江商店购买',
        price: 120, unlockStation: 1,
    },
    {
        id: 'puncture_proof_tire', name: '防爆胎', icon: '⭕', type: 'gear',
        desc: '加厚轮胎，不再担心扎胎',
        effect: { immuneEvent: 'flat_tire' },
        obtainMethod: '芒康铁匠铺',
        price: 150, unlockStation: 5,
    },
    {
        id: 'knee_guard', name: '护膝', icon: '🦵', type: 'gear',
        desc: '专业骑行护膝，减少体能消耗',
        effect: { energyCostReduction: 0.1 },
        obtainMethod: '商店购买',
        price: 100, unlockStation: 2,
    },
    {
        id: 'dog_repeller', name: '狗驱器', icon: '📢', type: 'gear',
        desc: '超声波驱狗器，野狗绕道走',
        effect: { immuneEvent: 'dog' },
        obtainMethod: '任意商店购买',
        price: 80,
    },
    {
        id: 'helmet_basic', name: '安全帽', icon: '⛑️', type: 'gear',
        desc: '基础安全帽，减少落石伤害',
        effect: { rockDmgReduction: 0.5 },
        obtainMethod: '初始装备',
    },
    {
        id: 'energy_drink', name: '能量饮料', icon: '🥤', type: 'consumable',
        desc: '恢复 30 体能',
        effect: { energyRestore: 30 },
        obtainMethod: '商店购买 / 事件掉落',
        price: 30,
    },
    {
        id: 'oxygen_bottle', name: '氧气瓶', icon: '🫁', type: 'consumable',
        desc: '缓解高原反应，恢复 50 体能 + 3 适应度',
        effect: { energyRestore: 50, adaptBoost: 3 },
        obtainMethod: '商店购买',
        price: 60, unlockStation: 2,
    },
    {
        id: 'repair_kit', name: '修车工具', icon: '🔧', type: 'consumable',
        desc: '修复所有装备耐久至 100%',
        effect: { repairDurability: true },
        obtainMethod: '商店购买 / 事件掉落',
        price: 40,
    },
    {
        id: 'warm_clothing', name: '保暖衣物', icon: '🧥', type: 'consumable',
        desc: '免天气惩罚 + 恢复 10 心情',
        effect: { weatherImmune: true, moodRestore: 10 },
        obtainMethod: '商店购买',
        price: 50, unlockStation: 3,
    },
    {
        id: 'tsampa', name: '糌粑', icon: '🫓', type: 'consumable',
        desc: '藏式主食，恢复 15 体能 + 10 心情',
        effect: { energyRestore: 15, moodRestore: 10 },
        obtainMethod: '商店购买 / 藏民赠送',
        price: 35, unlockStation: 3,
    },
];
export function getEquipment(id) {
    return EQUIPMENT_LIST.find(e => e.id === id);
}
