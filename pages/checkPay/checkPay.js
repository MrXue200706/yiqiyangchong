//index.js
//获取应用实例
const app = getApp()
var util = require('../../utils/md5.js')

Page({
  data: {
    goods_detail: {}, //详情
    type_selected: null, //选择规格
    selected_numb: 1, //选择数量
    totalPay: 100000, //费用合计
    address_id: 0, //地址ID
    shopping: 'normal', //是否抢购，否则正常
    ct: 'n', //是否参与团购,n:普通购买, y:参与团购
    order_no: null, //参与团购的开团orderNo
    couponId: "", //优惠券ID
    subprice: 0, //优惠券减免价格
  },
  onLoad: function(options) {
    this.setData({
      shopping: options.shopping,
      goods_id: options.goods_id,
      type_selected: options.type_selected,
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
        console.log(that.data.goods_detail)
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
  totalPayCount() { //计算价格，重新设置价格
    let list = this.data.goods_detail.goods_spec_list
    for (var i = 0; i < list.length; i++) {
      if (list[i].spec_value == this.data.type_selected || list[i].spec_value_2 == this.data.type_selected) {
        this.setData({
          totalPay: (Number(list[i].spec_price) * Number(this.data.selected_numb)).toFixed(2)
        });
        console.log("价格：" + this.data.totalPay);
      }
    }
  },
  chooseAdr() { //选择地址
    wx.navigateTo({
      url: "../myAdress/myAdress?type=" + this.data.shopping + "&goods_id=" + this.data.goods_detail.id + "&type_selected=" + this.data.type_selected + "&selected_numb=" + this.data.selected_numb + "&ct=" + this.data.ct + "&order_no=" + this.data.order_no + "&couponId=" + this.data.couponId
    })
  },
  payNow() { //立即支付
    if (this.data.address_id == 0) {
      wx.showToast({
        title: '请选择收货地址！',
        icon: 'none',
        duration: 2000,
        mask: true,
        success: function() {}
      })
    }

    //获取选择规格全部信息
    let spec_list = this.data.goods_detail.goods_spec_list;
    let type_selected1 = null; //规格1
    let type_selected2 = null; //规格2
    for (var i = 0; i < spec_list.length; i++) {
      if (spec_list[i].spec_value == this.data.type_selected || spec_list[i].spec_value_2 == this.data.type_selected) {
        type_selected1 = spec_list[i].spec_value;
        type_selected2 = spec_list[i].spec_value_2;
      }
    }
    let that = this;


    console.log("user_id: " + app.globalData.userInfo.data.data.user_id)
    console.log("goods_id: " + that.data.goods_detail.id)
    console.log("coupons_id: " + "")
    console.log("address_id: " + that.data.address_id)
    console.log("number: " + that.data.selected_numb)
    console.log("spec_1: " + type_selected1)
    console.log("spec_2: " + type_selected2)

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

    console.log("提交订单的url：" + queryUrl)
    console.log("优惠券ID：" + that.data.couponId)
    //提交团购订单
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
        spec_1: type_selected1,
        spec_2: type_selected2,
      },
      success(res) {
        if (res.data.result == 1) {
          let payData = res.data.data;
          let packageStr = "prepay_id=" + payData.prepay_id
          let paySignStr = util.hexMD5("appId=wxc7bf060c95b1645b&nonceStr=" + payData.nonceStr + "&package=" + packageStr + "&signType=MD5&timeStamp=" + payData.timeStamp + "&key=dbsDggC8AMXk8LBo30hlHvZ5GBtnjybx")
          let order_no = payData.order_no;

          console.log(that.data.shopping)
          debugger;
          //跳转微信支付
          wx.requestPayment({
            'timeStamp': String(payData.timeStamp),
            'nonceStr': String(payData.nonceStr),
            'package': packageStr,
            'signType': 'MD5',
            'paySign': paySignStr,
            'success': function(res2) {
              //判断是否为团购，如果团购，则跳到邀请团友页面/待成团界面
              debugger;
              if (that.data.shopping == "together") {
                debugger
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
                debugger
                //跳转到待收货页面
                wx.navigateTo({
                  url: "../unpay/unpay?order_status=1"
                })
              }

              console.log("支付成功！！")
              debugger;

            },
            'fail': function(res) {
              //跳转到待支付页面
              wx.navigateTo({
                url: "../unpay/unpay?order_status=1"
              })
              console.log("支付失败！！")
              debugger;
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
      url: 'http://wechatapi.vipcsg.com/index/member/default_address',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        if (res.data.result == 1) {
          that.setData({
            address_id: res.data.data.id
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
  chooseCoupon(){//选择优惠券
    wx.navigateTo({
      url: "../cuopon/cuopon?type=" + this.data.shopping + "&goods_id=" + this.data.goods_detail.id + "&type_selected=" + this.data.type_selected + "&selected_numb=" + this.data.selected_numb + "&ct=" + this.data.ct + "&order_no=" + this.data.order_no + "&address_id=" + this.data.address_id + "&totalPay=" + this.data.totalPay
    })
  }
})