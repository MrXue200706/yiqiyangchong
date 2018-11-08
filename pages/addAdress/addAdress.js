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
		defaultFlag:0,//设为默认的状态
  },
  onLoad(options) {
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
			type: options.type
		});
		wx.setNavigationBarTitle({ title: '编辑收货地址' })  
	}
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
  //保存收货地址
  saveForm: function(){
    let area = this.data.region[0] +"-"+ this.data.region[1]+"-" + this.data.region[2]+"-";
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
			  wx.navigateTo({
				url: '../myAdress/myAdress',
			  })
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
			  //保存成功
			  wx.navigateTo({
				url: '../myAdress/myAdress',
			  })
			}else{
			  //保存失败

			}
		  },
		})
	}
  }
})
