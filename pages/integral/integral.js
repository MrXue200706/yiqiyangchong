//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    integral: 0, //积分数
	integralList: null, //积分明细
	deduction: 0, //抵扣现金
	type_one_active: "integral_tab_item_active", //积分明细tap样式
	type_two_active: "", //领取积分tap样式
	tapFlag: true, //样式显示与隐藏
  },
  onLoad(options){
	  this.setData({
		  integral: options.integral
	  });
	  this.calculate();
	  this.typeOneFn();
  },
  typeOneFn(){//积分明细tap样式
    this.setData({
		type_one_active: "integral_tab_item_active",
		type_two_active: "",
		tapFlag: true
	});
	this.getIntegralList();
  },
  typeTwoFn(){//领取积分tap样式
    this.setData({
		type_one_active: "",
		type_two_active: "integral_tab_item_active",
		tapFlag: false
	});
	//this.getMyCoupon();	TODO
  },
  calculate(){//计算积分可抵扣的钱
	  this.setData({
		  deduction: (Number(this.data.integral) / 100).toFixed(2)
	  })
  },
  getIntegralList(){//获取积分明细
	  let that = this;
	  wx.request({
		  url: 'https://wechatapi.vipcsg.com/index/Integral/integral_list',
		  method: 'GET',
		  data: {
			user_id: app.globalData.userInfo.data.data.user_id
		  }, success(res) {
			  that.setData({
				  integralList: res.data.data
			  })
		  },
		})
  }
})