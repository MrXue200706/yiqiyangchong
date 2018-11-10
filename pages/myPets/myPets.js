//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
		myPetList: null, //宠物列表
		//petAddoK:""
	},
	onUnload(){
		this.navigateBack();
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
				var pages = getCurrentPages(); // 获取页面栈
			//	console.log(pages)
		  },
		})
	},
	navigateBack:function(){
		var that = this;
		var pages = getCurrentPages();
		//var petAddoK="";
		var value = wx.getStorageSync('petAddoK')
		console.log(value)
			if (value) {
				console.log(pages[0].route);
				let ulr=pages[0].route.replace("pages","..")
				console.log(ulr)
				wx.setStorage({key:"petAddoK",data:false});
				wx.switchTab({
					url: '../mine/mine',
				})
				// wx.navigateTo({
				// 	url: "../mine/mine"
				// });
			} else {
				wx.navigateBack({ changed: true });//返回上一页
			}
		// wx.navigateBack({
		// 	delta: 1
		// 	})
	}

})