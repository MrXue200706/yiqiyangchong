//index.js
//获取应用实例
const app = getApp()
var util = require('../../utils/md5.js')

Page({
  data: {
    goods_detail: {}, //详情 
    type_selected1: null, //选择规格1
    type_selected2: null, //选择规格2
    selected_img: null, //商品图片
    selected_numb: 1, //选择数量
    totalPay: 100000, //费用合计
    address_id: 0, //地址ID
    shopping: 'normal', //页面类型
    shoppingType: 'normal',//购买类型，团购或普通购买
    ct: 'n', //是否参与团购,n:普通购买, y:参与团购
    order_no: null, //参与团购的开团orderNo
    couponId: "", //优惠券ID
    subprice: 0, //优惠券减免价格
    addressMsg: null, //默认地址
    flashsale_id: null, //抢购ID
    is_integral: null, //是否使用积分
    integralDetail: null, //积分
    callback_id: null, //分享积分会掉获取
    events_id: null, //活动ID，暂未使用
  },
  onLoad: function(options) {
    console.log(options);
    if (options.type_selected1 == undefined || options.type_selected2 == undefined) { //如果不选规格，直接return
      wx.showToast({
        title: '加载页面出错',
        icon: 'none',
        duration: 2000,
        mask: true,
        success: function() {}
      })
      return;
    }
    this.setData({
      shopping: options.shopping,
      shoppingType: options.shoppingType == undefined ? 'normal' : options.shoppingType,//购买类型，团购或普通购买
      goods_id: options.goods_id,
      type_selected1: options.type_selected1,
      type_selected2: options.type_selected2,
      selected_img: options.image,
      selected_numb: options.selected_numb,
      ct: options.ct == undefined ? 'n' : options.ct,
      order_no: options.order_no == undefined ? null : options.order_no,
      couponId: options.couponId == undefined ? null : options.couponId,
      address_id: options.address_id == undefined ? null : options.address_id,
      subprice: options.subprice == undefined ? 0 : options.subprice,
      flashsale_id: options.flashsale_id == undefined ? null : options.flashsale_id,
      callback_id: options.callback_id == undefined ?null : options.callback_id,
      events_id: options.events_id == undefined ? null : options.events_id
    });

    //商品详情
    this.getGoodsDetail(options.goods_id);
  },
  onReady() {
    //填充默认收货地址
    this.fullDefaultAddress();
  },
  getGoodsDetail(id) { //获取页面细节
    let queryUrl = 'https://wechatapi.vipcsg.com/index/goods/details'
    if (this.data.shopping == "shopping") {
      queryUrl = "https://wechatapi.vipcsg.com/index/flashsale/details"
    } else if (this.data.shopping == "activity"){
      //获取活动商品详情
      queryUrl = "https://wechatapi.vipcsg.com/index/events/details"
    }
    let that = this;
    wx.request({
      url: queryUrl,
      data: {
        goods_id: id,
        flashsale_id: this.data.flashsale_id,
        events_id: this.data.events_id
      },
      success(res) {
        that.setData({
          goods_detail: res.data.data
        })
        that.totalPayCount(); //更新价格
        //刷新积分显示
        if (that.data.shopping == "shopping") {
          that.countIntegral()
        }
      },
    })
  },
  numberReduceFn() { //减
    this.setData({
      selected_numb: Number(this.data.selected_numb) - 1
    });
    Number(this.data.selected_numb) < 1 ?
      this.setData({
        selected_numb: 1
      }) : null;
    this.totalPayCount();
    this.countIntegral();
  },
  numberAddFn() { //加
    this.setData({
      selected_numb: Number(this.data.selected_numb) + 1
    });
    this.totalPayCount();
    this.countIntegral();
  },
  selecrInputNum(event) { //用户输入数字
    this.setData({
      selected_numb: event.detail.value == 0 ? 1 : event.detail.value
    })
    this.totalPayCount();
    this.countIntegral();
  },
  totalPayCount() { //计算价格，重新设置价格
    //获取当前选择规格的价钱
    let list = this.data.goods_detail.goods_spec_list;
    if (this.data.type_selected2 != "0") {
      for (var i = 0; i < list.length; i++) {
        if (list[i].spec_value == this.data.type_selected1 && list[i].spec_value_2 == this.data.type_selected2) {
          let pice;
          if (this.data.shoppingType == "normal") { //普通购买
            pice = list[i].spec_price
          } else if (this.data.shoppingType == "together") { //团购价格
            pice = list[i].group_price
          } else { //默认为普通购买
            pice = list[i].spec_price
          }
          this.setData({
            totalPay: (Number(pice) * Number(this.data.selected_numb)).toFixed(2)
          });
          console.log("价格：" + this.data.totalPay);
        }
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        if (list[i].spec_value == this.data.type_selected1) {
          let pice;
          if (this.data.shoppingType == "normal") { //普通购买
            pice = list[i].spec_price
          } else if (this.data.shoppingType == "together") { //团购价格
            pice = list[i].group_price
          } else { //默认为普通购买
            pice = list[i].spec_price
          }
          this.setData({
            totalPay: (Number(pice) * Number(this.data.selected_numb)).toFixed(2)
          });
          console.log("价格：" + this.data.totalPay);
        }
      }
    }

  },
  chooseAdr() { //选择地址
    wx.navigateTo({
      url: "../myAdress/myAdress?type=" + this.data.shopping+'&from=checkpay'
    })
  },
  payNow() { //立即支付
    if (this.data.type_selected1 == undefined) {
      wx.showToast({
        title: '数据丢失，请重新进行选择购买',
        icon: 'none',
        duration: 1000,
        mask: true,
        success: function() {}
      })
      return;
    }
    if (this.data.address_id == 0 || this.data.address_id == null || this.data.address_id == undefined) {
      wx.showToast({
        title: '请选择收货地址！',
        icon: 'none',
        duration: 1000,
        mask: true,
        success: function() {}
      })
    }

    let that = this;
    console.log("user_id: " + app.globalData.userInfo.data.data.user_id)
    console.log("goods_id: " + that.data.goods_detail.id)
    console.log("coupons_id: " + that.data.couponId)
    console.log("address_id: " + that.data.address_id)
    console.log("number: " + that.data.selected_numb)
    console.log("spec_1: " + that.data.type_selected1)
    console.log("spec_2: " + that.data.type_selected2)
    console.log("is_integral: " + that.data.is_integral)
    console.log("flashsale_id: " + that.data.flashsale_id)
    console.log("spec_2: " + that.data.type_selected2)

    console.log("eventID:" + that.data.events_id + "-")
    console.log("eventID:" + (that.data.events_id == null))
    console.log("eventID:" + (that.data.events_id == "null"))
    console.log("eventID:" + (that.data.events_id == "null "))
    console.log("eventID:" + (that.data.events_id == null ? "" : that.data.events_id))
    
    console.log("--------------------------------")
    console.log("shopping: " + that.data.shopping)
    console.log("shoppingType: " + that.data.shoppingType)

    var queryUrl = '';
    //确认订单类型
    if (this.data.shoppingType == 'together') {
      if (this.data.ct == 'n') {
        //开团
        queryUrl = 'https://wechatapi.vipcsg.com/index/order/group_submit'
      } else {
        //参团
        queryUrl = 'https://wechatapi.vipcsg.com/index/order/member_submit'
      }
    } else if (this.data.shopping == 'shopping') {
      //抢购商品
      queryUrl = 'https://wechatapi.vipcsg.com/index/order/flash_submit'
    } else {
      //一般订单提交入口
      queryUrl = 'https://wechatapi.vipcsg.com/index/order/submit'
    }
    console.log("urlStr; " + queryUrl)
    //提交订单
    wx.request({
      url: queryUrl,
      method: 'POST',
      data: {
        order_no: that.data.order_no,
        user_id: app.globalData.userInfo.data.data.user_id,
        goods_id: that.data.goods_detail.id,
        coupons_id: that.data.couponId,
        address_id: that.data.address_id,
        number: that.data.selected_numb,
        spec_1: that.data.type_selected1,
        spec_2: that.data.type_selected2,
        flashsale_id: that.data.flashsale_id == "null" ? "" : that.data.flashsale_id	,
        is_integral: that.data.is_integral,
        callback_id: that.data.callback_id == "null"? "" : that.data.callback_id	,
        events_id: that.data.events_id == "null" ? "" : that.data.events_id	
      },
      success(res) {
        if (res.data.result == 1) {
          let payData = res.data.data;
          let packageStr = "prepay_id=" + payData.prepay_id
          let paySignStr = util.hexMD5("appId=wxc7bf060c95b1645b&nonceStr=" + payData.nonceStr + "&package=" + packageStr + "&signType=MD5&timeStamp=" + payData.timeStamp + "&key=dbsDggC8AMXk8LBo30hlHvZ5GBtnjybx")
          let order_no = payData.order_no;
          let order_id = payData.order_id;
          //跳转微信支付
          wx.requestPayment({
            'timeStamp': String(payData.timeStamp),
            'nonceStr': String(payData.nonceStr),
            'package': packageStr,
            'signType': 'MD5',
            'paySign': paySignStr,
            'success': function(res2) {
              console.log("支付成功！！")
              //判断是否为团购，如果团购，则跳到邀请团友页面/待成团界面
              if (that.data.shoppingType == "together") {
                if (that.data.ct == 'n') {
                  //开团
                  wx.navigateTo({
                    url: "../goodsTogether/goodsTogether?ct=n&order_no=" + order_no + "&param_id=" + that.data.goods_detail.id + "&events_id=" + that.data.events_id +"&shopping="+that.data.shopping
                  })
                } else {
                  //参团，传递团长order_no
                  wx.showToast({
                    title: '参与团购成功，邀请更多朋友团购吧',
                    icon: 'succes',
                    duration: 1000,
                    mask: true,
                    success: function() {
                      wx.navigateTo({
                        url: "../goodsTogether/goodsTogether?ct=n&order_no=" + that.data.order_no + "&param_id=" + that.data.goods_detail.id + "&events_id=" + that.data.events_id + "&shopping=" + that.data.shopping
                      })
                    }
                  });
                }
              } else {
                //跳转到待收货页面
                wx.navigateTo({
                  url: "../unpay/unpay?ptype=detail&order_id=" + order_id
                })
              }

            },
            'fail': function(res) {
              //跳转到待支付页面
              wx.navigateTo({
                url: '../unpay/unpay?ptype=unpay&order_id=' + order_id
              })
              console.log("支付失败！！")
            },
            'complete': function(res) {
              console.log("最终路线！！")
            }
          })
        } else { //下订单失败
          if(res.data.msg=="你已参团，请在订单中心查看订单"){
            wx.showToast({
              title: "你已下单，在待付款订单进行支付",
              icon: 'none',
              duration: 2000,
              mask: true,
              success: function () { }
            })
          }else if (res.data.msg != "" && res.data.msg != undefined) {
            wx.showToast({
              title: "下单失败，" + res.data.msg,
              icon: 'none',
              duration: 2000,
              mask: true,
              success: function() {}
            })
          } else {
            wx.showToast({
              title: "订单购买失败，请稍后再试",
              icon: 'none',
              duration: 2000,
              mask: true,
              success: function() {}
            })
          }
        }
      },
    })

  },
  fullDefaultAddress() { //填充默认用户地址
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/default_address',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        console.log(res)
        if (res.data.result == 1 && res.data.data != null) {
          that.setData({
            address_id: res.data.data.id,
            addressMsg: res.data.data
          })
        }
      },
    })
  },
  chooseCoupon() { //选择优惠券
    wx.navigateTo({
      url: "../cuopon/cuopon?type=" + this.data.shopping
    })
  },
  useIntegral() { //使用积分
    if (this.data.is_integral != 1) {
      this.setData({
        is_integral: 1
      })
    } else {
      this.setData({
        is_integral: 0
      })
    }
  },
  countIntegral() { //计算积分
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/order/flash_integral',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        goods_id: this.data.goods_detail.id,
        flashsale_id: this.data.flashsale_id,
        money: this.data.totalPay,
      },
      success(res) {
        if (res.data.result == 1) {
          that.setData({
            integralDetail: res.data.data
          })
        }
      },
    })
  }
})