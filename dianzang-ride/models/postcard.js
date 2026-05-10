/**
 * 风景明信片收集系统
 * 每到达一个新站点自动解锁对应明信片
 */
/** 14张明信片，每站一张 */
export const POSTCARD_LIST = [
    {
        id: 'station_0', stationIndex: 0, stationName: '大理古城',
        title: '苍山洱海', desc: '风花雪月的大理，苍山十九峰倒映在洱海之上。',
        emoji: '🏔', rarity: 'common',
    },
    {
        id: 'station_1', stationIndex: 1, stationName: '丽江',
        title: '玉龙初雪', desc: '丽江古城的青石板路上，远眺玉龙雪山的第一场雪。',
        emoji: '🏔', rarity: 'common',
    },
    {
        id: 'station_2', stationIndex: 2, stationName: '香格里拉',
        title: '松赞林寺', desc: '小布达拉宫在晨雾中若隐若现，转经筒不停。',
        emoji: '🙏', rarity: 'rare',
    },
    {
        id: 'station_3', stationIndex: 3, stationName: '德钦（梅里）',
        title: '日照金山', desc: '梅里雪山的卡瓦格博峰在清晨第一缕阳光中金光万丈。',
        emoji: '🌅', rarity: 'legendary',
    },
    {
        id: 'station_4', stationIndex: 4, stationName: '盐井',
        title: '千年盐田', desc: '澜沧江峡谷中的层层盐田，粉红色卤水在阳光下闪烁。',
        emoji: '🧂', rarity: 'rare',
    },
    {
        id: 'station_5', stationIndex: 5, stationName: '芒康',
        title: '两江交汇', desc: '金沙江与澜沧江在此分流，滇藏线与川藏线在此交汇。',
        emoji: '🔀', rarity: 'common',
    },
    {
        id: 'station_6', stationIndex: 6, stationName: '左贡',
        title: '横断山脉', desc: '穿越横断山脉的垭口，云海翻涌在脚下。',
        emoji: '⛰️', rarity: 'rare',
    },
    {
        id: 'station_7', stationIndex: 7, stationName: '八宿',
        title: '怒江72拐', desc: '从海拔4600米的业拉山下到2700米的怒江边，42公里连续发卡弯。',
        emoji: '🛤️', rarity: 'legendary',
    },
    {
        id: 'station_8', stationIndex: 8, stationName: '然乌',
        title: '然乌碧水', desc: '冰川融水汇成碧蓝的然乌湖，倒映着雪山森林。',
        emoji: '🏔️', rarity: 'rare',
    },
    {
        id: 'station_9', stationIndex: 9, stationName: '波密',
        title: '桃花谷', desc: '三月的波密，十里桃花盛开在雪山脚下。',
        emoji: '🌸', rarity: 'legendary',
    },
    {
        id: 'station_10', stationIndex: 10, stationName: '通麦天险',
        title: '天险之路', desc: '塌方、泥石流、飞石——全程最危险的路段，勇者方能通过。',
        emoji: '⚠️', rarity: 'rare',
    },
    {
        id: 'station_11', stationIndex: 11, stationName: '林芝',
        title: '藏东江南', desc: '雅鲁藏布江边的林芝桃花节，雪山下桃花如海。',
        emoji: '🌺', rarity: 'rare',
    },
    {
        id: 'station_12', stationIndex: 12, stationName: '墨竹工卡',
        title: '拉萨河谷', desc: '沿着拉萨河骑行，远处的布达拉宫已依稀可见。',
        emoji: '🏗️', rarity: 'common',
    },
    {
        id: 'station_13', stationIndex: 13, stationName: '拉萨',
        title: '布达拉宫', desc: '2100公里旅途的终点。布达拉宫的金顶在阳光下熠熠生辉。',
        emoji: '🏆', rarity: 'legendary',
    },
];
/** 获取明信片定义 */
export function getPostcard(stationIndex) {
    return POSTCARD_LIST.find(p => p.stationIndex === stationIndex);
}
/** 获取稀有度配置 */
export function getRarityConfig(rarity) {
    const configs = {
        common: { label: '普通', color: '#718096', bg: 'rgba(113, 128, 150, 0.1)', border: 'rgba(113, 128, 150, 0.2)' },
        rare: { label: '稀有', color: '#63b3ed', bg: 'rgba(99, 179, 237, 0.1)', border: 'rgba(99, 179, 237, 0.2)' },
        legendary: { label: '传说', color: '#f6ad55', bg: 'rgba(246, 173, 85, 0.1)', border: 'rgba(246, 173, 85, 0.3)' },
    };
    return configs[rarity];
}
