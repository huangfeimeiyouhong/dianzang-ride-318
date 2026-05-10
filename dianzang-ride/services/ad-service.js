/**
 * 广告管理服务
 * 激励视频（复活/体能）、Banner、插屏
 */
// 广告位 ID（发布前替换为实际 ID）
const AD_UNITS = {
    reviveVideo: 'adunit-placeholder-revive',
    energyVideo: 'adunit-placeholder-energy',
    stationBanner: 'adunit-placeholder-banner',
    openInterstitial: 'adunit-placeholder-interstitial',
};
const AD_LIMITS = {
    revivePerGame: 2,
    energyPerDay: 3,
    interstitialPerDay: 1,
};
let rewardedVideoAd = null;
let interstitialAd = null;
/** 初始化广告实例（app.ts onLaunch 时调用） */
export function initAds() {
    if (wx.createRewardedVideoAd) {
        rewardedVideoAd = wx.createRewardedVideoAd({
            adUnitId: AD_UNITS.reviveVideo,
        });
        rewardedVideoAd.onError((err) => console.warn('[Ad] video error:', err));
    }
    if (wx.createInterstitialAd) {
        interstitialAd = wx.createInterstitialAd({
            adUnitId: AD_UNITS.openInterstitial,
        });
        interstitialAd.onError((err) => console.warn('[Ad] interstitial error:', err));
    }
}
/** 播放激励视频，返回是否完整观看 */
export function showRewardedVideo() {
    return new Promise((resolve) => {
        if (!rewardedVideoAd) {
            resolve(false);
            return;
        }
        const onClose = (res) => {
            rewardedVideoAd.offClose(onClose);
            resolve(res && res.isEnded);
        };
        rewardedVideoAd.onClose(onClose);
        rewardedVideoAd.show().catch(() => {
            // 广告未加载，尝试重新加载后展示
            rewardedVideoAd.load()
                .then(() => rewardedVideoAd.show())
                .catch(() => {
                rewardedVideoAd.offClose(onClose);
                resolve(false);
            });
        });
    });
}
/** 展示插屏广告（每日首次打开） */
export function showInterstitial() {
    return new Promise((resolve) => {
        if (!interstitialAd) {
            resolve();
            return;
        }
        interstitialAd.show().catch(() => { resolve(); });
    });
}
/** 创建 Banner 广告（站点结算页） */
export function createBannerAd(containerId) {
    if (!wx.createBannerAd)
        return null;
    const sysInfo = wx.getSystemInfoSync();
    const bannerAd = wx.createBannerAd({
        adUnitId: AD_UNITS.stationBanner,
        style: {
            left: 0,
            top: sysInfo.windowHeight - 80,
            width: sysInfo.windowWidth,
        },
    });
    bannerAd.onError((err) => console.warn('[Ad] banner error:', err));
    return bannerAd;
}
/** 检查今日广告余量 */
export function checkAdLimit(type, adState) {
    const today = new Date().toISOString().slice(0, 10);
    // 新的一天自动重置
    if (adState.lastAdDate !== today)
        return true;
    if (type === 'revive')
        return adState.reviveToday < AD_LIMITS.revivePerGame;
    if (type === 'energy')
        return adState.energyAdToday < AD_LIMITS.energyPerDay;
    return false;
}
