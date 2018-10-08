//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
	pet_id: null, //萌宠ID
    petDetail: null, //萌宠详情
  },
  onLoad(options){
	  this.setData({
		pet_id: options.pet_id  
	  });
	  this.loadPetDetail(options.pet_id);
  },
  loadPetDetail(pId){
		let that = this;
		wx.request({
			url: 'https://wechatapi.vipcsg.com/index/member/pet_details',
			method: 'GET',
			data: {
			user_id: app.globalData.userInfo.data.data.user_id,
			pet_id: pId
			}, success(res) {
				console.log(res)
				that.setData({
					petDetail: res.data.data
				})
			},
		})
  }
})