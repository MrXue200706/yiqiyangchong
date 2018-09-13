//index.js
//获取应用实例
const app = getApp()
var util = require('../../utils/md5.js') 

Page({
  data: {
    goods_id: null,//商品id
	goods_detail:{},//详情
	type_selected: null,//选择规格
	selected_numb: 1,//选择数量
	totalPay: 100000,//费用合计
	address_id: 0	//地址ID
  },
  onLoad: function (options) { 
	this.setData({
		goods_id: options.goods_id,
		type_selected: options.type_selected,
		selected_numb: options.selected_numb,
	});
	if(options.adrId != undefined ){
		this.setData({
			address_id: options.adrId
		});
	}
	this.getGoodsDetail(options.goods_id);
  },
  getGoodsDetail(id) {//获取页面细节
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
		that.totalPayCount();//更新价格
      },
    })
  },
  numberReduceFn(){//减
    this.setData({selected_numb:Number(this.data.selected_numb)-1});
    Number(this.data.selected_numb) < 1 ? 
    this.setData({selected_numb:1}):null;
	this.totalPayCount();
  },
  numberAddFn(){//加
    this.setData({selected_numb:Number(this.data.selected_numb)+1});
	this.totalPayCount();
  },
  totalPayCount(){//计算价格，重新设置价格
	let list = this.data.goods_detail.goods_spec_list
	for ( var i = 0; i <list.length; i++){
		if(list[i].spec_value == this.data.type_selected || list[i].spec_value_2 == this.data.type_selected){
			this.setData({
				totalPay : (Number(list[i].spec_price) * Number(this.data.selected_numb)).toFixed(2)
			});
			console.log("价格："+ this.data.totalPay);
		}
	}
  },
  chooseAdr(){//选择地址
	wx.navigateTo({
	  url: "../myAdress/myAdress?type=shopping&goods_id="+this.data.goods_id+"&type_selected="+this.data.type_selected+"&selected_numb="+this.data.selected_numb
	})
  },
  payNow(){//立即支付
	//获取选择规格全部信息
	let spec_list = this.data.goods_detail.goods_spec_list;
	let type_selected1 = null; //规格1
	let type_selected2 = null; //规格2
	for ( var i = 0; i <spec_list.length; i++){
		if(spec_list[i].spec_value == this.data.type_selected || spec_list[i].spec_value_2 == this.data.type_selected){
			type_selected1 = spec_list[i].spec_value;
			type_selected2 = spec_list[i].spec_value_2;
		}
	}
	let that = this;
	
	
	console.log("user_id: "+ app.globalData.userInfo.data.data.user_id)
	console.log("goods_id: "+ that.data.goods_id)
	console.log("coupons_id: "+ "")
	console.log("address_id: "+ that.data.address_id)
	console.log("number: "+ that.data.selected_numb)
	console.log("spec_1: "+ type_selected1)
	console.log("spec_2: "+ type_selected2)
	
  
	//提交订单
	wx.request({
      url: 'https://wechatapi.vipcsg.com/index/order/submit',
	  method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        goods_id: that.data.goods_id,
		coupons_id: "",
        address_id: that.data.address_id,
        number: that.data.selected_numb,
        spec_1: type_selected1,
        spec_2: type_selected2,
      },
      success(res) {
		if(res.data.result == 1){
			console.log(res)
			let payData = res.data.data;
			let packageStr = "prepay_id="+payData.prepay_id
			let paySignStr = util.hexMD5("appId=wxc7bf060c95b1645b&nonceStr="+payData.nonceStr+"&package="+packageStr+"&signType=MD5&timeStamp="+payData.timeStamp+"&key=dbsDggC8AMXk8LBo30hlHvZ5GBtnjybx")
			debugger;
			//跳转微信支付
			wx.requestPayment({
				'timeStamp': String(payData.timeStamp),
				'nonceStr': String(payData.nonceStr),
				'package': packageStr,
				'signType': 'MD5',
				'paySign': paySignStr,
				'success':function(res){
					//跳转到待收货页面
					wx.navigateTo({
					  url: "../unpay/unpay?order_status=1"
					})
					console.log("支付成功！！")
					debugger;
					
				},
				'fail':function(res){
					//跳转到待支付页面
					wx.navigateTo({
					  url: "../unpay/unpay?order_status=1"
					})
					console.log("支付失败！！")
					debugger;
				},
				'complete':function(res){
					console.log("最终路线！！")
				}
			})
		}
      },
    })
  }
})
