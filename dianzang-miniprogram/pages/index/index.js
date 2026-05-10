// pages/index/index.js - 首页逻辑
const app = getApp()

Page({
  data: {
    // HUD数据
    energy: 100,
    stamina: 150,
    maxStamina: 200,
    distance: 1800,
    altitude: 2560,
    
    // 进度数据
    traveledDistance: 2500,
    totalDistance: 5000,
    progressPercent: 50,
    
    // 城市信息
    showCityCard: true,
    currentCity: '康定',
    cityIcon: '🏔️',
    cityDistance: '2330km | 2560m',
    cityMinigame: '🎵 特色小游戏：康定情歌',
    cityDifficulty: '⭐⭐⭐⭐ 难度：较高',
    
    // 导航
    currentPage: 'map',
    
    // Toast
    showToast: false,
    toastMessage: ''
  },

  onLoad() {
    console.log('首页加载')
    this.initPageData()
    this.startStaminaSimulation()
  },

  onShow() {
    console.log('首页显示')
    this.refreshUserData()
  },

  onReady() {
    // 页面首次渲染完成
    console.log('首页渲染完成')
  },

  onHide() {
    console.log('首页隐藏')
  },

  onUnload() {
    console.log('首页卸载')
    if (this.staminaTimer) {
      clearInterval(this.staminaTimer)
    }
  },

  // 初始化页面数据
  initPageData() {
    const userData = app.globalData.userData
    if (userData) {
      this.setData({
        energy: userData.currency || 100,
        distance: userData.mileage || 1800
      })
    }
    
    // 延迟设置进度条动画
    setTimeout(() => {
      this.setData({
        progressPercent: 50
      })
    }, 100)
  },

  // 刷新用户数据
  refreshUserData() {
    const userData = wx.getStorageSync('userData')
    if (userData) {
      app.globalData.userData = userData
      this.setData({
        energy: userData.currency || 100,
        distance: userData.mileage || 1800
      })
    }
  },

  // 模拟体能变化
  startStaminaSimulation() {
    this.staminaTimer = setInterval(() => {
      const current = this.data.stamina
      const change = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
      const newVal = Math.max(0, Math.min(this.data.maxStamina, current + change))
      
      this.setData({
        stamina: newVal
      })
      
      if (change !== 0) {
        // 触发动画效果
        this.animateStaminaChange()
      }
    }, 3000)
  },

  // 体能变化动画
  animateStaminaChange() {
    // 小程序中可以通过class切换实现动画
    console.log('体能发生变化')
  },

  // 显示城市信息
  showCityInfo(e) {
    const city = e.currentTarget.dataset.city
    const cityData = {
      '康定': {
        icon: '🏔️',
        distance: '2330km | 2560m',
        minigame: '🎵 特色小游戏：康定情歌',
        difficulty: '⭐⭐⭐⭐ 难度：较高'
      },
      '雅安': {
        icon: '🍵',
        distance: '2130km | 580m',
        minigame: '🍵 特色小游戏：茶马古道',
        difficulty: '⭐⭐ 难度：中等'
      },
      '新都桥': {
        icon: '📸',
        distance: '2480km | 3300m',
        minigame: '📸 特色小游戏：光影捕捉',
        difficulty: '⭐⭐⭐ 难度：中等偏上'
      }
    }
    
    const data = cityData[city]
    if (data) {
      this.setData({
        showCityCard: true,
        currentCity: city,
        cityIcon: data.icon,
        cityDistance: data.distance,
        cityMinigame: data.minigame,
        cityDifficulty: data.difficulty
      })
      
      // 创建粒子效果
      this.createParticles()
    }
  },

  // 创建粒子效果
  createParticles() {
    // 小程序中可以使用wx.createAnimation或CSS动画实现
    console.log('创建粒子效果')
  },

  // 开始小游戏
  startMinigame() {
    wx.showLoading({
      title: '加载中...',
    })
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '🎵 开始' + this.data.currentCity + '小游戏！',
        icon: 'none',
        duration: 2000
      })
      
      // 跳转到小游戏页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/minigame/minigame?city=' + this.data.currentCity
        })
      }, 1000)
    }, 800)
  },

  // 导航到页面
  navigateTo(e) {
    const page = e.currentTarget.dataset.page
    
    this.setData({
      currentPage: page
    })
    
    wx.showToast({
      title: '切换到' + this.getPageName(page) + '页面',
      icon: 'none',
      duration: 1500
    })
    
    // 页面跳转
    setTimeout(() => {
      switch(page) {
        case 'backpack':
          wx.switchTab({
            url: '/pages/backpack/backpack'
          })
          break
        case 'social':
          wx.switchTab({
            url: '/pages/social/social'
          })
          break
        case 'profile':
          wx.switchTab({
            url: '/pages/profile/profile'
          })
          break
      }
    }, 500)
  },

  // 获取页面名称
  getPageName(page) {
    const names = {
      'map': '地图',
      'backpack': '背包',
      'social': '社交',
      'profile': '我的'
    }
    return names[page] || '未知'
  },

  // 显示Toast
  showToastMessage(message) {
    this.setData({
      showToast: true,
      toastMessage: message
    })
    
    setTimeout(() => {
      this.setData({
        showToast: false
      })
    }, 2500)
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新')
    this.refreshUserData()
    wx.stopPullDownRefresh()
    wx.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '滇藏骑行 - 挑战318国道！',
      path: '/pages/index/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '滇藏骑行 - 挑战318国道！'
    }
  }
})
