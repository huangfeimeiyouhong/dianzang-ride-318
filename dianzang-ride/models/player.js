export const DEFAULT_PLAYER = {
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
