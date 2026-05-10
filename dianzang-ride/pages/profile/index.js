import { getEquipment } from '../../models/equipment';
import { getPlayerEquipment, useConsumable } from '../../services/equip-service';
import { setVisibility } from '../../services/rider-service';
import { ACHIEVEMENT_LIST } from '../../services/achievement-service';
import { getAllPostcardsWithStatus, getPostcardProgress } from '../../services/postcard-service';
import { loadLocal, saveLocal } from '../../utils/storage';
Page({
    data: {
        nickname: '骑友', avatarUrl: '', title: '新手骑手',
        totalKm: 0, totalDays: 0, stationsReached: 0, coins: 0,
        // 新增统计
        loginStreak: 0,
        altitudeAdapt: 0,
        energyReserve: 0,
        totalEventsWon: 0,
        // 装备 & 背包
        equipment: [],
        inventory: [],
        // 成就（全部）
        achievements: [],
        unlockedCount: 0,
        totalAchievements: 0,
        // 明信片
        postcards: [],
        postcardCollected: 0,
        postcardTotal: 0,
        postcardPercent: 0,
        showPostcards: false,
        // 其他
        stealth: false,
    },
    _player: null,
    onShow() { this.loadData(); },
    loadData() {
        const player = loadLocal();
        if (!player) {
            wx.showToast({ title: '未找到存档', icon: 'none' });
            return;
        }
        this._player = player;
        const equipList = getPlayerEquipment(player);
        const equipment = equipList.map((e) => ({
            id: e.id, icon: e.icon, name: e.name, desc: e.desc, durability: e.durability
        }));
        const inventory = player.inventory.items.map((item) => {
            const def = getEquipment(item.id);
            return {
                id: item.id,
                icon: (def === null || def === void 0 ? void 0 : def.icon) || '📦',
                name: (def === null || def === void 0 ? void 0 : def.name) || item.id,
                count: item.count,
                desc: (def === null || def === void 0 ? void 0 : def.desc) || '',
            };
        });
        // 全部成就列表（含未解锁）
        const achievements = ACHIEVEMENT_LIST.map((ach) => {
            const unlocked = player.achievements.includes(ach.id);
            const rewardParts = [];
            if (ach.reward.coins)
                rewardParts.push(`${ach.reward.coins}金币`);
            if (ach.reward.title)
                rewardParts.push(`称号:${ach.reward.title}`);
            if (ach.reward.avatarFrame)
                rewardParts.push('头像框');
            return {
                id: ach.id,
                name: ach.name,
                desc: ach.desc,
                icon: ach.icon,
                unlocked,
                rewardText: rewardParts.join(' + '),
            };
        });
        this.setData({
            nickname: player.nickname || '骑友',
            avatarUrl: player.avatarUrl,
            title: player.rider.title,
            totalKm: player.progress.km,
            totalDays: player.progress.day,
            stationsReached: player.progress.currentStation,
            coins: player.inventory.coins,
            // 新增统计
            loginStreak: player.loginStreak || 0,
            altitudeAdapt: player.stats.altitudeAdapt || 0,
            energyReserve: player.stats.energyReserve || 0,
            totalEventsWon: player.totalEventsWon || 0,
            // 装备 & 背包
            equipment,
            inventory,
            // 成就
            achievements,
            unlockedCount: player.achievements.length,
            totalAchievements: ACHIEVEMENT_LIST.length,
            // 明信片
            postcards: getAllPostcardsWithStatus(player).map(p => {
                const rarityConfig = {
                    common: { label: '普通', color: '#718096' },
                    rare: { label: '稀有', color: '#63b3ed' },
                    legendary: { label: '传说', color: '#f6ad55' },
                };
                const rc = rarityConfig[p.rarity] || rarityConfig.common;
                return {
                    id: p.id,
                    stationName: p.stationName,
                    title: p.title,
                    desc: p.collected ? p.desc : '???',
                    emoji: p.emoji,
                    rarity: p.rarity,
                    rarityLabel: rc.label,
                    rarityColor: rc.color,
                    collected: p.collected,
                };
            }),
            postcardCollected: getPostcardProgress(player).collected,
            postcardTotal: getPostcardProgress(player).total,
            postcardPercent: getPostcardProgress(player).percent,
        });
    },
    onUseItem(e) {
        const itemId = e.currentTarget.dataset.id;
        const player = this._player;
        if (!player)
            return;
        const def = getEquipment(itemId);
        wx.showModal({
            title: '使用物品',
            content: `${(def === null || def === void 0 ? void 0 : def.icon) || '📦'} ${(def === null || def === void 0 ? void 0 : def.name) || itemId}\n${(def === null || def === void 0 ? void 0 : def.desc) || ''}\n\n确定使用吗？`,
            success: (res) => {
                if (res.confirm) {
                    const result = useConsumable(player, itemId);
                    wx.showToast({ title: result.message, icon: result.success ? 'success' : 'none' });
                    if (result.success) {
                        // 更新任务进度（使用物品）
                        const { updateQuestProgress } = require('../../services/quest-service');
                        updateQuestProgress(player, 'equip', 1);
                        saveLocal(player);
                        this.loadData();
                    }
                }
            },
        });
    },
    async onStealthChange(e) {
        const visible = !e.detail.value;
        this.setData({ stealth: e.detail.value });
        try {
            await setVisibility(visible);
            wx.showToast({ title: e.detail.value ? '已开启隐身' : '已关闭隐身', icon: 'none' });
        }
        catch (err) {
            console.warn('[Profile] setVisibility failed:', err);
            wx.showToast({ title: '设置失败', icon: 'none' });
            this.setData({ stealth: !e.detail.value });
        }
    },
    onTogglePostcards() {
        this.setData({ showPostcards: !this.data.showPostcards });
    },
});
