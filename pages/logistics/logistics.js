//index.js
//获取应用实例
const app = getApp()
var util = require('../../utils/md5.js')

Page({
  data: {
    logisticsInfo: [], //物流信息
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
        console.log(res.data.data)
        if (res.data.result == 1) {
          that.setShowMessage(res.data.data)
          that.setData({
            logisticsInfo: res.data.data
          })
        console.log(that.data.logisticsInfo)
        }
      },
    })
  },
  setShowMessage(data){
    data.map((item, index, arr) => {
      if(index === arr.length-1){
        item.img='../../images/linebottom.png'
      }else{
        item.img='../../images/linetop.png'
      }
      return item
    })
  }
})