//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
		pet_id: null, //萌宠ID
		petDetail: null, //萌宠详情
		userInfoID:null,
		isshowEdit:true,
  },
  onLoad(options){
	  this.setData({
		pet_id: options.pet_id,
	//	userInfoID:options.user_id
	  });
	  this.loadPetDetail(options.pet_id,options.user_id);
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
					petDetail: res.data.data,
				//	isshowEdit:that.data.userInfoID==res.data.data.user_id
				})
			},
		})
  }
})