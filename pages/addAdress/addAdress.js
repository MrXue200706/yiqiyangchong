//index.js
//获取应用实例
const app = getApp()

Page({
	data: {
		adrId: null, //地址ID
		region: ["广东省", "广州市", ""], //默认省份地区
		type: null, //编辑/新增状态
		consignee: null, //收货人
		phoneNumber: null, //手机号码
		address: null, //收货地址
		defaultFlag: 1, //设为默认的状态
		order_id: null,
		from: null,
		litmitArea: []
	},
	onLoad(options) {
		//	console.log(options);
		if (options.adrId != undefined && options.adrId != null && options.adrId != "") {
			//编辑状态，填充数据
			let that = this;
			wx.request({
				url: 'https://wechatapi.vipcsg.com/index/member/addres_list',
				data: {
					user_id: app.globalData.userInfo.data.data.user_id
				},
				success(res) {
					let adressList = res.data.data;
					for (var i = 0; i < adressList.length; i++) {
						if (adressList[i].id == options.adrId) {
							that.setData({
								consignee: adressList[i].name,
								phoneNumber: adressList[i].phone,
								region: that.splitAddress(adressList[i].addres),
								address: that.splitAddress(adressList[i].addres).length >= 4 ? that.splitAddress(adressList[i].addres)[3] : " "
							});
							break;
						}
					}
				},
			})
			this.setData({
				adrId: options.adrId,
				type: options.type,
				from: options.from,
				order_id: options.order_id
			});
			wx.setNavigationBarTitle({
				title: '编辑收货地址'
			})
		}
	},
	onShow(options) {
		var value = wx.getStorageSync('adressAddoK');
		var valuelist = wx.getStorageSync('adressAddListoK');
		var payok = wx.getStorageSync('ispayok');
		if (payok) {
			wx.setStorage({
				key: "ispayok",
				data: false
			});
			wx.switchTab({
				url: '../index/index',
			})
			return;
		}
		if (value && valuelist) {
			// console.log(pages[0].route);
			// let ulr=pages[0].route.replace("pages","..")
			// console.log(ulr)
			wx.setStorage({
				key: "adressAddoK",
				data: false
			});
			wx.setStorage({
				key: "adressAddListoK",
				data: false
			});
			// wx.switchTab({
			// 	url: '../mine/mine',
			// })
			return;
		}
		console.log(options)
		this.getlimitArea()

	},
	getlimitArea() {
		let that = this
		wx.request({
			url: 'https://wechatapi.vipcsg.com/index/order/area_limit',
			method: 'get',
			data: {},
			success(res) {
				console.log(res.data.data)
				that.setData({
					litmitArea: res.data.data
				})
			},
		})
	},
	splitAddress(address) {
		if (!address) {
			return null
		}
		var adderssArr = address.split("-");
		return adderssArr
	},
	setDefault() {
		console.log(!this.data.defaultFlag)
		this.setData({
			defaultFlag: !this.data.defaultFlag
		})
	},
	getConsignee: function (e) { //收货人
		this.data.consignee = e.detail.value;
	},
	getNumber: function (e) { //手机号码
		let tel = e.detail.value.replace(/[^\d]/g, "")
		this.setData({
			phoneNumber: tel
		})
	},
	getAddress: function (e) { //地址
		this.setData({
			address: e.detail.value
		})
	},
	bindAreaChange: function (e) { //地区修改
		this.setData({
			region: e.detail.value
		})
	},
	navigatebacks() {
		var that = this;
		var pages = getCurrentPages();
		//var petAddoK="";
		var value = wx.getStorageSync('adressAddoK')
		console.log(value)
		if (value) {
			console.log(pages[0].route);
			let ulr = pages[0].route.replace("pages", "..")
			console.log(ulr)
			wx.setStorage({
				key: "adressAddoK",
				data: false
			});
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
	checkFormData() { //表单数据校验
		if (!this.data.consignee) {
			wx.showToast({
				title: '请输入收货人',
				icon: 'none',
				duration: 2000,
				mask: true
			});
			return false;
		}
		if (!this.data.phoneNumber) {
			wx.showToast({
				title: '请输入手机号码',
				icon: 'none',
				duration: 2000,
				mask: true
			});
			return false;
		}
		if (!(/^1[34578]\d{9}$/.test(this.data.phoneNumber))) {
			wx.showToast({
				title: '请输入正确的手机号码',
				icon: 'none',
				duration: 2000,
				mask: true
			});
			return false;
		}
		if (!this.data.region[2]) {
			wx.showToast({
				title: '请选择所在地区',
				icon: 'none',
				duration: 2000,
				mask: true
			});
			return false;
		}
		if (!this.data.address) {
			wx.showToast({
				title: '请输入详细地址',
				icon: 'none',
				duration: 2000,
				mask: true
			});
			return false;
		} else {
			return true;
		}
	},
	checkArea(limitArr, getarea) {
		if (!limitArr) {
			return []
		}
		return limitArr.some(
			function (val) {
				return val.areaname == getarea
			}
		)
	},
	//保存收货地址
	saveForm: function () {
		let that = this
		let area = this.data.region[0] + "-" + this.data.region[1] + "-" + this.data.region[2] + "-";
		let from = this.data.from;
		let arid = this.data.adrId
		console.log(this.checkArea(this.data.litmitArea, this.data.region[0]))
		if (this.checkArea(this.data.litmitArea, this.data.region[0]) == true) {
			wx.showToast({
				title: ' 所在地址暂不支持销售',
				icon: 'none',
				duration: 2000,
				mask: true
			});
			return
		}
		console.log(arid)
		if (!that.checkFormData()) {
			return
		}
		var pageroute = getCurrentPages();
		console.log(pageroute)
		let fromcheckpay = pageroute.filter(function (item) {
			return item.route == "pages/checkPay/checkPay"
		})
		let fromMine=pageroute.filter(function(item){
			return item.route == "pages/mine/mine"
		})
		let hotTroopDetailList=pageroute.filter(function(item){
			return item.route == "pages/hotTroopDetail/hotTroopDetail"
		})
		let eventDetailList=pageroute.filter(function(item){
			return item.route == "pages/eventDetail/eventDetail"
		})


		var checkpayUrl;
		if (fromcheckpay.length > 0) {
			checkpayUrl = "../checkPay/checkPay?ct=" + fromcheckpay[0].options.ct + "&events_id=" + fromcheckpay[0].options.events_id + "&goods_id=" + fromcheckpay[0].options.goods_id + "&order_no=" + fromcheckpay[0].options.order_no + "&selected_numb=" + fromcheckpay[0].options.selected_numb + "&shopping=" + fromcheckpay[0].options.shopping + "&shoppingType=" + fromcheckpay[0].options.shoppingType + "&type_selected1=" + fromcheckpay[0].options.type_selected1 + "&type_selected2=" + fromcheckpay[0].options.type_selected2 + "&image=" + fromcheckpay[0].options.image;
			console.log(checkpayUrl)
		}
		//	return;
		if (this.data.type != null && this.data.type != "" && this.data.type == "editAdr") {
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
					"addres": area + this.data.address,
				},
				success(res) {
					console.log(res)
					if (res.data.result == 1) {
						//保存成功
						wx.setStorage({
							key: "adressAddoK",
							data: true
						});
						console.log(from)
						if(fromMine.length){
							wx.setStorage({
								key: "fromMine",
								data: true
							});
							//获取页面栈
							var pages = getCurrentPages();
							console.log(pages)
							//获取上一页
							var prePage = pages[pages.length - 2]
							let addrMsg={
								is_default: that.data.defaultFlag,
								name: that.data.consignee,
								phone: that.data.phoneNumber,
								addres: area + that.data.address,
							}
							prePage.setData({
								address_id: that.data.adrId,
								addressMsg: addrMsg
							})
							//返回上一页
							wx.navigateBack();
							return

						}else{
							wx.setStorage({
								key: "fromMine",
								data: false
							});
						}
						if (from && from !== "null") {
							wx.setStorage({
								key: "adressAddoK",
								data: false
							});
							wx.setStorage({
								key: "adressAddListoK",
								data: false
							});
							//获取页面栈
							var pages = getCurrentPages();
							console.log(pages)
							//获取上一页
							var prePage = pages[pages.length - 2]
							let addrMsg={
								is_default: that.data.defaultFlag,
								name: that.data.consignee,
								phone: that.data.phoneNumber,
								addres: area + that.data.address,
							}
							prePage.setData({
								address_id: that.data.adrId,
								addressMsg: addrMsg
							})
							//返回上一页
							wx.navigateBack();

							// if(checkpayUrl){
							// 	wx.navigateTo({
							// 		url: checkpayUrl
							// 	})
							// }else{
							// 	//获取页面栈
							// 	var pages = getCurrentPages();
							// 	console.log(pages)
							// 	//获取上一页
							// 	var prePage = pages[pages.length - 2]
							// 	let addrMsg={
							// 		is_default: that.data.defaultFlag,
							// 		name: that.data.consignee,
							// 		phone: that.data.phoneNumber,
							// 		addres: area + that.data.address,
							// 	}
							// 	prePage.setData({
							// 		address_id: that.data.adrId,
							// 		addressMsg: addrMsg
							// 	})
							// 	//返回上一页
							// 	wx.navigateBack();
							// }
						} else {
							wx.navigateTo({
								url: '../myAdress/myAdress',
							})
						}
					} else {
						//保存失败

					}
				},
			})
		} else {
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
				},
				success(res) {
					if (res.data.result == 1) {
						// //保存成功
						// wx.setStorage({key:"adressAddoK",data:true});
						// if(that.data.order_id&that.data.order_id!="null"){
						// 	wx.navigateTo({
						// 	  url: "../unpay/unpay?ptype=unpay&order_id=" + order_id + "&adrId=" + arid
						// 		})
						//保存成功
						wx.setStorage({
							key: "adressAddoK",
							data: true
						});
						if(fromMine.length){
							wx.setStorage({
								key: "fromMine",
								data: true
							});
							//获取页面栈
							var pages = getCurrentPages();
							console.log(pages)
							//获取上一页
							var prePage = pages[pages.length - 2]
							let addrMsg={
								is_default: that.data.defaultFlag,
								name: that.data.consignee,
								phone: that.data.phoneNumber,
								addres: area + that.data.address,
							}
							prePage.setData({
								address_id: that.data.adrId,
								addressMsg: addrMsg
							})
							//返回上一页
							wx.navigateBack();
							return
						}else{
							wx.setStorage({
								key: "fromMine",
								data: false
							});
						}
						console.log(from)
						if (fromcheckpay.length > 0 || hotTroopDetailList.length > 0 ||eventDetailList.length > 0) {
							wx.setStorage({
								key: "adressAddoK",
								data: false
							});
							wx.setStorage({
								key: "adressAddListoK",
								data: false
							});
							//获取页面栈
							var pages = getCurrentPages();
							console.log(pages)
							//获取上一页
							var prePage = pages[pages.length - 2]
							let addrMsg={
								is_default: that.data.defaultFlag,
								name: that.data.consignee,
								phone: that.data.phoneNumber,
								addres: area + that.data.address,
							}
							prePage.setData({
								address_id: that.data.adrId,
								addressMsg: addrMsg
							})
							//返回上一页
							wx.navigateBack();
							return
						} else {
							wx.navigateTo({
								url: '../myAdress/myAdress',
							})
						}

					} else {
						//保存失败

					}
				},
			})
		}
	}
})