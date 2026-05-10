import { DEFAULT_PLAYER } from './models/player';
import { saveLocal, loadLocal } from './utils/storage';
App({
    globalData: {
        player: null,
        stepsAuthorized: false,
        systemInfo: null,
        cloudReady: false,
    },
    onLaunch() {
        this.initCloud();
        // 获取系统信息（屏幕尺寸等，关卡 Canvas 需要）
        const sysInfo = wx.getSystemInfoSync();
        this.globalData.systemInfo = sysInfo;
        // 检查微信运动授权状态
        wx.getSetting({
            success: (res) => {
                this.globalData.stepsAuthorized = !!res.authSetting['scope.werun'];
            },
        });
    },
    initCloud() {
        if (!wx.cloud) {
            console.warn('[Cloud] 当前基础库版本不支持云开发，将使用本地存储模式');
            this.globalData.cloudReady = false;
            return;
        }
        try {
            wx.cloud.init({
                traceUser: true,
                // env 在正式发布时替换为实际环境 ID
                env: 'dianzang-ride-prod',
            });
            this.globalData.cloudReady = true;
            console.log('[Cloud] 云开发初始化成功');
        }
        catch (e) {
            console.warn('[Cloud] 云开发初始化失败，将使用本地存储模式:', e);
            this.globalData.cloudReady = false;
        }
    },
    async loadPlayerData() {
        if (this.globalData.player)
            return this.globalData.player;
        // 优先从本地缓存读取（快速启动）
        const localData = loadLocal();
        if (localData) {
            this.globalData.player = localData;
            console.log('[Player] 从本地缓存加载玩家数据');
            return localData;
        }
        // 尝试从云数据库读取
        if (this.globalData.cloudReady) {
            try {
                const db = wx.cloud.database();
                const res = await db.collection('players').doc('{openid}').get();
                this.globalData.player = res.data;
                // 同步到本地缓存
                saveLocal(this.globalData.player);
                console.log('[Player] 从云数据库加载玩家数据');
                return this.globalData.player;
            }
            catch (e) {
                console.warn('[Player] 云数据库读取失败，使用默认数据:', e);
            }
        }
        // 新用户，返回默认数据
        const defaultPlayer = Object.assign({}, DEFAULT_PLAYER);
        this.globalData.player = defaultPlayer;
        saveLocal(defaultPlayer);
        console.log('[Player] 创建新玩家（默认数据）');
        return defaultPlayer;
    },
    async savePlayerData(data) {
        const playerData = this.globalData.player;
        if (playerData) {
            // 合并数据到内存
            Object.assign(playerData, data);
            // 保存到本地缓存（始终执行）
            saveLocal(playerData);
        }
        // 异步同步到云数据库（失败静默）
        if (this.globalData.cloudReady) {
            try {
                const db = wx.cloud.database();
                await db.collection('players').doc('{openid}').update({ data });
            }
            catch (_a) {
                try {
                    const db = wx.cloud.database();
                    await db.collection('players').add({
                        data: Object.assign(Object.assign({}, DEFAULT_PLAYER), data),
                    });
                }
                catch (e) {
                    console.warn('[Player] 云数据库保存失败（不影响本地数据）:', e);
                }
            }
        }
    },
});
