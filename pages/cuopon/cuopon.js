//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    type_one_active: "", //修改点击后的样式
    type_two_active: "", //修改点击后的样式
	myCoupon: null, //我的优惠券
	exchangeCoupon: null, //兑换优惠券
	couponFlag: false, //是否隐藏兑换优惠券
  },
  onLoad(){
	  this.typeOneFn();
  },
  typeOneFn(){//兑换优惠券
    this.setData({
		type_one_active: "cuopon_tab_item_active",
		type_two_active: "",
		couponFlag: false
	});
	this.getExchangeCoupon();
  },
  typeTwoFn(){//我的优惠券
    this.setData({
		type_one_active: "",
		type_two_active: "cuopon_tab_item_active",
		couponFlag: true
	});
	this.getMyCoupon();
  },
  getExchangeCoupon(){//获取兑换券列表
	 let that = this;
	 wx.request({
	  url: 'https://wechatapi.vipcsg.com/index/coupons/index',
	  method: 'GET',
	  data: {
		  
	  },
	  success(res) {
		if(res.data.result==1){
			that.setData({
				exchangeCoupon: res.data.data
			});
		}
	  },
	})
  },
  getMyCoupon(){//获取我的优惠券列表
	 let that = this;
	 wx.request({
	  url: 'https://wechatapi.vipcsg.com/index/coupons/my_coupons',
	  method: 'GET',
	  data: {
		user_id: app.globalData.userInfo.data.data.user_id
	  }, success(res) {
		if(res.data.result==1){
			that.setData({
				myCoupon: res.data.data
			});
		}
	  },
	})
  },
  changeNow(e){//兑换优惠券
	let couponId = e.currentTarget.dataset.id;
	let that = this;
	 wx.request({
	  url: 'https://wechatapi.vipcsg.com/index/coupons/receive',
	  method: 'GET',
	  data: {
		user_id: app.globalData.userInfo.data.data.user_id,
		coupons_id: couponId
	  }, success(res) {
		if(res.data.result==1){
			//兑换成功
			wx.showToast({
				title: '兑换成功',
				icon: 'succes',
				duration: 2000,
				mask:true
			})
			console.log("兑换成功")
		}else{
			//兑换失败
			wx.showToast({
				title: '兑换失败',
				icon: 'none',
				duration: 2000,
				mask: true
			  });
			console.log("兑换失败")
		}
	  },
	});
  }
})
