/**
 * 每日登录奖励系统
 * 7 天循环奖励，断签重置
 */
// 7 天循环奖励
const REWARD_CYCLE = [
    { day: 1, coins: 10 },
    { day: 2, coins: 15 },
    { day: 3, coins: 20 },
    { day: 4, coins: 15, item: 'energy_drink', itemName: '能量饮料' },
    { day: 5, coins: 20 },
    { day: 6, coins: 25, item: 'tsampa', itemName: '糌粑' },
    { day: 7, coins: 50, item: 'oxygen_bottle', itemName: '氧气瓶' },
];
/** 获取今天的日期字符串 YYYY-MM-DD */
function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
/** 检查是否应该断签（距上次登录 > 36 小时） */
function shouldReset(lastDate) {
    if (!lastDate)
        return false;
    const last = new Date(lastDate);
    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    return diffMs > 36 * 60 * 60 * 1000;
}
/**
 * 检查并发放每日登录奖励
 * @returns 今天可领取的奖励信息，null 表示今天已领取过
 */
export function checkDailyLoginReward(player) {
    const today = getTodayStr();
    // 今天已领取
    if (player.lastLoginDate === today) {
        return { canClaim: false, reward: null, streak: player.loginStreak || 0, isReset: false };
    }
    // 检查是否断签
    let isReset = false;
    if (shouldReset(player.lastLoginDate || '')) {
        player.loginStreak = 0;
        isReset = true;
    }
    // 更新连续天数
    player.loginStreak = (player.loginStreak || 0) + 1;
    player.lastLoginDate = today;
    // 获取今天的奖励（循环取模）
    const dayIndex = ((player.loginStreak - 1) % REWARD_CYCLE.length);
    const reward = REWARD_CYCLE[dayIndex];
    return {
        canClaim: true,
        reward,
        streak: player.loginStreak,
        isReset,
    };
}
/**
 * 领取奖励（将奖励应用到玩家数据）
 */
export function claimDailyReward(player) {
    const result = checkDailyLoginReward(player);
    if (!result.canClaim || !result.reward) {
        return { day: 0, coins: 0 };
    }
    const reward = result.reward;
    // 发放金币
    player.inventory.coins += reward.coins;
    // 发放物品
    if (reward.item) {
        const existing = player.inventory.items.find(i => i.id === reward.item);
        if (existing) {
            existing.count++;
        }
        else {
            player.inventory.items.push({ id: reward.item, count: 1 });
        }
    }
    return reward;
}
/** 获取当前周期的全部奖励列表（用于 UI 展示） */
export function getRewardCycle() {
    return REWARD_CYCLE;
}
