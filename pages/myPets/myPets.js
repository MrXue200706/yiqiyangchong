//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    myPetList: null, //宠物列表
  },
  onLoad(){
	  this.getMyPetList();
  },
  getMyPetList(){
	  let that = this;
		wx.request({
		  url: 'https://wechatapi.vipcsg.com/index/member/pet_list',
		  method: 'GET',
		  data: {
			  user_id: app.globalData.userInfo.data.data.user_id
		  }, success(res) {
				console.log(res)
			  that.setData({
				  myPetList: res.data.data
			  })
		  },
		})

  }
})