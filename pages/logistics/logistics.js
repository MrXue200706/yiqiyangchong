//index.js
//获取应用实例
const app = getApp()
var util = require('../../utils/md5.js')

Page({
  data: {
    logisticsInfo: null, //物流信息
  },
  onLoad(options) {
    this.setData({
      order_id: options.order_id,
    })

    //获取物流信息
    this.getLogisticsInfo()
    //this.getOrderDetail(options.order_id);
  
  },
  getLogisticsInfo(){//获取物流信息
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/order/order_logistics',
      method: 'GET',
      data: {
        order_id: this.data.order_id
      }, success(res) {
        if (res.data.result == 1) {
          that.setData({
            logisticsInfo: res.data.data[res.data.data.length - 1].AcceptStation
          })
        }
      },
    })
  }
})