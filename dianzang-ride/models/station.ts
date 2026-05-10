export interface Station {
  id: number;
  name: string;
  km: number;
  elev: number;
  icon: string;
  desc: string;
  event: string;
  dangerLevel: number;   // 0-3 危险等级，影响事件触发概率
  hasShop: boolean;
  specialEvent?: string; // 站点特色大事件 ID
}

export const STATIONS: Station[] = [
  { id: 0,  name: '上海人民广场', km: 0,     elev: 4,    icon: '🏙️', desc: '起点，外滩钟声，魔都繁华。', event: '外滩钟声小游戏', dangerLevel: 0, hasShop: true },
  { id: 1,  name: '苏州',        km: 85,    elev: 5,    icon: '🏯', desc: '园林之城，小桥流水。', event: '园林拼图小游戏', dangerLevel: 0, hasShop: true },
  { id: 2,  name: '南京',        km: 300,   elev: 9,    icon: '🌳', desc: '六朝古都，梧桐大道。', event: '梧桐叶落小游戏', dangerLevel: 0, hasShop: true },
  { id: 3,  name: '武汉',        km: 830,   elev: 23,   icon: '🏢', desc: '江城，黄鹤楼，热干面。', event: '黄鹤楼登高小游戏', dangerLevel: 0, hasShop: true },
  { id: 4,  name: '宜昌',        km: 1100,  elev: 58,   icon: '🚢', desc: '三峡之门，屈原故里。', event: '屈原投江小游戏', dangerLevel: 0, hasShop: true },
  { id: 5,  name: '重庆',        km: 1480,  elev: 243,  icon: '🍜', desc: '山城，火锅，轻轨穿楼。', event: '轻轨穿楼小游戏', dangerLevel: 0, hasShop: true },
  { id: 6,  name: '成都',        km: 1950,  elev: 500,  icon: '🐼', desc: '天府之国，大熊猫，锦里。', event: '熊猫喂食小游戏', dangerLevel: 0, hasShop: true },
  { id: 7,  name: '雅安',        km: 2130,  elev: 580,  icon: '🍵', desc: '雨城，茶马古道起点。', event: '茶马古道小游戏', dangerLevel: 1, hasShop: true },
  { id: 8,  name: '康定',        km: 2330,  elev: 2560, icon: '🎵', desc: '情歌之城，折多山。', event: '康定情歌小游戏', dangerLevel: 1, hasShop: true },
  { id: 9,  name: '新都桥',      km: 2480,  elev: 3300, icon: '📸', desc: '摄影天堂，光与影的世界。', event: '光影捕捉小游戏', dangerLevel: 1, hasShop: false, specialEvent: 'photographer_paradise' },
  { id: 10, name: '理塘',        km: 2680,  elev: 4014, icon: '🏔️', desc: '世界高城，丁真的家乡。', event: '赛马节小游戏', dangerLevel: 2, hasShop: true, specialEvent: 'world_high_city' },
  { id: 11, name: '巴塘',        km: 2830,  elev: 2580, icon: '🎻', desc: '弦子之乡，金沙江。', event: '弦子舞小游戏', dangerLevel: 1, hasShop: false },
  { id: 12, name: '林芝',        km: 3830,  elev: 2990, icon: '🌸', desc: '西藏江南，桃花沟。', event: '桃花盛开小游戏', dangerLevel: 0, hasShop: true, specialEvent: 'peach_festival' },
  { id: 13, name: '工布江达',    km: 4030,  elev: 3420, icon: '🚣', desc: '尼洋河，中流砥柱。', event: '尼洋河漂流小游戏', dangerLevel: 1, hasShop: false },
  { id: 14, name: '墨竹工卡',    km: 4830,  elev: 3800, icon: '📝', desc: '松赞干布故乡，甲玛沟。', event: '松赞干布猜谜小游戏', dangerLevel: 1, hasShop: false },
  { id: 15, name: '拉萨布达拉宫', km: 5000,  elev: 3650, icon: '🏆', desc: '终点，圣城，朝圣之路。', event: '朝圣之路终极大事件', dangerLevel: 0, hasShop: true, specialEvent: 'finale' },
];

/** 获取当前站点和下一站点 */
export function getStationPair(stationIndex: number) {
  return {
    current: STATIONS[stationIndex],
    next: stationIndex < STATIONS.length - 1 ? STATIONS[stationIndex + 1] : null,
  };
}
