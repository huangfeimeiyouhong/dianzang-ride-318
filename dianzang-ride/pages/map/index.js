import { STATIONS, getStationPair } from '../../models/station';
import { fetchRiders, updateMyPosition } from '../../services/rider-service';
import { syncDailySteps } from '../../services/step-service';
import { checkDailyLoginReward, claimDailyReward, getRewardCycle } from '../../services/daily-reward-service';
import { checkAndRefreshQuests, claimQuestReward } from '../../services/quest-service';
import { getTodayWeather } from '../../services/weather-service';
import { checkAchievements } from '../../services/achievement-service';
import { loadLocal, saveLocal, needsSync } from '../../utils/storage';
Page({
    data: {
        // 状态栏
        day: 1,
        currentStationName: '大理古城',
        elevation: 1900,
        // 天气
        weatherIcon: '☀️',
        weatherName: '晴天',
        weatherDesc: '万里无云，适合骑行',
        weatherCostMult: 1.0,
        // 数据栏
        energy: 0,
        energyPct: 0,
        km: 0,
        mood: 100,
        moodPct: 100,
        durability: 100,
        durabilityPct: 100,
        coins: 0,
        altitudeAdapt: 0,
        adaptPct: 0,
        // 路线
        currentStation: 0,
        progressToNext: 0,
        stations: [],
        // 每日任务
        quests: [],
        showQuests: false,
        // 登录奖励弹窗
        showLoginReward: false,
        loginReward: null,
        loginStreak: 0,
        rewardCycle: [],
        loginIsReset: false,
        // 成就弹窗
        showAchievement: false,
        achievementName: '',
        achievementIcon: '',
    },
    _player: null,
    _riders: {},
    async onShow() {
        await this.loadData();
        this.syncSteps();
        this.loadRiders();
        this.checkLoginReward();
        this.loadDailyQuests();
        this.updateWeather();
        this.checkAchievements();
    },
    async loadData() {
        const app = getApp();
        let player = loadLocal();
        if (!player) {
            player = await app.loadPlayerData();
        }
        this._player = player;
        this.refreshUI();
    },
    refreshUI() {
        const player = this._player;
        if (!player)
            return;
        const { progress, stats } = player;
        const { current } = getStationPair(progress.currentStation);
        // 计算到下一站的进度
        let progressToNext = 0;
        if (progress.currentStation < STATIONS.length - 1) {
            const next = STATIONS[progress.currentStation + 1];
            const segmentLen = next.km - current.km;
            const ridden = progress.km - current.km;
            progressToNext = segmentLen > 0 ? Math.floor((ridden / segmentLen) * 100) : 0;
        }
        // 构建站点列表数据
        const stations = STATIONS.map((s) => {
            const riders = this._riders[s.id] || [];
            return Object.assign(Object.assign({}, s), { riderCount: riders.length, riderAvatars: riders.slice(0, 3).map(() => '🚴') });
        });
        this.setData({
            day: progress.day,
            currentStationName: current.name,
            elevation: current.elev,
            energy: stats.energy,
            energyPct: Math.min((stats.energy / 200) * 100, 100),
            km: progress.km,
            mood: stats.mood,
            moodPct: stats.mood,
            durability: stats.durability,
            durabilityPct: stats.durability,
            coins: player.inventory.coins,
            altitudeAdapt: stats.altitudeAdapt,
            adaptPct: stats.altitudeAdapt * 2, // max 50 → 100%
            currentStation: progress.currentStation,
            progressToNext,
            stations,
            loginStreak: player.loginStreak || 0,
        });
    },
    // ========== 天气系统 ==========
    updateWeather() {
        const player = this._player;
        if (!player)
            return;
        const weather = getTodayWeather(player);
        this.setData({
            weatherIcon: weather.icon,
            weatherName: weather.name,
            weatherDesc: weather.desc,
            weatherCostMult: weather.costMult,
        });
        // 天气影响心情已由 getTodayWeather 自动处理，保存一下
        saveLocal(player);
    },
    // ========== 登录奖励 ==========
    checkLoginReward() {
        const player = this._player;
        if (!player)
            return;
        const result = checkDailyLoginReward(player);
        // 更新连续天数显示
        this.setData({
            loginStreak: result.streak,
            rewardCycle: getRewardCycle(),
        });
        if (result.canClaim) {
            // 弹出奖励弹窗（先不自动领取，等玩家点）
            this.setData({
                showLoginReward: true,
                loginReward: result.reward,
                loginIsReset: result.isReset,
            });
        }
    },
    onClaimLoginReward() {
        const player = this._player;
        if (!player)
            return;
        const reward = claimDailyReward(player);
        saveLocal(player);
        this.setData({
            showLoginReward: false,
            loginReward: null,
        });
        this.refreshUI();
        wx.showToast({
            title: reward.item
                ? `+${reward.coins}金币 +${reward.itemName}`
                : `+${reward.coins}金币`,
            icon: 'none',
        });
    },
    onCloseLoginReward() {
        // 关闭弹窗但仍然保留奖励（下次打开还能领）
        this.setData({ showLoginReward: false });
    },
    // ========== 每日任务 ==========
    loadDailyQuests() {
        const player = this._player;
        if (!player)
            return;
        const quests = checkAndRefreshQuests(player);
        this.setData({ quests });
        saveLocal(player);
    },
    onToggleQuests() {
        this.setData({ showQuests: !this.data.showQuests });
    },
    onClaimQuest(e) {
        const questId = e.currentTarget.dataset.id;
        const player = this._player;
        if (!player)
            return;
        const result = claimQuestReward(player, questId);
        if (result.success) {
            saveLocal(player);
            this.loadDailyQuests();
            this.refreshUI();
            wx.showToast({
                title: `+${result.coins}金币${result.coins > 60 ? ' (含全部完成奖励)' : ''}`,
                icon: 'none',
            });
        }
    },
    // ========== 步数同步 ==========
    async syncSteps() {
        const player = this._player;
        if (!player)
            return;
        const app = getApp();
        if (!app.globalData.stepsAuthorized)
            return;
        try {
            const result = await syncDailySteps(player);
            if (result.isNew) {
                // 更新任务进度（步数类型）
                const { updateQuestProgress } = require('../../services/quest-service');
                updateQuestProgress(player, 'steps', result.steps);
                saveLocal(player);
                this.refreshUI();
                this.loadDailyQuests();
                if (result.energy > 0 || result.coins > 0) {
                    wx.showToast({
                        title: `+${result.energy}体能 +${result.coins}金币`,
                        icon: 'none',
                    });
                }
            }
        }
        catch (err) {
            console.warn('[Map] syncSteps failed:', err);
        }
    },
    // ========== 成就检查 ==========
    checkAchievements() {
        const player = this._player;
        if (!player)
            return;
        const newOnes = checkAchievements(player);
        if (newOnes.length > 0) {
            saveLocal(player);
            this.refreshUI();
            // 显示第一个成就（如果有多个则依次展示）
            const ach = newOnes[0];
            this.setData({
                showAchievement: true,
                achievementName: ach.name,
                achievementIcon: ach.icon,
            });
        }
    },
    onAchievementDismiss() {
        this.setData({ showAchievement: false });
    },
    // ========== 骑友数据 ==========
    async loadRiders() {
        try {
            const ridersByStation = await fetchRiders();
            this._riders = ridersByStation;
            this.refreshUI();
        }
        catch (err) {
            console.warn('[Map] loadRiders failed:', err);
        }
    },
    // ========== 路线交互 ==========
    onStationTap(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: `/pages/station/index?id=${id}` });
    },
    onRideTap() {
        if (!this._player)
            return;
        if (this._player.stats.energy <= 0) {
            // 检查是否有储备体能
            if (this._player.stats.energyReserve > 0) {
                wx.showModal({
                    title: '体能不足',
                    content: `当前体能已耗尽，但储备中有 ${this._player.stats.energyReserve} 体能。前往背包使用物品补充？`,
                    confirmText: '去背包',
                    success: (res) => {
                        if (res.confirm) {
                            wx.navigateTo({ url: '/pages/profile/index?tab=backpack' });
                        }
                    },
                });
            }
            else {
                wx.showToast({ title: '体能不足，多走走获取能量', icon: 'none' });
            }
            return;
        }
        if (this._player.progress.currentStation >= STATIONS.length - 1) {
            wx.showToast({ title: '你已到达拉萨！旅途完成！', icon: 'none' });
            return;
        }
        wx.navigateTo({ url: '/pages/riding/index' });
    },
    onProfileTap() {
        wx.navigateTo({ url: '/pages/profile/index' });
    },
    async onHide() {
        if (this._player && needsSync()) {
            try {
                const app = getApp();
                await app.savePlayerData(this._player);
                await updateMyPosition(this._player);
            }
            catch (err) {
                console.warn('[Map] sync on hide failed:', err);
            }
        }
    },
});
