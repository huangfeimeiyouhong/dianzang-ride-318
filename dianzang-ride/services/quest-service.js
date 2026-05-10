/**
 * 每日任务系统
 * 每天随机 3 个任务（1简单+1普通+1挑战），全部完成额外奖励
 */
// 任务池
const QUEST_POOL = [
    // 简单任务 (difficulty: 1)
    { id: 'steps_5000', type: 'steps', name: '轻松散步', desc: '今天走 5000 步', target: 5000, reward: 25, difficulty: 1 },
    { id: 'steps_8000', type: 'steps', name: '日常锻炼', desc: '今天走 8000 步', target: 8000, reward: 30, difficulty: 1 },
    { id: 'ride_30', type: 'ride', name: '短途骑行', desc: '今天骑行 30km', target: 30, reward: 25, difficulty: 1 },
    { id: 'use_item', type: 'equip', name: '补充能量', desc: '使用 1 个消耗品', target: 1, reward: 20, difficulty: 1 },
    // 普通任务 (difficulty: 2)
    { id: 'steps_12000', type: 'steps', name: '勤奋步行', desc: '今天走 12000 步', target: 12000, reward: 35, difficulty: 2 },
    { id: 'ride_50', type: 'ride', name: '中等骑行', desc: '今天骑行 50km', target: 50, reward: 35, difficulty: 2 },
    { id: 'event_1', type: 'event', name: '应对挑战', desc: '完成 1 个事件小游戏', target: 1, reward: 30, difficulty: 2 },
    { id: 'ride_80', type: 'ride', name: '长途骑行', desc: '今天骑行 80km', target: 80, reward: 40, difficulty: 2 },
    // 挑战任务 (difficulty: 3)
    { id: 'steps_20000', type: 'steps', name: '暴走达人', desc: '今天走 20000 步', target: 20000, reward: 50, difficulty: 3 },
    { id: 'ride_100', type: 'ride', name: '百公里挑战', desc: '今天骑行 100km', target: 100, reward: 60, difficulty: 3 },
    { id: 'event_3', type: 'event', name: '连闯三关', desc: '今天完成 3 个事件', target: 3, reward: 50, difficulty: 3 },
    { id: 'buy_equip', type: 'equip', name: '装备升级', desc: '购买 1 件新装备', target: 1, reward: 40, difficulty: 3 },
];
/** 获取今天的日期字符串 */
function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
/** 洗牌算法 */
function shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
/** 生成每日任务（3个：1简单+1普通+1挑战） */
export function generateDailyQuests() {
    const easy = shuffle(QUEST_POOL.filter(q => q.difficulty === 1)).slice(0, 1);
    const normal = shuffle(QUEST_POOL.filter(q => q.difficulty === 2)).slice(0, 1);
    const hard = shuffle(QUEST_POOL.filter(q => q.difficulty === 3)).slice(0, 1);
    return [...easy, ...normal, ...hard].map(q => (Object.assign(Object.assign({}, q), { progress: 0, completed: false, claimed: false })));
}
/** 检查并刷新今日任务 */
export function checkAndRefreshQuests(player) {
    const today = getTodayStr();
    // 读取存储的任务
    const stored = player.progress.dailyQuests;
    const storedDate = player.progress.dailyQuestDate;
    if (stored && storedDate === today) {
        return stored;
    }
    // 生成新任务
    const quests = generateDailyQuests();
    player.progress.dailyQuests = quests;
    player.progress.dailyQuestDate = today;
    return quests;
}
/** 更新任务进度 */
export function updateQuestProgress(player, type, amount) {
    const quests = checkAndRefreshQuests(player);
    const newlyCompleted = [];
    for (const quest of quests) {
        if (quest.completed || quest.type !== type)
            continue;
        quest.progress = Math.min(quest.target, quest.progress + amount);
        if (quest.progress >= quest.target && !quest.completed) {
            quest.completed = true;
            newlyCompleted.push(quest);
        }
    }
    player.progress.dailyQuests = quests;
    return { updated: newlyCompleted.length > 0, newlyCompleted };
}
/** 领取任务奖励 */
export function claimQuestReward(player, questId) {
    const quests = checkAndRefreshQuests(player);
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) {
        return { success: false, coins: 0 };
    }
    quest.claimed = true;
    player.inventory.coins += quest.reward;
    // 检查是否全部完成 → 额外奖励
    const allCompleted = quests.every(q => q.claimed);
    let bonusCoins = 0;
    if (allCompleted) {
        bonusCoins = 30;
        player.inventory.coins += bonusCoins;
    }
    player.progress.dailyQuests = quests;
    return { success: true, coins: quest.reward + bonusCoins };
}
