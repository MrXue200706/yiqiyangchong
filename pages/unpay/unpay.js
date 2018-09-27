//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    orderList: null,
    order_id: null, //订单id
    orderDetail: null, //订单详情
  },
  onLoad(options){
	  //获取订单数据
	  //this.getUnpayList(options.order_status);
    this.setData({
      order_id: options.order_id,
    })
    this.getOrderDetail();
  },
  getOrderDetail(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/order/details',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        order_id: this.data.order_id
      }, success(res) {
        debugger;
        if (res.data.result == 1) {
          that.setData({
            orderDetail: res.data.data
          })
        }
      },
      fail(res){
        debugger
      }
    })

  },
  getUnpayList(order_status){
	  let that = this;
	  wx.request({
		  url: 'https://wechatapi.vipcsg.com/index/order/order_list',
		  method: 'GET',
		  data: {
			user_id: app.globalData.userInfo.data.data.user_id,
			order_status: order_status
		  }, success(res) {
			  console.log(res);
			  that.setData({
				 orderList: res.data.data 
			  });
		  },
		})
  }
})