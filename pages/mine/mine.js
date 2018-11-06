//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
  },
  onLoad() {
    //由于onLoad只加载一次数据，所以改用onShow每次都刷新数据
  },
  onShow() {
    this.getUserInfoDetail(); //获取用户数据，刷新数据
  },
  bindGetUserInfo: function(e) {
    console.log(e.detail.userinfo);
    if (e.detail.userinfo) {
      //用户点击了授权
    } else {
      //用户取消授权
      console.log("取消授权xxx")
    }
  },
  getUserInfoDetail: function() {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/my_info',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        if (res.data.result == 1) {
          console.log(res.data.data)
          that.setData({
            userInfo: res.data.data
          })
        }
      },
    })
  },
  cooperation() { //合作
    //(临时测试用)
    wx.navigateTo({
      url: '../compare/compare'
     // success: function(res) {},
      // fail: function(res) {},
      // complete: function(res) {},
    })
  }
})