//index.js
//获取应用实例
const app = getApp()
var util = require('../../utils/md5.js')

Page({
  data: {
    goods_detail: {}, //详情
    type_selected1: null, //选择规格1
    type_selected2: null, //选择规格2
    selected_img: null,//商品图片
    selected_numb: 1, //选择数量
    totalPay: 100000, //费用合计
    address_id: 0, //地址ID
    shopping: 'normal', //是否抢购，否则正常
    ct: 'n', //是否参与团购,n:普通购买, y:参与团购
    order_no: null, //参与团购的开团orderNo
    couponId: "", //优惠券ID
    subprice: 0, //优惠券减免价格
    defaultAddress: null, //默认地址
  },
  onLoad: function(options) {
    // console.log(options)
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
      goods_id: options.goods_id,
      type_selected1: options.type_selected1,
      type_selected2: options.type_selected2,
      selected_img: options.image,
      selected_numb: options.selected_numb,
      ct: options.ct == undefined ? null : options.ct,
      order_no: options.order_no == undefined ? null : options.order_no,
      couponId: options.couponId == undefined ? null : options.couponId,
      address_id: options.address_id == undefined ? null : options.address_id,
      subprice: options.subprice == undefined ? 0 : options.subprice,
    });
    if (options.adrId != undefined) {
      this.setData({
        address_id: options.adrId
      });
    }
    //商品详情
    this.getGoodsDetail(options.goods_id);
    
  },
  onReady(){
    //填充默认收货地址
    this.fullDefaultAddress();
  },

  getGoodsDetail(id) { //获取页面细节
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/details',
      data: {
        goods_id: id
      },
      success(res) {
        that.setData({
          goods_detail: res.data.data
        })
        // console.log(that.data.goods_detail)
        that.totalPayCount(); //更新价格
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
  },
  numberAddFn() { //加
    this.setData({
      selected_numb: Number(this.data.selected_numb) + 1
    });
    this.totalPayCount();
  },
  selecrInputNum(event) { //用户输入数字
    this.setData({
      selected_numb: event.detail.value == 0 ? 1 : event.detail.value
    })
    this.totalPayCount();
  },
  totalPayCount() { //计算价格，重新设置价格
    //获取当前选择规格的价钱
    let list = this.data.goods_detail.goods_spec_list;
    if(this.data.type_selected2 != "0"){
      for (var i = 0; i < list.length; i++) {
        if (list[i].spec_value == this.data.type_selected1 && list[i].spec_value_2 == this.data.type_selected2) {
          let pice;
          if (this.data.shopping == "normal") { //普通购买
            pice = list[i].spec_price
          } else if (this.data.shopping == "together") { //团购价格
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
    }else{
      for (var i = 0; i < list.length; i++) {
        if (list[i].spec_value == this.data.type_selected1) {
          let pice;
          if (this.data.shopping == "normal") { //普通购买
            pice = list[i].spec_price
          } else if (this.data.shopping == "together") { //团购价格
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
      url: "../myAdress/myAdress?type=" + this.data.shopping + "&goods_id=" + this.data.goods_detail.id + "&type_selected1=" + this.data.type_selected1 + "&type_selected2=" + this.data.type_selected2 + "&selected_numb=" + this.data.selected_numb + "&ct=" + this.data.ct + "&order_no=" + this.data.order_no + "&couponId=" + this.data.couponId
    })
  },
  payNow() { //立即支付
    if (this.data.type_selected1 == undefined){
      wx.showToast({
        title: '数据丢失，请重新进行选择购买',
        icon: 'none',
        duration: 1000,
        mask: true,
        success: function () { }
      })
      return;
    }
    if (this.data.address_id == 0) {
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

    var queryUrl = '';
    //确认订单类型
    if (this.data.shopping == 'together') {
      if (this.data.ct == 'n') {
        //开团
        queryUrl = 'https://wechatapi.vipcsg.com/index/order/group_submit'
      } else {
        //参团
        queryUrl = 'https://wechatapi.vipcsg.com/index/order/member_submit'
      }
    } else if (this.data.shopping == 'shopping') {
      //抢购商品
      //queryUrl = 'https://wechatapi.vipcsg.com/index/order/group_submit'
    } else {
      //一般订单提交入口
      queryUrl = 'https://wechatapi.vipcsg.com/index/order/submit'
    }
    console.log("接口url: " + queryUrl)

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
              if (that.data.shopping == "together") {
                if (that.data.ct = 'n') {
                  //开团
                  wx.navigateTo({
                    url: "../goodsTogether/goodsTogether?ct=n&order_no=" + order_no + "&param_id=" + that.data.goods_detail.id
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
                        url: "../goodsTogether/goodsTogether?ct=n&order_no=" + that.data.order_no + "&param_id=" + that.data.goods_detail.id
                      })
                    }
                  });
                }
              } else {
                //跳转到待收货页面
                wx.navigateTo({
                  url: "../unpay/unpay?ptype=takegoods&order_id=" + order_id
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
        if (res.data.result == 1) {
          that.setData({
            address_id: res.data.data.id
          });
          that.setData({
            defaultAddress: res.data.data
          })
        } else {
          //弹窗提示
          wx.showToast({
            title: '获取默认地址出错',
            icon: 'one',
            duration: 1000,
            mask: true,
            success: function() {}
          })
        }
      },
    })
  },
  chooseVxAddr() { //获取微信地址
    if (wx.chooseAddress) {
      wx.chooseAddress({
        success: function(res) {
          console.log(JSON.stringify(res))
        },
        fail: function(err) {
          console.log(JSON.stringify(err))
        }
      })
    } else {
      console.log('当前微信版本不支持chooseAddress');
    }
  },
  chooseCoupon() { //选择优惠券
    wx.navigateTo({
      url: "../cuopon/cuopon?type=" + this.data.shopping + "&goods_id=" + this.data.goods_detail.id + "&type_selected1=" + this.data.type_selected1 + "&type_selected2=" + this.data.type_selected2 + "&selected_numb=" + this.data.selected_numb + "&ct=" + this.data.ct + "&order_no=" + this.data.order_no + "&address_id=" + this.data.address_id + "&totalPay=" + this.data.totalPay
    })
  }
})