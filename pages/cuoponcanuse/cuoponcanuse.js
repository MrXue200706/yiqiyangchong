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
    comeIn: 'coupon', //标记入口,coupon：个人中心优惠券入口，order: 订单中心进入
    startTiem:'',
    endTime: '',
    isDlaigShow: false,
  },
  onLoad(options) {
    if(options.type!=undefined){
      //订单参数 
      this.setData({
        comeIn: 'order',
      })
    }
    

    this.typeOneFn();
  },
  changeShowDiag() {
    this.setData({
      isDlaigShow: false
    })
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
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        if (res.data.result == 1) {
          that.changTimeShow(res.data.data)
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
          that.changTimeShow(res.data.data)
          that.setData({
            myCoupon: res.data.data
          });
        }
      },
    })
  },
  changTimeShow(data){
    data.map(item => {
      console.log(item.end_time.split(' ')[0])
      item.showStartTime=item.start_time.split(' ')[0]
      item.showEndTime=item.end_time.split(' ')[0]
      return item
    })
    console.log(data)
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
            duration: 1000,
            mask: true
          })
          console.log("兑换成功")
          setTimeout(()=>{
            that.setData({
              isDlaigShow: true
            })
          },1000)
          that.getExchangeCoupon()
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
      //获取页面栈
      var pages = getCurrentPages();
      //获取上一页
      var prePage = pages[pages.length - 2]
      //查看优惠券的商品价格是否达到要求
      if (parseFloat(e.currentTarget.dataset.order_money) <= parseFloat(prePage.data.totalPay)){
        //如果是在购买页面跳转过来的，单击直接填充优惠券ID
        prePage.setData({
          couponId: e.currentTarget.dataset.couponid,
          subprice: e.currentTarget.dataset.subprice
        })
        //返回上一页
        wx.navigateBack({
          delta: 1 
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
