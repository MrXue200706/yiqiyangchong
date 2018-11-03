//index.js
//获取应用实例
const app = getApp()
var util = require('../../utils/md5.js')

Page({
  data: {
    orderList: null,
    orderDetail: null, //订单详情
    ptype: "unpay", //页面类型。 takegoods: 待收货页面，unpay: 待付款
    adrId: null,
    ptypeDict: {
      "unpay": "待付款",
      "takegoods": "待收货",
      "done": "已完成订单",
      "detail": "订单详情",
    }
  },
  onLoad(options) {
    this.setData({
      ptype: options.ptype,
      adrId: options.adrId == undefined ? null : options.adrId
    })

    //获取订单数据
    this.getOrderDetail(options.order_id);

    //设置导航头
    wx.setNavigationBarTitle({
      title: this.data.ptypeDict[this.data.ptype]
    })
  },
  getOrderDetail(oid) {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/order/details',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        order_id: oid
      },
      success(res) {
        console.log(res)
        if (res.data.result == 1) {
          that.setData({
            orderDetail: res.data.data
          })
        }
      },
    })

  },
  delOrder() { //取消订单
    if (this.data.orderDetail.order_status == 1) {
      let that = this;
      wx.showModal({
        title: '提示',
        content: '模态弹窗',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.request({
              url: 'https://wechatapi.vipcsg.com/index/order/cancel_order',
              method: 'POST',
              data: {
                user_id: app.globalData.userInfo.data.data.user_id,
                order_id: this.data.orderDetail.id
              },
              success(res) {
                if (res.data.result == 1) {
                  wx.showToast({
                    title: '取消成功',
                    icon: 'succes',
                    duration: 2000,
                    mask: true,
                    success: function() {
                      //返回订单列表页？
                      wx.navigateTo({
                        url: '../orderList/orderList?ptype=unpay',
                      })
                    }
                  })
                }
              },
            })
          } else {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.showToast({
        title: '该订单无法取消',
        icon: 'none',
        duration: 1000,
        mask: true,
        success: function() {
          //返回订单列表页？

        }
      })
    }
  },
  payNow() { //立即支付
    let that = this;
    let timeStamp = Date.parse(new Date())
    let nonceStr = this.randomWord(true, 16, 32)
    let packageStr = "prepay_id=" + this.data.orderDetail.prepay_id
    let paySignStr = util.hexMD5("appId=wxc7bf060c95b1645b&nonceStr=" + nonceStr + "&package=" + packageStr + "&signType=MD5&timeStamp=" + timeStamp + "&key=dbsDggC8AMXk8LBo30hlHvZ5GBtnjybx")
    //跳转微信支付
    wx.requestPayment({
      'timeStamp': String(timeStamp),
      'nonceStr': String(nonceStr),
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
            url: "../unpay/unpay?ptype=takegoods&order_id=" + that.data.orderDetail.id
          })
        }

      },
      'fail': function(res) {
        //跳转到待支付页面列表
        wx.navigateTo({
          url: "../orderList/orderList"
        })
        console.log("支付失败！！")
        // debugger;
      },
      'complete': function(res) {
        console.log("最终路线！！")
      }
    })
  },
  randomWord(randomFlag, min, max) { //生成随机字符串
    var str = "",
      range = min,
      arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    // 随机产生
    if (randomFlag) {
      range = Math.round(Math.random() * (max - min)) + min;
    }
    for (var i = 0; i < range; i++) {
      let pos = Math.round(Math.random() * (arr.length - 1));
      str += arr[pos];
    }
    return str;
  },
  test() {
    //跳转到待收货页面
    wx.navigateTo({
      url: "../unpay/unpay?ptype=takegoods&order_id=" + this.data.orderDetail.id
    })
  },
  takegoods() {
    var that = this
    console.log("确认收货按钮")
    //确认收货
    wx.showModal({
      title: '确认收货提示',
      content: '是否确认收货？',
      success: function (res) {
        if (res.confirm) {
          console.log("确认")
          wx.request({
            url: 'https://wechatapi.vipcsg.com/index/order/order_complete',
            method: 'POST',
            data: {
              user_id: app.globalData.userInfo.data.data.user_id,
              order_id: that.data.orderDetail.id
            }, success(res) {
              if (res.data.result == 1) {
                wx.showToast({
                  title: '收货成功',
                  icon: 'succes',
                  duration: 2000,
                  mask: true,
                  success: function () {
                    wx.navigateTo({
                      url: '../unpay/unpay?ptype=done&order_id=' + that.data.orderDetail.id
                    })
                  }
                })
              } else {
                console.log(res.data)
                wx.showToast({
                  title: '收货失败' + res.data.msg == null ? "" : "，" + res.data.msg,
                  icon: 'none',
                  duration: 2000,
                  mask: true,
                  success: function () { }
                })
              }
            },
          })
        } else {
          console.log("取消")
        }
      },
    })
  },
  chooseAdr() {
    wx.navigateTo({
      url: "../myAdress/myAdress?order_id=" + this.data.orderDetail.id
    })
  },
  copyONo() { //复制
    var that = this;
    wx.setClipboardData({
      data: this.data.orderDetail.order_no,
      success: function(res) {
        wx.showToast({
          title: '复制成功',
          icon: 'succes',
          duration: 1000,
          mask: true,
          success: function() {}
        })
      }
    })
  },
  retOrderList() { //返回订单列表
    wx.navigateTo({
      url: '../orderList/orderList?ptype=all',
    })
  }
})