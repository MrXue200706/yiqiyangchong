//index.js
//获取应用实例
const app = getApp()
//文件引用
var CusBase64 = require('../../utils/base64.js');

Page({
  data: {
    is_iframe: false, //点击购买按钮弹出选择弹出层
    type_one_active: 0, //修改点击后的样式
    type_two_active: 0, //修改点击后的样式
    type_one_selected: null, //选中的规格
    spec1: "0", //规格1
    spec2: "0", //规格2
    shopping: 'normal', //是否抢购，shopping：抢购商品，，normal：一般订单，activity：活动栏
    shoppingType: 'normal', //normal：直接购买，together：团购商品
    goods_detail: {}, //详情
    selected_numb: 1, //选择的数量
    descript: null, //描述
    collectTxt: "收藏", //收藏按钮显示文字
    showCollect: false,
    collectId: null, //收藏id
    order_no: null, //参与团购的开团orderNo
    ct: 'n', //是否参与团购,n:不参团, y:参与团购
    flashsale_id: null, //抢购ID
    integralDK: 0, //积分抵扣比例
    callback_id: null, //分享积分会掉获取
    receive_integral: null, //可领取的积分数
    events_id: null, //活动ID
    ishowCloseBtn: true,
    isteambuy: false,
    isjifen: false,
    startNow: false, //抢购是否已开始
    // index:0,
  },
  iframeFn() { //规格选择弹出
    this.setData({
      is_iframe: !this.data.is_iframe
    });
  },
  typeOneFn(event) { //规格1选择
    let type_select = event.currentTarget.dataset.type;
    let id = event.currentTarget.id;
    this.setData({
      type_one_selected: type_select,
      spec1: event.currentTarget.dataset.spec
    });
    this.setData({
      type_one_active: id
    });
  },
  typeTwoFn(event) { //规格2选择
    let type_select = event.currentTarget.dataset.spec;
    let id = event.currentTarget.id;
    this.setData({
      type_two_selected: type_select,
      spec2: event.currentTarget.dataset.spec
    });
    this.setData({
      type_two_active: id
    });
  },
  onLoad(o) {
    app.checkLogin()
    this.setData({
      shopping: o.type, //购买类别
      shoppingType: o.shoppingType == undefined ? null : o.shoppingType,
      order_no: o.order_no == undefined ? null : o.order_no,
      ct: o.ct == undefined ? "n" : o.ct,
      flashsale_id: o.flashsale_id == undefined ? null : o.flashsale_id,
      events_id: o.events_id == undefined ? null : o.events_id,
      is_iframe: o.showprice == undefined ? null : o.showprice,
      ishowCloseBtn: o.showprice == undefined ? true : false,
      isjifen: o.shareType == undefined ? false : true,
      callback_id: o.callback_id == undefined ? null : o.callback_id,
    })
    //typeOneFn()
    //typeTwoFn(event) 
    //积分入口
    this.shareIntegralIn(o)

    if (o.type == "shopping") {
      if (o.start == "n") {
        //抢购尚未给开始，查看商品详情，显示尚未开始按钮
        this.setData({
          startNow: false
        })
      } else {
        this.setData({
          startNow: true
        })
      }
      //抢购商品页面详情
      this.getGoodsDetail(o.id)
    } else {
      //页面详情
      this.getGoodsDetail(o.id)
    }
  },
  getGoodsDetail(id, flashsaleId, eventsId) { //获取页面细节
    let queryUrl = "https://wechatapi.vipcsg.com/index/goods/details"
    if (this.data.shopping == "shopping") {
      queryUrl = "https://wechatapi.vipcsg.com/index/flashsale/details"
    } else if (this.data.shopping == "activity") {
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
        console.log(res.data.data)
        that.setData({
          goods_detail: res.data.data,
          descript: res.data.data.goods_desc,
          type_one_selected: res.data.data.display_spec[0]
        });
        if (that.data.shopping == "shopping") {
          that.setData({
            integralDK: Number(res.data.data.integral.replace(/%/g, ""))
          })
        }

        //检查是否已收藏
        that.checkCollect();
      },
    })
  },
  numberReduceFn() { //减
    this.setData({
      selected_numb: this.data.selected_numb - 1
    });
    this.data.selected_numb < 1 ?
      this.setData({
        selected_numb: 1
      }) : null;
  },
  numberAddFn() { //加
    this.setData({
      selected_numb: this.data.selected_numb + 1
    })
  },
  submitOrder() {
    //数据校验
    if (this.data.type_one_selected.spec_name) {
      this.data.spec1 = this.data.type_one_selected.spec_name;
    }
    if (this.data.type_one_selected.spec_option[0].spec_value_2) {
      this.data.spec2 = this.data.type_one_selected.spec_option[0].spec_value_2;
    }
    if (this.data.type_one_selected.spec_option[0].spec_value_2) {
      if (this.data.spec1 == "0" || this.data.spec2 == "0") {
        wx.showToast({
          title: '请填写商品规格',
          icon: 'none',
          duration: 2000
        })
        return;
      }
    } else {
      if (this.data.spec1 == "0") {
        wx.showToast({
          title: '请填写商品规格',
          icon: 'none',
          duration: 2000
        })
        return;
      }
    }

    wx.navigateTo({
      url: "../checkPay/checkPay?shopping=" + this.data.shopping + "&shoppingType=" + this.data.shoppingType + "&goods_id=" +
        this.data.goods_detail.id + "&type_selected1=" + this.data.spec1 + "&type_selected2=" +
        this.data.spec2 + "&selected_numb=" + this.data.selected_numb + "&ct=" +
        this.data.ct + "&order_no=" + this.data.order_no + "&image=" + this.data.type_one_selected.spec_img + "&flashsale_id=" + this.data.flashsale_id + "&callback_id=" + this.data.callback_id + "&events_id=" + this.data.events_id
    })


    //this.subMitOrderFun();
  },
  checkCollect() { //检查是否已收藏
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/is_collection',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        goods_id: this.data.goods_detail.id
      },
      success(res) {
        var isCollection = res.data.data.collection;
        if (isCollection == 1) {
          //字体改为已收藏
          that.setData({
            collectTxt: "已收藏",
            showCollect: true,
          });
        }
      },
    })
  },
  subMitOrderFun() {
    //获取用户地址数据
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/addres_list',
      data: {
        "user_id": app.globalData.userInfo.data.data.user_id,
      },
      success(res) {
        //获取到默认地址
        if (res.result == 1) {
          //获取默认收货地址
          pages / checkPay / checkPay
        } else {
          //获取收货地址出错
        }
      },
    })
  },
  collectProduct() { //收藏商品
    let that = this;
    //判断收藏与取消
    if (this.data.collectTxt == "收藏") {
      wx.request({
        url: 'https://wechatapi.vipcsg.com/index/goods/collection',
        method: 'POST',
        data: {
          user_id: app.globalData.userInfo.data.data.user_id,
          goods_id: this.data.goods_detail.id
        },
        success(res) {
          if (res.data.result == 1) {
            //字体改为已收藏
            that.setData({
              collectTxt: "已收藏",
              showCollect: true,
            });

            wx.showToast({
              title: '已收藏',
              icon: 'succes',
              duration: 1000,
              mask: true,
              success: function() {}
            })
          }
        },
      })
    } else {
      wx.request({
        url: 'https://wechatapi.vipcsg.com/index/goods/delete_collection',
        method: 'POST',
        data: {
          user_id: app.globalData.userInfo.data.data.user_id,
          goods_id: this.data.goods_detail.id
        },
        success(res) {
          if (res.data.result == 1) {
            //字体改为收藏
            that.setData({
              collectTxt: "收藏",
              showCollect: false,
            });
            wx.showToast({
              title: '已取消',
              icon: 'succes',
              duration: 1000,
              mask: true,
              success: function() {}
            })
          }
        },
      })
    }

  },
  gotoIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  },
  buyTogether() { //团购订单修改入口
    this.setData({
      shoppingType: 'together'
    });
    this.iframeFn();
  },
  buyOwn() {
    this.setData({
      shoppingType: 'normal'
    });
    this.iframeFn();
  },
  onShareAppMessage: function(options) {
    let that = this
    let urlStr = '/pages/goodsDetail/goodsDetail?type=' + this.data.shopping + '&id=' + this.data.goods_detail.id + '&param_id=' + this.data.goods_detail.id + '&events_id=' + this.data.events_id
    if (this.data.shopping == "shopping") {
      urlStr = "/pages/goodsDetail/goodsDetail?type=shopping&start=" + (this.data.startNow == true ? 'y' : 'n') + "&integralDK=" + this.data.integralDK + "%&flashsale_id=" + this.data.flashsale_id + "&id=" + this.data.goods_detail.id
    }
    //设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: this.data.goods_detail.goods_name, //转发标题
      path: urlStr,
      imgUrl: this.data.goods_detail.goods_img_list[0].goods_img, //图片路径
      success: function(res) {
        // 分享成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
          wx.showToast({
            title: '分享成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
            success: function() {}
          });
          //记录积分
          wx.request({
            url: 'https://wechatapi.vipcsg.com/index/share/callback',
            method: 'POST',
            data: {
              share_id: app.globalData.userInfo.data.data.user_id,
              share_type: 'goods',
              param_id: that.data.goods_detail.id
            },
            success(res) {
              if (res.data.result) {
                wx.showToast({
                  title: '积分+' + res.data.data.share_integral,
                  icon: 'succes',
                  duration: 2000,
                  mask: true,
                  success: function() {}
                });
              }
            },
          })
        }
      },
      fail: function() {
        //转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          wx.showToast({
            title: '分享已取消',
            icon: 'none',
            duration: 1000,
            mask: true,
            success: function() {}
          });
        } else if (res.errMsg == 'shareAppMessage:fail') {
          wx.showToast({
            title: '分享失败，请稍后再试',
            icon: 'none',
            duration: 1000,
            mask: true,
            success: function() {}
          });
        }
      },
      complete: function() {
        // 转发结束之后的回调（转发成不成功都会执行）
      }
    };
    // 返回shareObj
    return shareObj;
  },
  shareIntegralIn(o) {
    let that = this;
    if (o.oldshare_id != undefined && o.share_date.length > 0) {
      //TODO 注：由于领取积分需要登录，所以该处需要处理登录信息(貌似我点进来就自己自动登录了。) cao
      if (app.globalData.userInfo == null || app.globalData.userInfo.data.data.user_id == undefined) {
        // 查看是否授权
        wx.getSetting({
          success: function(res1) {
            if (res1.authSetting['scope.userInfo']) {
              //已授权过的，直接登录跳转
              that.loginUser();
            } else {
              //跳转到授权页面
              wx.navigateTo({
                url: '../login/login',
              })
            }
          }
        })
      }

      wx.request({
        url: 'https://wechatapi.vipcsg.com/index/share/receive_integral',
        method: 'POST',
        data: {
          receive_id: app.globalData.userInfo.data.data.user_id,
          share_id: o.oldshare_id,
          share_type: o.type,
          param_id: o.id,
          share_date: o.share_date,
        },
        success(res) {
          // wx.showToast({
          //   title: 'msg: ' + res.data.msg,
          //   icon: 'none',
          //   duration: 5000
          // })
          if (res.data.result == 1) {
            that.setData({
              receive_integral: res.data.data.receive_integral,
              callback_id: res.data.data.callback_id,
            })
          }
        },
      })
    }
  },

  //用于处理积分入口没登录的情况
  loginUser() {
    var that = this;
    wx.login({
      success: function(res) {
        if (res.code) {
          var code = res.code;
          wx.getUserInfo({ //getUserInfo流程
            success: function(res2) { //获取userinfo成功
              var encryptedData = encodeURIComponent(res2.encryptedData);
              var iv = res2.iv;
              //发起网络请求
              wx.request({
                url: 'https://wechatapi.vipcsg.com/index/member/login',
                method: 'POST',
                data: {
                  code: res.code,
                  encryptedData: encryptedData,
                  iv: iv
                },
                success(resUser) {
                  app.globalData.userInfo = resUser
                  console.log(resUser);
                  //wx.setStorageSync('LoginSessionKey', resUser.data.data.user_id)  //保存在session中
                  //每日登陆积分
                  that.loginIntegral()
                },
              })
            }
          })

        } else {
          console.log('登录失败！' + res.errMsg)
          //跳转到授权页面
          wx.navigateTo({
            url: '../login/login',
          })
        }
      }
    })
  },
})