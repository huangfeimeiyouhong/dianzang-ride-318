/**
 * 步数获取 & 体能转化服务
 * 流程：微信运动授权 → 获取步数 → 体能转化
 * 云开发可用时走云函数解密，不可用时走本地模式
 */
const ENERGY_PER_100_STEPS = 1;
const MAX_DAILY_ENERGY = 200;
const MAX_ENERGY_RESERVE = 600; // 3天 × 200 = 600
/** 请求微信运动授权 */
export function requestWeRunAuth() {
    return new Promise((resolve) => {
        wx.authorize({
            scope: 'scope.werun',
            success: () => resolve(true),
            fail: () => {
                wx.showModal({
                    title: '需要微信运动权限',
                    content: '骑行游戏需要读取你的步数来转化为体能，请在设置中开启微信运动权限',
                    confirmText: '去设置',
                    success: (res) => {
                        if (res.confirm) {
                            wx.openSetting({
                                success: (settingRes) => {
                                    resolve(!!settingRes.authSetting['scope.werun']);
                                },
                            });
                        }
                        else {
                            resolve(false);
                        }
                    },
                });
            },
        });
    });
}
/** 获取并同步今日步数 */
export async function syncDailySteps(player) {
    var _a;
    const app = getApp();
    const cloudReady = (_a = app === null || app === void 0 ? void 0 : app.globalData) === null || _a === void 0 ? void 0 : _a.cloudReady;
    // 1. 获取微信运动数据
    let steps = 0;
    let isNew = false;
    try {
        const weRunRes = await new Promise((resolve, reject) => {
            wx.getWeRunData({ success: resolve, fail: reject });
        });
        if (cloudReady) {
            // 云开发可用：走云函数解密获取精确步数
            try {
                const res = await wx.cloud.callFunction({
                    name: 'getSteps',
                    data: {
                        encryptedData: weRunRes.encryptedData,
                        iv: weRunRes.iv,
                    },
                });
                const cloudResult = res.result;
                steps = cloudResult.steps || 0;
                isNew = !!cloudResult.isNew;
            }
            catch (e) {
                console.warn('[StepService] 云函数解密失败，使用本地步数:', e);
                // 本地兜底：从微信运动数据中取今日步数（近似值）
                steps = getLocalStepsFromWeRun(weRunRes);
                isNew = true;
            }
        }
        else {
            // 纯本地模式：从微信运动数据中估算步数
            steps = getLocalStepsFromWeRun(weRunRes);
            isNew = true;
        }
    }
    catch (e) {
        console.warn('[StepService] 获取微信运动数据失败，使用模拟步数:', e);
        // 微信运动授权失败时，使用模拟步数（用于测试体验）
        steps = generateSimulatedSteps(player);
        isNew = true;
    }
    // 2. 本地计算体能转化
    return applyStepsToPlayer(player, steps, isNew);
}
/**
 * 从微信运动加密响应中提取今日步数（本地近似）
 * 微信运动返回的是 stepInfoList 数组，包含每日步数
 */
function getLocalStepsFromWeRun(weRunRes) {
    const stepInfoList = weRunRes.stepInfoList;
    if (!stepInfoList || stepInfoList.length === 0)
        return 0;
    // 取最后一条记录（通常是今天）
    const todaySteps = stepInfoList[stepInfoList.length - 1];
    // step 格式: "timestamp-step" 或直接是数字
    const stepStr = String(todaySteps.step);
    const match = stepStr.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
}
/**
 * 生成模拟步数（用于未授权微信运动时的测试体验）
 * 【DEBUG模式】固定返回 999999 步，方便本地调试体能/里程上限
 */
function generateSimulatedSteps(player) {
    // ⚠️ DEBUG: 本地模拟时返回超大步数，方便测试
    // 正式发布前请改回随机步数：
    //   const base = 3000 + Math.floor(Math.random() * 5000);
    //   const adaptBonus = Math.floor(player.stats.altitudeAdapt * 20);
    //   return Math.min(base + adaptBonus, 12000);
    return 999999;
}
/** 将步数应用到玩家数据（含体能储备逻辑） */
export function applyStepsToPlayer(player, steps, isNew) {
    const energyGain = stepsToEnergy(steps);
    // 先消耗储备体能补充当日体能（如果当日体能不足）
    if (player.stats.energy < energyGain) {
        // 无需从储备取，直接增加即可
        player.stats.energy = Math.min(MAX_DAILY_ENERGY, player.stats.energy + energyGain);
    }
    else {
        // 当日体能已满，超出部分存入储备
        const overflow = Math.max(0, (player.stats.energy + energyGain) - MAX_DAILY_ENERGY);
        player.stats.energy = Math.min(MAX_DAILY_ENERGY, player.stats.energy + energyGain);
        if (overflow > 0) {
            player.stats.energyReserve = Math.min(MAX_ENERGY_RESERVE, player.stats.energyReserve + overflow);
        }
    }
    // 步数金币奖励：每 2000 步 = 1 金币，上限 5/天
    const stepCoins = Math.min(Math.floor(steps / 2000), 5);
    player.inventory.coins += stepCoins;
    // 更新连续骑行天数
    if (isNew) {
        player.progress.day++;
    }
    return {
        steps,
        energy: energyGain,
        coins: stepCoins,
        isNew: !!isNew,
    };
}
/** 本地计算体能（离线兜底用） */
export function stepsToEnergy(steps) {
    return Math.min(Math.floor(steps / (100 / ENERGY_PER_100_STEPS)), MAX_DAILY_ENERGY);
}
/** 从储备中提取体能 */
export function useEnergyReserve(player, amount) {
    const available = Math.min(amount, player.stats.energyReserve);
    if (available <= 0)
        return { used: 0, message: '储备体能不足' };
    player.stats.energyReserve -= available;
    player.stats.energy = Math.min(MAX_DAILY_ENERGY, player.stats.energy + available);
    return { used: available, message: `从储备补充了 ${available} 体能` };
}
