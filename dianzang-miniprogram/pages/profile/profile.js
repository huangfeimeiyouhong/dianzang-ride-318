// pages/profile/profile.js - 个人中心逻辑
const app = getApp()

Page({
  data: {
    // 用户信息
    avatarUrl: '',
    nickname: '骑行新手',
    signature: '正在挑战318国道！',
    level: 1,
    energy: 1000,
    energyAnimating: false,
    
    // 数据统计
    statCards: [
      { label: '骑行里程', value: '1800km', type: 'mileage' },
      { label: '挑战完成', value: '12', type: 'challenges' },
      { label: '连续天数', value: '5天', type: 'streak' }
    ],
    
    // 菜单项
    menuItems: [
      { icon: '🎒', title: '我的背包', url: '/pages/backpack/backpack' },
      { icon: '🏆', title: '成就列表', url: '/pages/achievements/achievements' },
      { icon: '📊', title: '数据统计', url: '/pages/statistics/statistics' },
      { icon: '⚙️', title: '设置', url: '/pages/settings/settings' },
      { icon: '❓', title: '帮助与反馈', url: '/pages/help/help' }
    ],
    
    // 最近成就
    recentAchievements: [
      { id: 1, icon: '🏅', name: '初出茅庐' },
      { id: 2, icon: '🎯', name: '百公里' },
      { id: 3, icon: '⛰️', name: '翻越二郎山' }
    ],
    
    // Toast
    showToast: false,
    toastMessage: ''
  },

  onLoad() {
    console.log('个人中心加载')
    this.loadUserData()
  },

  onShow() {
    console.log('个人中心显示')
    this.refreshUserData()
  },

  // 加载用户数据
  loadUserData() {
    const userData = wx.getStorageSync('userData')
    if (userData) {
      this.setData({
        nickname: userData.nickname || '骑行新手',
        level: userData.level || 1,
        energy: userData.currency || 1000,
        avatarUrl: userData.avatarUrl || ''
      })
    }
  },

  // 刷新用户数据
  refreshUserData() {
    this.loadUserData()
  },

  // 显示能量详情
  showEnergyDetails() {
    this.setData({
      energyAnimating: true
    })
    
    setTimeout(() => {
      this.setData({
        energyAnimating: false
      })
    }, 500)
    
    this.showToastMessage('能量可用于购买装备和道具')
  },

  // 显示等级详情
  showLevelDetails() {
    wx.showModal({
      title: '等级信息',
      content: `当前等级：Lv.${this.data.level}\n下一等级需要：1000经验值`,
      showCancel: false
    })
  },

  // 更换头像
  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setData({
          avatarUrl: tempFilePath
        })
        // 保存到本地
        wx.setStorageSync('userAvatar', tempFilePath)
        this.showToastMessage('头像已更新')
      }
    })
  },

  // 查看统计详情
  viewStatDetails(e) {
    const type = e.currentTarget.dataset.type
    console.log('查看统计:', type)
  },

  // 导航到页面
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },

  // 查看全部成就
  viewAllAchievements() {
    wx.navigateTo({
      url: '/pages/achievements/achievements'
    })
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
      title: `${this.data.nickname}的骑行之旅`,
      path: '/pages/profile/profile'
    }
  }
})
