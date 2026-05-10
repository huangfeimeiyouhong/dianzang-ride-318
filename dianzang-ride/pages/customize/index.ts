import { DEFAULT_PLAYER, PlayerData } from '../../models/player';
import {
  HELMET_OPTIONS,
  JERSEY_OPTIONS,
  BIKE_OPTIONS,
  BIKE_COLORS,
} from '../../models/rider';
import { saveLocal } from '../../utils/storage';

Page({
  data: {
    helmets: HELMET_OPTIONS.map((h) => ({ ...h, locked: false })),
    jerseys: JERSEY_OPTIONS.map((j) => ({ ...j, locked: !!j.unlockStation })),
    bikes: BIKE_OPTIONS.map((b) => ({ ...b, locked: !!b.unlockStation })),
    colors: BIKE_COLORS,

    selectedHelmet: 0,
    selectedJersey: 0,
    selectedBike: 0,
    selectedColor: BIKE_COLORS[0],

    helmetIcon: HELMET_OPTIONS[0].icon,
    jerseyIcon: JERSEY_OPTIONS[0].icon,
    bikeEmoji: BIKE_OPTIONS[0].emoji,
  },

  onSelectHelmet(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as number;
    const item = HELMET_OPTIONS.find((h) => h.id === id);
    if (!item || (item.unlockStation && item.unlockStation > 0)) {
      // 对于新用户只有未锁定的才能选
      const opt = this.data.helmets.find((h) => h.id === id);
      if (opt?.locked) {
        wx.showToast({ title: '到达指定站点后解锁', icon: 'none' });
        return;
      }
    }
    this.setData({
      selectedHelmet: id,
      helmetIcon: item!.icon,
    });
  },

  onSelectJersey(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as number;
    const item = JERSEY_OPTIONS.find((j) => j.id === id);
    const opt = this.data.jerseys.find((j) => j.id === id);
    if (opt?.locked) {
      wx.showToast({ title: '到达指定站点后解锁', icon: 'none' });
      return;
    }
    this.setData({
      selectedJersey: id,
      jerseyIcon: item!.icon,
    });
  },

  onSelectBike(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as number;
    const item = BIKE_OPTIONS.find((b) => b.id === id);
    const opt = this.data.bikes.find((b) => b.id === id);
    if (opt?.locked) {
      wx.showToast({ title: '到达指定站点后解锁', icon: 'none' });
      return;
    }
    this.setData({
      selectedBike: id,
      bikeEmoji: item!.emoji,
    });
  },

  onSelectColor(e: WechatMiniprogram.TouchEvent) {
    const color = e.currentTarget.dataset.color as string;
    this.setData({ selectedColor: color });
  },

  async onGoTap() {
    const { selectedHelmet, selectedJersey, selectedBike, selectedColor } = this.data;

    // 获取微信用户信息
    let nickname = '骑友';
    let avatarUrl = '';
    try {
      const profile = await wx.getUserProfile({ desc: '用于游戏内显示' });
      nickname = profile.userInfo.nickName;
      avatarUrl = profile.userInfo.avatarUrl;
    } catch {
      // 用户拒绝，使用默认昵称
    }

    // 创建玩家数据
    const player: PlayerData = {
      ...DEFAULT_PLAYER,
      nickname,
      avatarUrl,
      rider: {
        helmet: selectedHelmet,
        jersey: selectedJersey,
        bike: selectedBike,
        bikeColor: selectedColor,
        titleFrame: 'default',
        title: '新手骑手',
      },
      progress: {
        ...DEFAULT_PLAYER.progress,
        startDate: new Date().toISOString().slice(0, 10),
      },
    };

    // 保存到本地和云端
    saveLocal(player);
    const app = getApp();
    app.globalData.player = player;

    try {
      await app.savePlayerData(player);
    } catch (err) {
      console.warn('[Customize] cloud save failed, local saved:', err);
    }

    // 跳转到地图页
    wx.redirectTo({ url: '/pages/map/index' });
  },
});
