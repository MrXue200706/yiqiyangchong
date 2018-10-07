//index.js
//获取应用实例
const app = getApp()
//文件引用
var CusBase64 = require('../../utils/base64.js');

Page({
  data: {
    is_iframe: false, //点击购买按钮弹出选择弹出层
    type_one_active: null, //修改点击后的样式
    type_two_active: null, //修改点击后的样式
    type_one_selected: null, //选中的规格
    spec1: "0", //规格1
    spec2: "0", //规格2
    shopping: 'normal', //是否抢购，shopping：抢购商品，together：团购商品，normal：一般订单
    goods_detail: {}, //详情
    selected_numb: 1, //选择的数量
    descript: null, //描述
    collectTxt: "收藏", //收藏按钮显示文字
    collectId: null, //收藏id
    order_no: null, //参与团购的开团orderNo
    ct: 'n', //是否参与团购,n:不参团, y:参与团购
    flashsale_id: null, //抢购ID
    integralDK: 0 , //积分抵扣比例
    callback_id: null, //分享积分会掉获取
    receive_integral: null, //可领取的积分数 
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
    this.setData({
      shopping: o.type, //购买类别
      order_no: o.order_no == undefined ? null : o.order_no,
      ct: o.ct == undefined ? "n" : o.ct,
      flashsale_id: o.flashsale_id == undefined ? null : o.flashsale_id
    })
    //积分入口
    this.shareIntegralIn(o)
    //页面详情
    this.getGoodsDetail(o.id)




    if (o.type == "shopping") {
      this.setData({
        integralDK: Number(o.integralDK.replace(/%/g, ""))
      })
      if (o.start == "n") {
        //抢购尚未给开始

      } else {
        //integralDK
      }
    }
  },
  getGoodsDetail(id) { //获取页面细节
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/details',
      data: {
        goods_id: id
      },
      success(res) {
        console.log(res.data.data)
        that.setData({
          goods_detail: res.data.data
        });
        that.setData({
          descript: res.data.data.goods_desc
        });
        that.setData({
          type_one_selected: res.data.data.display_spec[0]
        });
        
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
      url: "../checkPay/checkPay?shopping=" + this.data.shopping + "&goods_id=" +
        this.data.goods_detail.id + "&type_selected1=" + this.data.spec1 + "&type_selected2=" +
        this.data.spec2 + "&selected_numb=" + this.data.selected_numb + "&ct=" +
        this.data.ct + "&order_no=" + this.data.order_no + "&image=" + this.data.type_one_selected.spec_img + "&flashsale_id=" + this.data.flashsale_id + "&callback_id=" + this.data.callback_id 
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
          //字体改为取消收藏
          that.setData({
            collectTxt: "取消收藏"
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
            //字体改为取消收藏
            that.setData({
              collectTxt: "取消收藏"
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
              collectTxt: "收藏"
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
      shopping: 'together'
    });
    this.iframeFn();
  },
  buyOwn() {
    this.setData({
      shopping: 'normal'
    });
    this.iframeFn();
  },
  onShareAppMessage: function (options) {
    //生成分享日期
    var date = new Date();
    var dataStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    var that = this;
    //设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: this.data.goods_detail.goods_name, //转发标题
      path: '/pages/goodsDetail/goodsDetail?oldshare_id=' + app.globalData.userInfo.data.data.user_id + '&id=' + this.data.goods_detail.id + '&share_type=' + this.data.shopping + '&share_date=' + dataStr, 
      imgUrl: this.data.goods_detail.goods_img_list[0].goods_img, //图片路径
      success: function (res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
          wx.showToast({
            title: '分享成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
            success: function () { }
          });
          //记录积分
          wx.request({
            url: 'https://wechatapi.vipcsg.com/index/share/callback',
            method: 'POST',
            data: {
              share_id: app.globalData.userInfo.data.data.user_id,
              share_type: this.data.shopping,
              param_id: this.data.goods_detail.id
            },
            success(res) {
              if (res.data.result) {
                wx.showToast({
                  title: '积分+' + res.data.data.share_integral,
                  icon: 'succes',
                  duration: 2000,
                  mask: true,
                  success: function () { }
                });
              }
            },
          })
        }
      },
      fail: function () {
        //转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          wx.showToast({
            title: '分享已取消',
            icon: 'none',
            duration: 1000,
            mask: true,
            success: function () { }
          });
        } else if (res.errMsg == 'shareAppMessage:fail') {
          wx.showToast({
            title: '分享失败，请稍后再试',
            icon: 'none',
            duration: 1000,
            mask: true,
            success: function () { }
          });
        }
      },
      complete: function () {
        // 转发结束之后的回调（转发成不成功都会执行）
      }
    };
    // 返回shareObj
    return shareObj;
  },
  shareIntegralIn(o){
    if (o.oldshare_id != undefined && o.share_date.length > 0) {
      let that = this;
      wx.request({
        url: 'https://wechatapi.vipcsg.com/index/share/receive_integral',
        data: {
          receive_id: app.globalData.userInfo.data.data.user_id,
          share_id: o.oldshare_id,
          share_type: o.share_type,
          param_id: o.id,
          share_date: o.dataStr,
        },
        success(res) {
          wx.showToast({
            title: 'msg: ' + res.data.msg,
            icon: 'none',
            duration: 5000
          })
          if(res.data.result==1){
            that.setData({
              receive_integral: res.data.data.receive_integral,
              callback_id: res.data.data.callback_id,
            })


            wx.showToast({
              title: 'callback_id: ' + this.data.callback_id,
              icon: 'none',
              duration: 5000
            })





          }
        },
      })
    }
  }
})