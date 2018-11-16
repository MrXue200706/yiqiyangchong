//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
	adrId: null, //地址ID
  region: ["广东省","广州市",""],//默认省份地区
	type: null, //编辑/新增状态
    consignee:null, //收货人
    phoneNumber: null, //手机号码
    address:null ,//收货地址
		defaultFlag:1,//设为默认的状态
		order_id:null,
		from:null
  },
  onLoad(options) {
	//	console.log(options);
	if(options.adrId != undefined && options.adrId!= null && options.adrId!="") {
		//编辑状态，填充数据
		let that = this;
		wx.request({
		  url: 'https://wechatapi.vipcsg.com/index/member/addres_list',
		  data: {
			user_id: app.globalData.userInfo.data.data.user_id
		  },
		  success(res) {
			let adressList= res.data.data;
			for(var i = 0 ;i<adressList.length ;i++){
				if(adressList[i].id == options.adrId){
					that.setData({ 
						consignee: adressList[i].name, 
						phoneNumber: adressList[i].phone, 
						region:that.splitAddress(adressList[i].addres),
						address: that.splitAddress(adressList[i].addres).length>=4? that.splitAddress(adressList[i].addres)[3]:" "
					});
					break;
				}
			}
		  },
		})
		this.setData({
			adrId: options.adrId,
			type: options.type,
			from:options.from,
			order_id:options.order_id
		});
		wx.setNavigationBarTitle({ title: '编辑收货地址' })  
	}
	},
	onShow(options){
		var value = wx.getStorageSync('adressAddoK');
		var valuelist = wx.getStorageSync('adressAddListoK');
		var payok = wx.getStorageSync('ispayok');
		if(payok){
			wx.setStorage({key:"ispayok",data:false});
			wx.switchTab({
				url: '../index/index',
			})
			return;
		}
    if (value&&valuelist) {
      // console.log(pages[0].route);
      // let ulr=pages[0].route.replace("pages","..")
			// console.log(ulr)
			wx.setStorage({key:"adressAddoK",data:false});
			wx.setStorage({key:"adressAddListoK",data:false});
			wx.switchTab({
				url: '../mine/mine',
			})
			return;
		}
		console.log(options)

	},
	splitAddress(address){
		if(!address){
			return null
		}
		var adderssArr=address.split("-");
		return adderssArr
	},
  setDefault() {
    console.log(!this.data.defaultFlag)
		this.setData({
			defaultFlag:!this.data.defaultFlag
		})
	},
  getConsignee: function (e) {//收货人
    this.data.consignee = e.detail.value;
  },
  getNumber: function (e) {//手机号码
    let tel = e.detail.value.replace(/[^\d]/g, "")
    this.setData({
      phoneNumber:tel
    })
  },
  getAddress: function (e) {//地址
    this.setData({
      address: e.detail.value
    })
  },
  bindAreaChange: function (e) {//地区修改
    this.setData({
      region: e.detail.value
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
  //保存收货地址
  saveForm: function(){
	let that=this
		let area = this.data.region[0] +"-"+ this.data.region[1]+"-" + this.data.region[2]+"-";
		let from=this.data.from;
		let arid=this.data.adrId
		console.log(arid)
		var pageroute=getCurrentPages();
		console.log(pageroute)
		let fromcheckpay=pageroute.filter(function(item){
			return item.route=="pages/checkPay/checkPay"
		})
		var checkpayUrl;
		if(fromcheckpay.length>0){	
			checkpayUrl="../checkPay/checkPay?ct="+fromcheckpay[0].options.ct+"&events_id=" +fromcheckpay[0].options.events_id + "&goods_id=" + fromcheckpay[0].options.goods_id+ "&order_no=" + fromcheckpay[0].options.order_no+ "&selected_numb=" + fromcheckpay[0].options.selected_numb+ "&shopping=" + fromcheckpay[0].options.shopping+ "&shoppingType=" + fromcheckpay[0].options.shoppingType+ "&type_selected1=" + fromcheckpay[0].options.type_selected1+ "&type_selected2=" + fromcheckpay[0].options.type_selected2+ "&image=" + fromcheckpay[0].options.image;
			console.log(checkpayUrl)
		}
	//	return;
	if(this.data.type != null && this.data.type != "" && this.data.type == "editAdr") {
    //编辑状态
		wx.request({
		  url: 'https://wechatapi.vipcsg.com/index/member/update_address',
		  method: 'POST',
		  data: {
			"address_id": this.data.adrId,
			"user_id": app.globalData.userInfo.data.data.user_id,
			"is_default": this.data.defaultFlag,
			"name": this.data.consignee,
			"phone": this.data.phoneNumber,
        "addres": area +this.data.address,
		  }, success(res) {
			console.log(res)
			if (res.data.result == 1){
				//保存成功
				wx.setStorage({key:"adressAddoK",data:true});
				console.log(from)
				if(from&&from!=="null"){
					wx.setStorage({key:"adressAddoK",data:false});  
					wx.setStorage({key:"adressAddListoK",data:false}); 
					wx.navigateTo({
					  url: checkpayUrl
						})
				}else{
					wx.navigateTo({
						url: '../myAdress/myAdress',
						})
				}		
			}else{
			  //保存失败

			}
		  },
		})
	}else{
		//新增状态
	  wx.request({
		  url: 'https://wechatapi.vipcsg.com/index/member/address',
		  method: 'POST',
		  data: {
			"user_id": app.globalData.userInfo.data.data.user_id,
			"is_default": 1,
			"name": this.data.consignee,
			"phone": this.data.phoneNumber,
			"addres": area + this.data.address
		  }, success(res) {
			if (res.data.result == 1){
				// //保存成功
				// wx.setStorage({key:"adressAddoK",data:true});
				// if(that.data.order_id&that.data.order_id!="null"){
				// 	wx.navigateTo({
				// 	  url: "../unpay/unpay?ptype=unpay&order_id=" + order_id + "&adrId=" + arid
				// 		})
				//保存成功
				wx.setStorage({key:"adressAddoK",data:true});
				console.log(from)
				if(fromcheckpay.length>0){
					wx.setStorage({key:"adressAddoK",data:false});  
					wx.setStorage({key:"adressAddListoK",data:false}); 
					wx.navigateTo({
					  url: checkpayUrl
						})
				}else{
					wx.navigateTo({
						url: '../myAdress/myAdress',
						})
				}
			
			}else{
			  //保存失败

			}
		  },
		})
	}
  }
})
