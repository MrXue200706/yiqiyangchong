//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    expertDetail: null, //养宠达人个人中心
  },
  onLoad(options){
    this.getDetail(options.key);
  },
  getDetail(key){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/info',
      method: 'GET',
      data: {
        user_id: key
      }, success(res) {
        that.setData({
          expertDetail: res.data.data
        })
        console.log(res)
      },
    })
  }
})