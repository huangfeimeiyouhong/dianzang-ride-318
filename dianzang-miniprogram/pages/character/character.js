// pages/character/character.js - 角色定制逻辑
const app = getApp()

Page({
  data: {
    // 颜色选择
    helmetColor: '#1976D2',
    jerseyColor: '#1976D2',
    bikeColor: '#333333',
    
    // 属性统计
    speedStat: 15,
    defenseStat: 20,
    charmStat: 10,
    statUpdating: false,
    
    // 确认弹窗
    showConfirmation: false,
    
    // Toast
    showToast: false,
    toastMessage: ''
  },

  onLoad() {
    console.log('角色定制页面加载')
    this.loadSavedCustomization()
  },

  onShow() {
    console.log('角色定制页面显示')
  },

  // 加载已保存的定制
  loadSavedCustomization() {
    const customization = wx.getStorageSync('characterCustomization')
    if (customization) {
      this.setData({
        helmetColor: customization.helmetColor || '#1976D2',
        jerseyColor: customization.jerseyColor || '#1976D2',
        bikeColor: customization.bikeColor || '#333333'
      })
    }
  },

  // 选择颜色选项
  selectOption(e) {
    const { type, color } = e.currentTarget.dataset
    
    if (type === 'helmet') {
      this.setData({
        helmetColor: color
      })
    } else if (type === 'jersey') {
      this.setData({
        jerseyColor: color
      })
    }
    
    // 触发属性更新动画
    this.animateStats()
    
    // 显示提示
    const colorNames = {
      '#C62828': '红色',
      '#1976D2': '蓝色',
      '#333333': '黑色',
      '#EEEEEE': '白色',
      '#4CAF50': '绿色',
      '#FF6B35': '橙色'
    }
    
    const typeNames = {
      'helmet': '头盔',
      'jersey': '骑行服'
    }
    
    this.showToastMessage(`已选择${colorNames[color]}${typeNames[type]}`)
  },

  // 选择自行车颜色
  selectBikeColor(e) {
    const color = e.currentTarget.dataset.color
    
    this.setData({
      bikeColor: color
    })
    
    // 触发属性更新动画
    this.animateStats()
    
    this.showToastMessage('自行车颜色已更新')
  },

  // 属性更新动画
  animateStats() {
    this.setData({
      statUpdating: true
    })
    
    // 随机更新属性值（模拟不同装备的属性）
    const speed = Math.floor(Math.random() * 10) + 10
    const defense = Math.floor(Math.random() * 15) + 15
    const charm = Math.floor(Math.random() * 10) + 5
    
    setTimeout(() => {
      this.setData({
        speedStat: speed,
        defenseStat: defense,
        charmStat: charm,
        statUpdating: false
      })
    }, 100)
  },

  // 保存定制
  saveCustomization() {
    const customization = {
      helmetColor: this.data.helmetColor,
      jerseyColor: this.data.jerseyColor,
      bikeColor: this.data.bikeColor,
      updateTime: new Date().getTime()
    }
    
    // 保存到本地存储
    wx.setStorageSync('characterCustomization', customization)
    
    // 更新全局数据
    app.globalData.userCustomization = customization
    
    // 显示确认弹窗
    this.setData({
      showConfirmation: true
    })
    
    setTimeout(() => {
      this.setData({
        showConfirmation: false
      })
      this.showToastMessage('角色外观已保存！')
    }, 1500)
  },

  // 关闭确认弹窗
  closeConfirmation() {
    this.setData({
      showConfirmation: false
    })
  },

  // 返回上一页
  goBack() {
    wx.showToast({
      title: '返回主页面...',
      icon: 'none',
      duration: 1500
    })
    
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      })
    }, 500)
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

  // 分享
  onShareAppMessage() {
    return {
      title: '来看看我的骑行角色！',
      path: '/pages/character/character'
    }
  }
})
