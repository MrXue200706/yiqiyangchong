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
    otype: 'normal', //记录订单参数
    goods_id: null, //记录订单参数
    type_selected: null, //记录订单参数
    selected_numb: null, //记录订单参数
    order_no: null, //记录订单参数
    ct: 'n', //记录订单参数
    comeIn: 'coupon', //标记入口,coupon：个人中心优惠券入口，order: 订单中心进入
    totalPay: null, //订单价格
  },
  onLoad(options) {
    if(options.type!=undefined){
      //订单参数 
      this.setData({
        otype: options.type,
        goods_id: options.goods_id,
        type_selected: options.type_selected,
        selected_numb: options.selected_numb,
        order_no: options.order_no == undefined ? null : options.order_no,
        ct: options.ct == undefined ? 'n' : options.ct,
        comeIn: 'order',
        totalPay: options.totalPay,
      })
    }
    

    this.typeOneFn();
  },
  typeOneFn() {//兑换优惠券
    this.setData({
      type_one_active: "cuopon_tab_item_active",
      type_two_active: "",
      couponFlag: false
    });
    this.getExchangeCoupon();
  },
  typeTwoFn() {//我的优惠券
    this.setData({
      type_one_active: "",
      type_two_active: "cuopon_tab_item_active",
      couponFlag: true
    });
    this.getMyCoupon();
  },
  getExchangeCoupon() {//获取兑换券列表
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/coupons/index',
      method: 'GET',
      data: {

      },
      success(res) {
        if (res.data.result == 1) {
          that.setData({
            exchangeCoupon: res.data.data
          });
        }
      },
    })
  },
  getMyCoupon() {//获取我的优惠券列表
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/coupons/my_coupons',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      }, success(res) {
        if (res.data.result == 1) {
          that.setData({
            myCoupon: res.data.data
          });
        }
      },
    })
  },
  changeNow(e) {//兑换优惠券
    let couponId = e.currentTarget.dataset.id;
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/coupons/receive',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        coupons_id: couponId
      }, success(res) {
        if (res.data.result == 1) {
          //兑换成功
          wx.showToast({
            title: '兑换成功',
            icon: 'succes',
            duration: 2000,
            mask: true
          })
          console.log("兑换成功")
        } else {
          //兑换失败
          wx.showToast({
            title: '兑换失败,' + res.data.msg,
            icon: 'none',
            duration: 2000,
            mask: true
          });
          console.log("兑换失败")
        }
      },
    });
  },
  useCoupon(e){//立即使用
    if (this.data.comeIn== 'order'){
      //查看优惠券的商品价格是否达到要求
      if (e.currentTarget.dataset.order_money < this.data.totalPay){
        //如果是在购买页面跳转过来的，单击直接填充优惠券ID
        wx.navigateTo({
          
          url: "../checkPay/checkPay?shopping=" + this.data.otype + "&couponId=" + e.currentTarget.dataset.couponid + "&goods_id=" + this.data.goods_id + "&type_selected=" + this.data.type_selected + "&selected_numb=" + this.data.selected_numb + "&order_no=" + this.data.order_no + "&ct=" + this.data.ct + "&subprice=" + e.currentTarget.dataset.subprice
        });
      }else{
        wx.showToast({
          title: '未满足价格要求，无法使用该优惠券',
          icon: 'none',
          duration: 2000,
          mask: true,
          success: function () { }
        })
      }
    }else{
      //返回主页
      wx.switchTab({
        url: '../index/index',
      })
    }
    
  }
})
