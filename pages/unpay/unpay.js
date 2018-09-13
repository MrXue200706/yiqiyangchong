//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    orderList: null
  },
  onLoad(options){
	  //获取订单数据
	  this.getUnpayList(options.order_status);
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