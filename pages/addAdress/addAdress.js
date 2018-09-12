//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    consignee:null, //收货人
    phoneNumber: null, //手机号码
    address:null //收货地址
  },
  onLoad(option){
	if(option.adrId != undefined && option.adrId!= null && option.adrId!="") {
		//填充数据
		let that = this;
		wx.request({
		  url: 'https://wechatapi.vipcsg.com/index/member/addres_list',
		  data: {
			user_id: app.globalData.userInfo.data.data.user_id
		  },
		  success(res) {
			let adressList= res.data.data;
			for(var i = 0 ;i<adressList.length ;i++){
				if(adressList[i].id == option.adrId){
					console.log(adressList[i].name)
					console.log(adressList[i].phone)
					console.log(adressList[i].addres)
					
					that.setData({
						consignee: adressList[i].name, 
						phoneNumber: adressList[i].phone, 
						address: adressList[i].addres 
					});
					break;
				}
			}
		  },
		})
	} 
  },
  getConsignee: function (e) {//收货人
    this.data.consignee = e.detail.value;
  },
  getNumber: function (e) {//手机号码
    this.data.phoneNumber = e.detail.value;
  },
  getAddress: function (e) {//地址
    this.data.address = e.detail.value;
  },
  //保存收货地址
  saveForm: function(){
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/address',
      method: 'POST',
      data: {
        "user_id": app.globalData.userInfo.data.data.user_id,
        "is_default": 1,
        "name": this.data.consignee,
        "phone": this.data.phoneNumber,
        "addres": this.data.address
      }, success(res) {
        console.log(res);
        debugger;
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
})
