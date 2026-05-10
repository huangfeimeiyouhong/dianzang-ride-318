import { STATIONS, Station } from '../../models/station';
import { PlayerData } from '../../models/player';
import { RiderPosition } from '../../models/rider';
import { Equipment, EQUIPMENT_LIST } from '../../models/equipment';
import { fetchRiders } from '../../services/rider-service';
import { getShopItems, buyEquipment } from '../../services/equip-service';
import { updateQuestProgress } from '../../services/quest-service';
import { loadLocal, saveLocal } from '../../utils/storage';

interface ShopItemView {
  id: string;
  icon: string;
  name: string;
  desc: string;
  price: number;
  canAfford: boolean;
  owned: boolean;
  type: string;
}

Page({
  data: {
    station: {} as Station,
    riders: [] as RiderPosition[],
    // 商店内嵌列表
    showShop: false,
    shopItems: [] as ShopItemView[],
    coins: 0,
    // 特色事件
    hasSpecialEvent: false,
    specialEventName: '',
    specialEventDesc: '',
  },

  _stationId: 0,
  _player: null as PlayerData | null,

  onLoad(options: Record<string, string>) {
    const id = parseInt(options.id || '0', 10);
    this._stationId = id;
    const station = STATIONS[id];
    if (!station) { wx.showToast({ title: '站点不存在', icon: 'none' }); wx.navigateBack(); return; }

    // 加载玩家数据
    const player = loadLocal();
    this._player = player;

    // 特色事件映射
    const specialEventMap: Record<string, { name: string; desc: string }> = {
      sunrise_golden: { name: '日照金山', desc: '凌晨在梅里雪山观景台等待日照金山的壮观景象' },
      salt_harvest: { name: '千年盐田', desc: '体验澜沧江畔的古老晒盐工艺，帮助藏民收盐' },
      tongmai_gauntlet: { name: '通麦天险挑战', desc: '穿越最危险路段，在塌方和泥石流中求生' },
      peach_festival: { name: '林芝桃花节', desc: '参加盛大的桃花节庆典，感受藏东江南的春意' },
      finale: { name: '拉萨终点庆典', desc: '到达布达拉宫！2100公里的传奇旅途画上句号' },
    };

    const specialEvent = station.specialEvent ? specialEventMap[station.specialEvent] : null;

    // 加载商店商品
    const shopEquipIds = getShopItems(id);
    const shopItems: ShopItemView[] = shopEquipIds.map(eq => {
      // 检查是否已拥有（非消耗品）
      const owned = player && eq.type !== 'consumable' && player.equipment.some(e => e.id === eq.id);
      return {
        id: eq.id,
        icon: eq.icon,
        name: eq.name,
        desc: eq.desc,
        price: eq.price || 0,
        canAfford: player ? player.inventory.coins >= (eq.price || 0) : false,
        owned,
        type: eq.type,
      };
    });

    this.setData({
      station,
      riders: [],
      showShop: false,
      shopItems,
      coins: player ? player.inventory.coins : 0,
      hasSpecialEvent: !!specialEvent,
      specialEventName: specialEvent?.name || '',
      specialEventDesc: specialEvent?.desc || '',
    });

    this.loadRiders(id);
  },

  async loadRiders(stationId: number) {
    try {
      const ridersByStation = await fetchRiders();
      const riders = ridersByStation[stationId] || [];
      this.setData({ riders });
    } catch (err) { console.warn('[Station] loadRiders failed:', err); }
  },

  // ========== 内嵌商店 ==========
  onShopToggle() {
    // 刷新金币和可购买状态
    const player = this._player;
    if (player) {
      const shopEquipIds = getShopItems(this._stationId);
      const shopItems = shopEquipIds.map(eq => {
        const owned = eq.type !== 'consumable' && player.equipment.some(e => e.id === eq.id);
        return {
          id: eq.id,
          icon: eq.icon,
          name: eq.name,
          desc: eq.desc,
          price: eq.price || 0,
          canAfford: player.inventory.coins >= (eq.price || 0),
          owned,
          type: eq.type,
        };
      });
      this.setData({ shopItems, coins: player.inventory.coins });
    }
    this.setData({ showShop: !this.data.showShop });
  },

  onBuyItem(e: WechatMiniprogram.TouchEvent) {
    const itemId = e.currentTarget.dataset.id as string;
    const player = this._player;
    if (!player) return;

    const result = buyEquipment(player, itemId);
    wx.showToast({ title: result.message, icon: result.success ? 'success' : 'none' });

    if (result.success) {
      saveLocal(player);

      // 更新任务进度（装备购买类型）
      updateQuestProgress(player, 'equip', 1);
      saveLocal(player);

      // 刷新商店列表和金币
      const shopEquipIds = getShopItems(this._stationId);
      const shopItems = shopEquipIds.map(eq => {
        const owned = eq.type !== 'consumable' && player.equipment.some(e => e.id === eq.id);
        return {
          id: eq.id,
          icon: eq.icon,
          name: eq.name,
          desc: eq.desc,
          price: eq.price || 0,
          canAfford: player.inventory.coins >= (eq.price || 0),
          owned,
          type: eq.type,
        };
      });
      this.setData({ shopItems, coins: player.inventory.coins });
    }
  },

  // ========== 特色事件 ==========
  onSpecialEvent() {
    const station = this.data.station;
    if (!station.specialEvent) return;
    wx.navigateTo({ url: `/pages/special-event/index?id=${station.specialEvent}` });
  },

  onClose() { wx.navigateBack(); },
});
