//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    special_topic:[],//lieb
  },
  onLoad(){
    this.getSpecialTopic();
  },

  //专题
  getSpecialTopic(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/project/plist',
      data: {},
      success(res) {
        that.setData({
          special_topic: res.data.data
        })
        console.log(that.data.special_topic)
      },
    })
  },
})