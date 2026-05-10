import { PlayerData } from '../../models/player';
import { SpecialEvent } from '../../services/special-event-service';
import { completeSpecialEvent, getSpecialEvent, isSpecialEventCompleted } from '../../services/special-event-service';
import { loadLocal, saveLocal } from '../../utils/storage';

Page({
  data: {
    event: null as SpecialEvent | null,
    alreadyCompleted: false,
    selectedChoice: -1,
    showResult: false,
    resultMessage: '',
    resultCoins: 0,
    resultTitle: '',
  },

  _player: null as PlayerData | null,
  _eventId: '',

  onLoad(options: Record<string, string>) {
    const eventId = options.id || '';
    const player = loadLocal();
    if (!player || !eventId) { wx.navigateBack(); return; }

    this._player = player;
    this._eventId = eventId;

    const event = getSpecialEvent(parseInt(eventId.split('_').pop() || '0', 10))
      || { id: eventId } as SpecialEvent;

    // 通过 ID 直接查找
    const allEvents = (require('../../services/special-event-service') as any).getAllSpecialEvents() as SpecialEvent[];
    const foundEvent = allEvents.find(e => e.id === eventId);

    if (!foundEvent) {
      wx.showToast({ title: '事件不存在', icon: 'none' });
      wx.navigateBack();
      return;
    }

    this.setData({
      event: foundEvent,
      alreadyCompleted: isSpecialEventCompleted(player, eventId),
    });
  },

  onSelectChoice(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as number;
    this.setData({ selectedChoice: index });
  },

  onConfirm() {
    const player = this._player;
    if (!player || !this.data.event) return;

    const result = completeSpecialEvent(player, this._eventId, this.data.selectedChoice >= 0 ? this.data.selectedChoice : undefined);

    if (!result.success) {
      wx.showToast({ title: result.message, icon: 'none' });
      return;
    }

    saveLocal(player);
    this.setData({
      showResult: true,
      resultMessage: result.message,
      resultCoins: result.reward.coins || 0,
      resultTitle: result.reward.title || '',
    });
  },

  onClose() {
    wx.navigateBack();
  },
});
