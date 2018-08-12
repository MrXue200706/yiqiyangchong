//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    superShop:{},//
  },
  onLoad(o){
    this.getSwiper(o.id);
  },

  //请求
  getSwiper(id) {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/events/goods',
      data: {
        events_id:id
      },
      success(res) {
        that.setData({
          superShop: res.data.data
        });
        wx.setNavigationBarTitle({
          title: res.data.data.events_info.events_title 
        })
      },
    })
  },
})