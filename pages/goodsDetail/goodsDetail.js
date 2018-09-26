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
    type_one_selected: {}, //选中的规格
    shopping: 'normal', //是否抢购，shopping：抢购商品，together：团购商品，normal：一般订单
    goods_detail: {}, //详情
    selected_numb: 1, //选择的数量
    descript: null, //描述
    collectTxt: "收藏", //收藏按钮显示文字
    collectId: null, //收藏id
    order_no: null, //参与团购的开团orderNo
    ct: 'n', //是否参与团购,n:不参团, y:参与团购
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
      type_one_selected: type_select
    });
    this.setData({
      type_one_active: id
    });
  },
  typeTwoFn(event) { //规格2选择
    let id = event.currentTarget.id;
    this.setData({
      type_two_active: id
    });
  },
  onLoad(o) {
    if (o.type == 'shopping') {
      this.setData({
        shopping: 'shopping'
      })
    } else if (o.type == 'together') {
      this.setData({
        shopping: 'together',
        order_no: o.order_no,
        ct: 'y'
      })
    }
    //请求
    this.getGoodsDetail(o.id);
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
        });
        that.setData({
          descript: res.data.data.goods_desc
        });
        that.setData({
          type_one_selected: res.data.data.display_spec[0]
        });
        console.log(res.data.data)
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
    if (JSON.stringify(this.data.type_selected) == '{}' ? true : false) {
      wx.showToast({
        title: '请填写商品规格',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    wx.navigateTo({
      url: "../checkPay/checkPay?shopping=" + this.data.shopping + "&goods_id=" + this.data.goods_detail.id + "&type_selected=" + this.data.type_selected + "&selected_numb=" + this.data.selected_numb + "&ct=" + this.data.ct + "&order_no=" + this.data.order_no
    })

    //this.subMitOrderFun();
  },
  checkCollect() { //检查是否已收藏
    let that = this;
    wx.request({
      url: 'http://wechatapi.vipcsg.com/index/goods/is_collection',
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

    console.log(app.globalData.userInfo);
    console.log();
    /*
        //提交表单数据，生成订单ID
        wx.request({
          url: 'https://wechatapi.vipcsg.com/index/order/submit',
          data: {
            "user_id": app.globalData.userInfo.data.data.user_id, //用户ID
            "goods_id": this.data.goods_detail.id, //商品ID
            "coupons_id": "", //优惠ID
            "address_id": "", //收货地址ID
            "number": this.data.selected_numb, //商品数量
            "spec_1": this.data.type_selected, //规格值1
            //"spec_2": "" 规格值1
          },
          success(res) {
            that.setData({
              goods_detail: res.data.data
            })
            console.log(that.data.goods_detail)
          },
        })

        wx.navigateTo({
          url: '/page/admin/details',
        })*/
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
    console.log("come in")
    wx.switchTab({
      url: '../index/index',
    })
  },
  buyTogether(){//团购订单修改入口
    this.setData({
      shopping: 'together'
    });
    this.iframeFn();
  },
  buyOwn(){
    this.setData({
      shopping: 'normal'
    });
    this.iframeFn();
  }
})