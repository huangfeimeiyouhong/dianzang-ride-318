/**
 * 本地缓存管理
 * 关键数据先写本地，退出/切后台时批量同步云端
 */
const PLAYER_KEY = 'player_data';
const LAST_SYNC_KEY = 'last_sync_time';
/** 保存到本地缓存 */
export function saveLocal(player) {
    try {
        wx.setStorageSync(PLAYER_KEY, JSON.stringify(player));
    }
    catch (e) {
        console.error('[Storage] saveLocal failed:', e);
    }
}
/** 从本地缓存读取 */
export function loadLocal() {
    try {
        const raw = wx.getStorageSync(PLAYER_KEY);
        return raw ? JSON.parse(raw) : null;
    }
    catch (_a) {
        return null;
    }
}
/** 清除本地缓存 */
export function clearLocal() {
    wx.removeStorageSync(PLAYER_KEY);
}
/** 记录最后同步时间 */
export function setLastSync() {
    wx.setStorageSync(LAST_SYNC_KEY, Date.now());
}
/** 获取最后同步时间 */
export function getLastSync() {
    return wx.getStorageSync(LAST_SYNC_KEY) || 0;
}
/** 是否需要同步（距上次同步超过 5 分钟） */
export function needsSync() {
    return Date.now() - getLastSync() > 5 * 60 * 1000;
}
