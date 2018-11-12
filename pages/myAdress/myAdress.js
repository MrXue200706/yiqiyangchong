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
    from:null
  },
  onHide(){
	//	this.navigatebacks();
	},
  onLoad(options) {
    console.log(options)
    this.setData({
      type: options.type == undefined ? 'editAdr' : options.type,
      goods_id: options.goods_id == undefined ? null : options.goods_id,
      type_selected1: options.type_selected1 == undefined ? null : options.type_selected1,
      type_selected2: options.type_selected1 == undefined ? null : options.type_selected2,
      selected_numb: options.selected_numb == undefined ? null : options.selected_numb,
      ct: options.ct == undefined ? null : options.ct,
      order_no: options.order_no == undefined ? null : options.order_no,
      order_id: options.order_id == undefined ? null : options.order_id,
      from:options.from == undefined ? null : options.from,
    })
    this.getAddressList();
    var value = wx.getStorageSync('adressAddoK');
    if (value) {
      // console.log(pages[0].route);
      // let ulr=pages[0].route.replace("pages","..")
      // console.log(ulr)
      wx.setStorage({key:"adressAddListoK",data:true});
    }
   // this.navigatebacks();
  },
 
  
  getAddressList() {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/addres_list',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        that.setData({
          adressList: res.data.data
        })
      },
    })
  },
  navigatebacks(){
		var that = this;
		var pages = getCurrentPages();
		//var petAddoK="";
		var value = wx.getStorageSync('adressAddoK')
		console.log(value)
			if (value) {
				console.log(pages[0].route);
				let ulr=pages[0].route.replace("pages","..")
				console.log(ulr)
        wx.setStorage({key:"adressAddoK",data:false});
        //debugger
				wx.switchTab({
					url: '../mine/mine',
				})
				// wx.navigateTo({
				// 	url: "../mine/mine"
				// });
			} else {
				//wx.navigateBack({ changed: true });//返回上一页
			}
	},
  chooseAdr(e) {
    let adrId = e.currentTarget.dataset.id;
    let addrMsg = e.currentTarget.dataset.item;
    console.log(addrMsg)
    //debugger;
    console.log(this.data.order_id)
    if (this.data.order_id != null){
      //待支付页面跳转过来
      wx.navigateTo({
        url: "../unpay/unpay?ptype=unpay&order_id=" + this.data.order_id + "&adrId=" + adrId
      })
    } else if (this.data.type == "shopping" || this.data.type == "together" || this.data.type == "normal"||this.data.type == "activity") {
      //获取页面栈
      var pages = getCurrentPages();
      //获取上一页
      var prePage = pages[pages.length - 2]
      prePage.setData({
        address_id: adrId,
        addressMsg: addrMsg
      })
      //返回上一页
      wx.navigateBack();
    } else {
      //进入编辑页面
      wx.setStorage({key:"adressAddoK",data:false});
      wx.navigateTo({
        url: '../addAdress/addAdress?type=editAdr&&order_id=' + this.data.order_id+'&adrId=' + adrId,
      });
    }
  },
  editAddr(e){
    let adrId = e.currentTarget.dataset.id;
    //进入编辑页面
    wx.setStorage({key:"adressAddoK",data:false});
    console.log(this.data)
    wx.navigateTo({
      url: '../addAdress/addAdress?type=editAdr&from=' + this.data.from+'&adrId=' + adrId,
    });
  },
  setDef(e) {
    let adrId = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;
    let phone = e.currentTarget.dataset.phone;
    let address = e.currentTarget.dataset.address;
    //let isdef = e.currentTarget.dataset.def;
    let isdef = 1;

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
          var pages = getCurrentPages();
          var route = null;
          var prePage = null;
          if (pages.length > 1) {
            prePage = pages[pages.length - 2];
            route = prePage.route;
            //prePage.onLoad()
          }
          //判断是否从支付页面进来，是则更新上一层页面的地址
          if (prePage != null && route.indexOf("pages/checkPay/checkPay") != -1){
              prePage.fullDefaultAddress();
          }
          wx.showToast({
            title: '设置成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
          })
          //设置高亮操作xxxxxxxxxxTODO
          that.getAddressList();
          
                  
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
  getWXAdr() {//获取微信地址
    var that = this;
    if (wx.chooseAddress) {
      wx.chooseAddress({
        success: function (res) {
          console.log(JSON.stringify(res));
          console.log(res);
          //新增地址
          wx.request({
            url: 'https://wechatapi.vipcsg.com/index/member/address',
            method: 'POST',
            data: {
              "user_id": app.globalData.userInfo.data.data.user_id,
              "is_default": 1,
              "name": res.userName,
              "phone": res.telNumber,
              "addres": res.provinceName + res.cityName + res.countyName + res.detailInfo
            }, success(res) {
              if (res.data.result == 1) {
                //保存成功
                that.getAddressList();
              }
            },
          })
        },
        fail: function (err) {
          console.log(JSON.stringify(err));
          console.info("收货地址授权失败");
          wx.showToast({
            title: '授权失败，您将无法进行下单支付;重新授权请删除小程序后再次进入',
            icon: 'success',
            duration: 20000
          })
        }
      })
    } else {
      console.log('当前微信版本不支持选择地址');
    }
  }
})