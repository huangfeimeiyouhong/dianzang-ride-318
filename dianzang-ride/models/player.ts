export interface RiderConfig {
  helmet: number;
  jersey: number;
  bike: number;
  bikeColor: string;
  titleFrame: string;
  title: string;
}

export interface EquipmentItem {
  id: string;
  durability: number;
}

export interface InventoryItem {
  id: string;
  count: number;
}

export interface PlayerProgress {
  day: number;
  km: number;
  currentStation: number;
  lastEventKm: number;
  startDate: string;
  skipNextEvent?: boolean;
  lastEventFailed?: boolean;
}

export interface PlayerStats {
  energy: number;
  energyReserve: number;
  mood: number;
  durability: number;
  altitudeAdapt: number;
  highAltSickness?: boolean;
  weatherImmune?: boolean;
}

export interface AdState {
  reviveToday: number;
  energyAdToday: number;
  lastAdDate: string;
}

export interface PlayerData {
  _id?: string;
  nickname: string;
  avatarUrl: string;
  rider: RiderConfig;
  progress: PlayerProgress;
  stats: PlayerStats;
  equipment: EquipmentItem[];
  inventory: { coins: number; items: InventoryItem[] };
  achievements: string[];
  adState: AdState;
  loginStreak?: number;
  lastLoginDate?: string;
  totalDistance?: number;
  totalEventsWon?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_PLAYER: PlayerData = {
  nickname: '',
  avatarUrl: '',
  rider: {
    helmet: 0,
    jersey: 0,
    bike: 0,
    bikeColor: '#4fd1c5',
    titleFrame: 'default',
    title: '新手骑手',
  },
  progress: {
    day: 1,
    km: 0,
    currentStation: 0,
    lastEventKm: 0,
    startDate: '',
  },
  stats: {
    energy: 100,
    energyReserve: 0,
    mood: 100,
    durability: 100,
    altitudeAdapt: 0,
  },
  equipment: [
    { id: 'mountain_bike', durability: 100 },
    { id: 'helmet_basic', durability: 100 },
  ],
  inventory: { coins: 99999, items: [] }, // ⚠️ DEBUG: 大额金币，发布前改回 50
  achievements: [],
  adState: { reviveToday: 0, energyAdToday: 0, lastAdDate: '' },
  loginStreak: 0,
  lastLoginDate: '',
  totalDistance: 0,
  totalEventsWon: 0,
};
