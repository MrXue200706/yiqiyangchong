//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    
  },
  onLoad: function (options) { 
    console.log("xxxxx");
  },
  getGoodsDetail(id) {//获取页面细节
    let that = this;
    debugger;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/details',
      data: {
        goods_id: id
      },
      success(res) {
        that.setData({
          goods_detail: res.data.data
        })
        console.log(that.data.goods_detail)
      },
    })
  },
})
