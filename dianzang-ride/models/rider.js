/** 骑手外观选项 */
export const HELMET_OPTIONS = [
    { id: 0, icon: '⛑️', name: '经典款' },
    { id: 1, icon: '🪖', name: '军绿款' },
    { id: 2, icon: '👷', name: '赛车款', unlockStation: 5 },
    { id: 3, icon: '🎿', name: '反光款', unlockStation: 7 },
];
export const JERSEY_OPTIONS = [
    { id: 0, icon: '👕', name: '素色' },
    { id: 1, icon: '🦺', name: '荧光' },
    { id: 2, icon: '🎽', name: '渐变', unlockStation: 3 },
    { id: 3, icon: '👘', name: '民族风', unlockStation: 9 },
];
export const BIKE_OPTIONS = [
    { id: 0, icon: '🚲', name: '登山车', emoji: '🚴' },
    { id: 1, icon: '🚴', name: '公路车', emoji: '🚴‍♂️', unlockStation: 1 },
    { id: 2, icon: '🛵', name: '复古车', emoji: '🚴‍♀️', unlockStation: 5 },
];
export const BIKE_COLORS = [
    '#4fd1c5', '#f6ad55', '#fc8181', '#b794f4',
    '#68d391', '#63b3ed', '#f6e05e',
];
export const TITLE_OPTIONS = [
    { id: 'newbie', name: '新手骑手', condition: '初始' },
    { id: 'plateau_veteran', name: '高原老手', condition: '到达芒康' },
    { id: 'lhasa_warrior', name: '拉萨勇士', condition: '到达拉萨' },
    { id: 'endurance_king', name: '耐力王者', condition: '连续骑行 7 天不休息' },
    { id: 'speed_queen', name: '速度女王', condition: '单日骑行 > 100km' },
    { id: 'buddhist_rider', name: '佛系骑手', condition: '心情值始终 > 80' },
];
