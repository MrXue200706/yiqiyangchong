//index.js
//获取应用实例
const app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

Page({
  data: {
    type: null,
    adressList: {},
    goods_id: null, //商品id，临时存储
    type_selected1: null, //选择规格1，临时存储
    type_selected2: null, //选择规格2，临时存储
    selected_numb: 1, //选择数量，临时存储
    couponId: null, //优惠券id
    order_no: null, //订单NO
    ct: 'n', //参团情况
    order_id: null, //订单id，如果不为null，则是支付页跳过来选择地址
  },
  onLoad(options) {
    this.setData({
      type: options.type == undefined ? 'editAdr' : options.type,
      goods_id: options.goods_id == undefined ? null : options.goods_id,
      type_selected1: options.type_selected1 == undefined ? null : options.type_selected1,
      type_selected2: options.type_selected1 == undefined ? null : options.type_selected2,
      selected_numb: options.selected_numb == undefined ? null : options.selected_numb,
      ct: options.ct == undefined ? null : options.ct,
      order_no: options.order_no == undefined ? null : options.order_no,
      order_id: options.order_id == undefined ? null : options.order_id,
    })
    this.getAddressList();
  },
  getAddressList() {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/addres_list',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        console.log(res);
        that.setData({
          adressList: res.data.data
        })
      },
    })
  },
  chooseAdr(e) {
    let adrId = e.currentTarget.dataset.id;
    if (this.data.order_id != null){
      //待支付页面跳转过来
      wx.navigateTo({
        url: "../unpay/unpay?ptype=unpay&order_id=" + this.data.order_id + "&adrId=" + adrId
      })
    } else if (this.data.type == "shopping" || this.data.type == "together" || this.data.type == "normal") {
      //如果是在购买页面跳转过来的，单击直接填充地址
      //获取页面栈
      var pages = getCurrentPages();
      //获取上一页
      var prePage = pages[pages.length - 2]
      prePage.setData({
        address_id: adrId
      })
      //返回上一页
      wx.navigateBack();
      /*
      wx.navigateTo({
        url: "../checkPay/checkPay?shopping=" + this.data.type + "&adrId=" + adrId + "&goods_id=" + this.data.goods_id + "&type_selected1=" + this.data.type_selected1 + "&type_selected2=" + this.data.type_selected2 + "&selected_numb=" + this.data.selected_numb + "&order_no=" + this.data.order_no + "&ct=" + this.data.ct + "&couponId=" + this.data.couponId
      });
      */
    } else {
      //进入编辑页面
      wx.navigateTo({
        url: '../addAdress/addAdress?type=editAdr&adrId=' + adrId,
      });
    }
  },
  setDef(e) {
    let adrId = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;
    let phone = e.currentTarget.dataset.phone;
    let address = e.currentTarget.dataset.address;
    let isdef = e.currentTarget.dataset.def;

    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/update_address',
      method: 'POST',
      data: {
        "address_id": adrId,
        "user_id": app.globalData.userInfo.data.data.user_id,
        "is_default": isdef,
        "name": name,
        "phone": phone,
        "addres": address
      },
      success(res) {
        if (res.data.result == 1) {
          wx.showToast({
            title: '设置成功',
            icon: 'succes',
            duration: 1000,
            mask: true
          })
          //设置高亮操作xxxxxxxxxxTODO


        } else {
          //保存失败
          wx.showToast({
            title: '设置出错，请稍后再试',
            icon: 'none',
            duration: 1000,
            mask: true
          })
        }
      },
    })
  },
  delAdr(e) {
    let adrId = e.currentTarget.dataset.id;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认删除当前地址？',
      success: function(res) {
        if (res.confirm) { //这里是点击了确定以后
          wx.request({
            url: 'https://wechatapi.vipcsg.com/index/member/delete_address',
            method: 'POST',
            data: {
              user_id: app.globalData.userInfo.data.data.user_id,
              address_id: adrId
            },
            success(res) {
              wx.showToast({
                title: '删除成功',
                icon: 'succes',
                duration: 1000,
                mask: true,
                success: function() {
                  that.getAddressList(); //更新数据
                }
              })
            },
          })
        } else { //这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },
  getWXAdr() {
    wx.authorize({
      scope: 'scope.address',
      success() {
        var that = this
        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
          key: 'J2ABZ-TYRY6-Z4ISF-MW23G-L4TFZ-Q5FLM' // 必填
        });
        //1、获取当前位置坐标
        wx.getLocation({
          type: 'wgs84',
          success: function(res) {
            //2、根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
            qqmapsdk.reverseGeocoder({
              location: {
                latitude: res.latitude,
                longitude: res.longitude
              },
              success: function(addressRes) {
                console.log(addressRes);
                var address = addressRes.result.address;
                console.log(address)
              },
              fail: function(data) {
                // debugger;
              }
            })
          }
        })
      }
    })


  }
})