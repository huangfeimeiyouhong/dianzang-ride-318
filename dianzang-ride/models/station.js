export const STATIONS = [
    { id: 0, name: '大理古城', km: 0, elev: 1900, icon: '🏁', desc: '起点。风花雪月的大理，补满装备再出发。', event: '装备店、美食回血', dangerLevel: 0, hasShop: true },
    { id: 1, name: '丽江', km: 180, elev: 2400, icon: '🏔', desc: '玉龙雪山下的古城，初次感受高原的气息。', event: '初遇高原', dangerLevel: 0, hasShop: true },
    { id: 2, name: '香格里拉', km: 320, elev: 3300, icon: '🙏', desc: '海拔突破3000米，真正的高原骑行开始了。', event: '第一次高反检测', dangerLevel: 1, hasShop: true },
    { id: 3, name: '德钦（梅里）', km: 480, elev: 3400, icon: '❄️', desc: '梅里雪山祈福，天气变幻莫测。能否看到日照金山？', event: '天气突变', dangerLevel: 2, hasShop: false, specialEvent: 'sunrise_golden' },
    { id: 4, name: '盐井', km: 560, elev: 2400, icon: '🧂', desc: '澜沧江峡谷中的千年盐田，短暂的低海拔喘息。', event: '盐田奇景', dangerLevel: 1, hasShop: false, specialEvent: 'salt_harvest' },
    { id: 5, name: '芒康', km: 660, elev: 3870, icon: '🔀', desc: '滇藏线与川藏线在此交汇，补给重镇。', event: '补给站', dangerLevel: 1, hasShop: true },
    { id: 6, name: '左贡', km: 790, elev: 3780, icon: '⛰️', desc: '横断山脉深处，连续翻越山口。', event: '翻越山口', dangerLevel: 2, hasShop: false },
    { id: 7, name: '八宿', km: 920, elev: 3260, icon: '🛤️', desc: '传说中的怒江72拐，最考验车技的路段。', event: '怒江72拐', dangerLevel: 2, hasShop: false },
    { id: 8, name: '然乌', km: 1010, elev: 3940, icon: '🏔️', desc: '然乌湖，冰川融水汇成的碧蓝。', event: '冰川融水', dangerLevel: 2, hasShop: false },
    { id: 9, name: '波密', km: 1100, elev: 2700, icon: '🌸', desc: '桃花盛开的低海拔峡谷，难得的轻松路段。', event: '桃花盛开', dangerLevel: 0, hasShop: true },
    { id: 10, name: '通麦天险', km: 1160, elev: 2000, icon: '⚠️', desc: '全程最危险路段！塌方、泥石流高发区。', event: '高危路段', dangerLevel: 3, hasShop: false, specialEvent: 'tongmai_gauntlet' },
    { id: 11, name: '林芝', km: 1300, elev: 2990, icon: '🌺', desc: '雅鲁藏布江边的藏东江南。', event: '桃花节', dangerLevel: 0, hasShop: true, specialEvent: 'peach_festival' },
    { id: 12, name: '墨竹工卡', km: 1900, elev: 3800, icon: '🏗️', desc: '冲刺前的最后一站，拉萨近在眼前。', event: '最后高原', dangerLevel: 1, hasShop: false },
    { id: 13, name: '拉萨', km: 2100, elev: 3650, icon: '🏆', desc: '布达拉宫！2100公里的传奇旅途完成！', event: '终点', dangerLevel: 0, hasShop: true, specialEvent: 'finale' },
];
/** 获取当前站点和下一站点 */
export function getStationPair(stationIndex) {
    return {
        current: STATIONS[stationIndex],
        next: stationIndex < STATIONS.length - 1 ? STATIONS[stationIndex + 1] : null,
    };
}
