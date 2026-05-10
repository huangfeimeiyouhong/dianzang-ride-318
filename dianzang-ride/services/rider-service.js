/**
 * 骑友数据服务
 * 获取路线上其他玩家位置、更新自己的位置
 * 云开发可用时走真实数据，不可用时返回模拟数据
 */
// ====== 模拟骑友数据 ======
const MOCK_NAMES = ['骑行侠老王', '川藏小姐姐', '单车旅人', '追风少年', '高原牦牛', '滇藏老司机', '成都出发的阿杰', '318勇士'];
const MOCK_TITLES = ['新手骑手', '进阶骑士', '高原挑战者', '滇藏达人', '318征服者'];
/** 生成模拟骑友数据 */
function generateMockRiders() {
    const result = {};
    const stationCount = 14; // 14 个站点
    // 随机生成 4-8 个骑友分布在不同站点
    const riderCount = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < riderCount; i++) {
        const stationIndex = Math.floor(Math.random() * stationCount);
        if (!result[stationIndex])
            result[stationIndex] = [];
        result[stationIndex].push({
            _id: `mock_${i}`,
            nickname: MOCK_NAMES[i % MOCK_NAMES.length],
            rider: {
                helmet: Math.floor(Math.random() * 4),
                jersey: Math.floor(Math.random() * 4),
                bike: Math.floor(Math.random() * 3),
                bikeColor: '#4fd1c5',
                titleFrame: 'default',
                title: MOCK_TITLES[Math.floor(Math.random() * MOCK_TITLES.length)],
            },
            title: MOCK_TITLES[Math.floor(Math.random() * MOCK_TITLES.length)],
            km: stationIndex * 150 + Math.floor(Math.random() * 100),
            currentStation: stationIndex,
            visible: true,
            updatedAt: new Date().toISOString(),
        });
    }
    return result;
}
// ====== 服务函数 ======
/** 获取路线上全部可见骑友（按站点分组） */
export async function fetchRiders() {
    var _a;
    const app = getApp();
    const cloudReady = (_a = app === null || app === void 0 ? void 0 : app.globalData) === null || _a === void 0 ? void 0 : _a.cloudReady;
    if (!cloudReady) {
        // 云不可用：返回模拟数据
        console.log('[RiderService] 云开发不可用，使用模拟骑友数据');
        return generateMockRiders();
    }
    try {
        const res = await wx.cloud.callFunction({
            name: 'getRiders',
            data: {},
        });
        return res.result.riders;
    }
    catch (e) {
        console.warn('[RiderService] 云函数调用失败，使用模拟数据:', e);
        return generateMockRiders();
    }
}
/** 更新自己在路线上的位置 */
export async function updateMyPosition(player) {
    var _a, _b;
    const app = getApp();
    const cloudReady = (_a = app === null || app === void 0 ? void 0 : app.globalData) === null || _a === void 0 ? void 0 : _a.cloudReady;
    if (!cloudReady) {
        // 云不可用：仅本地记录，不报错
        console.log('[RiderService] 云开发不可用，位置更新跳过');
        return;
    }
    const db = wx.cloud.database();
    const posData = {
        nickname: player.nickname,
        rider: player.rider,
        title: ((_b = player.rider) === null || _b === void 0 ? void 0 : _b.title) || '骑手',
        km: player.progress.km,
        currentStation: player.progress.currentStation,
        visible: true,
        updatedAt: new Date().toISOString(),
    };
    try {
        // 用 callFunction 让云端用 _openid 做 upsert，避免本地无法获取 openid 的问题
        await wx.cloud.callFunction({
            name: 'updatePosition',
            data: posData,
        });
    }
    catch (e) {
        // 云函数不存在或调用失败时静默跳过，不影响游戏主流程
        console.log('[RiderService] 位置同步跳过（云函数不可用）:', e && e.message);
    }
}
/** 设置隐身模式 */
export async function setVisibility(visible) {
    var _a;
    const app = getApp();
    const cloudReady = (_a = app === null || app === void 0 ? void 0 : app.globalData) === null || _a === void 0 ? void 0 : _a.cloudReady;
    if (!cloudReady) {
        console.log('[RiderService] 云开发不可用，隐身设置跳过');
        return;
    }
    try {
        const db = wx.cloud.database();
        // 用 where + update 而非 doc('{openid}')，避免字面 openid 错误
        await db.collection('rider_positions')
            .where({ _openid: db.currentUser?.openid || '' })
            .update({ data: { visible } });
    }
    catch (e) {
        // 本地调试时静默跳过
        console.log('[RiderService] 隐身设置跳过（云端不可用）:', e && e.message);
    }
}
/** 获取某站点的骑友数量（轻量查询） */
export async function getStationRiderCount(stationIndex) {
    var _a;
    const app = getApp();
    const cloudReady = (_a = app === null || app === void 0 ? void 0 : app.globalData) === null || _a === void 0 ? void 0 : _a.cloudReady;
    if (!cloudReady) {
        // 云不可用：返回随机数模拟
        return Math.floor(Math.random() * 5) + 1;
    }
    try {
        const db = wx.cloud.database();
        const res = await db.collection('rider_positions')
            .where({ currentStation: stationIndex, visible: true })
            .count();
        return res.total;
    }
    catch (e) {
        console.warn('[RiderService] 获取站点骑友数量失败:', e);
        return Math.floor(Math.random() * 5) + 1;
    }
}
