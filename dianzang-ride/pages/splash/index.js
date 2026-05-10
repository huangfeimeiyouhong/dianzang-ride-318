import { loadLocal } from '../../utils/storage';
import { requestWeRunAuth } from '../../services/step-service';
Page({
    data: {
        loading: false,
    },
    onLoad() {
        // 检查是否已有存档，有则直接跳地图页
        const saved = loadLocal();
        if (saved && saved.progress.km > 0) {
            wx.redirectTo({ url: '/pages/map/index' });
        }
    },
    async onStartTap() {
        if (this.data.loading)
            return;
        this.setData({ loading: true });
        try {
            // 请求微信运动授权
            const authorized = await requestWeRunAuth();
            const app = getApp();
            app.globalData.stepsAuthorized = authorized;
            if (!authorized) {
                wx.showToast({ title: '未授权微信运动，体能获取将受限', icon: 'none' });
            }
            // 跳转到骑手自定义页
            wx.navigateTo({ url: '/pages/customize/index' });
        }
        catch (err) {
            console.error('[Splash] start error:', err);
            wx.showToast({ title: '出错了，请重试', icon: 'none' });
        }
        finally {
            this.setData({ loading: false });
        }
    },
});
