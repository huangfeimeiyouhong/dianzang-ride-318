// app.js - 滇藏骑行小程序入口文件
App({
  onLaunch() {
    console.log('滇藏骑行小程序启动')
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    this.globalData.statusBarHeight = systemInfo.statusBarHeight
    this.globalData.screenHeight = systemInfo.screenHeight
    this.globalData.screenWidth = systemInfo.screenWidth
    
    // 检查更新
    this.checkUpdate()
    
    // 初始化用户数据
    this.initUserData()
  },

  onShow() {
    console.log('小程序显示')
  },

  onHide() {
    console.log('小程序隐藏')
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success(res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          
          updateManager.onUpdateFailed(() => {
            wx.showToast({
              title: '更新失败',
              icon: 'none'
            })
          })
        }
      })
    }
  },

  // 初始化用户数据
  initUserData() {
    const userData = wx.getStorageSync('userData')
    if (userData) {
      this.globalData.userData = userData
    } else {
      // 默认用户数据
      this.globalData.userData = {
        nickname: '骑行新手',
        level: 1,
        experience: 0,
        currency: 1000,
        backpack: [],
        achievements: [],
        currentCity: '上海',
        mileage: 0,
        playTime: 0
      }
      wx.setStorageSync('userData', this.globalData.userData)
    }
  },

  // 全局数据
  globalData: {
    systemInfo: null,
    statusBarHeight: 0,
    screenHeight: 0,
    screenWidth: 0,
    userData: null,
    apiBaseUrl: 'https://api.dianzang-ride.com',
    version: '1.0.0'
  }
})
