//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    superShop:{},//
    events_id: null, //活动ID
  },
  onLoad(o){
    this.setData({
      events_id: o.id
    })
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
        console.log(res)
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