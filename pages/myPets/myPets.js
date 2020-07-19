//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
		myPetList: null, //宠物列表
		//petAddoK:"",
		pointList:[],
		jionFrends:[],
		sharePetgetid:'',
		sharePetName:''
	},
  onLoad(){
		this.getMyPetList();
		this.getRewardDetails()
		var value = wx.getStorageSync('petAddoK');
    if (value) {
      // console.log(pages[0].route);
      // let ulr=pages[0].route.replace("pages","..")
      // console.log(ulr)
      wx.setStorage({key:"petAddlistoK",data:true});
    }
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
	delthepet(e){
		let that=this;
		console.log(e)
		wx.request({
		  url: 'https://wechatapi.vipcsg.com/index/member/delete_pet',
		  method: 'post',
		  data: {
				user_id: app.globalData.userInfo.data.data.user_id,
				pet_id:e.currentTarget.dataset.petid
		  }, success(res) {
				console.log(res)
				if(res.data.result==1){
					wx.showToast({
						title: '删除成功',
						icon: 'succes',
						duration: 2000,
						mask: true,
						success: function() {
							that.getMyPetList()
							//返回订单列表页？
							// wx.navigateTo({
							// 	url: '../orderList/orderList?ptype=unpay',
							// })
						}
					})
				}
				var pages = getCurrentPages(); // 获取页面栈
			//	console.log(pages)
		  },
		})
	},
	// 获取喂食任务
	getRewardDetails(){
	  let that = this;
		wx.request({
		  url: 'https://wechatapi.vipcsg.com/index/member/reward_details',
		  method: 'GET',
		  data: {
			  user_id: app.globalData.userInfo.data.data.user_id
		  }, success(res) {
				if(res.data.result==1){
					const pointList=[]
					res.data.data.reward.forEach(ele => {
						ele.like_number && ele.integral && ele.like_number>=res.data.data.all_day_like && (pointList.push(ele))
					});
					if(!pointList.length){
						let len=res.data.data.reward.length
						if(len){
							pointList.push(res.data.data.reward[len])
						}
					}
					console.log(pointList)
					that.setData({
						pointList: pointList,
						jionFrends:res.data.data.like_member_list
					})
				}
			  that.setData({
				  //myPetList: res.data.data
				})
			//	console.log(pages)
		  },
		})
	},

	gotopetdetail(e){
		wx.navigateTo({
			url:"../petsDetail/petsDetail?pet_id="+e.currentTarget.dataset.petid+"&editmore=true"
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
	},

	 //分享
	 onShareAppMessage: function (event) {
		console.log(event)
		this.setData({
			sharePetgetid:event.target.dataset.petgetid,
			sharePetName:event.target.dataset.petname
		})	
    var shareUrl = '/pages/petsDetail/petsDetail?pet_id=' + this.data.sharePetgetid+'&shareDate=true'+''
		var that = this;
		console.log(shareUrl)
    //设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: '喂食萌宠' + that.data.sharePetName, //转发标题
      path: shareUrl,
      //imgUrl: this.data.pet_details.pet_img[0] == undefined ? "" : this.data.pet_details.pet_img[0].pet_img, //图片路径
      success: function (res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
          wx.showToast({
            title: '分享成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
            success: function () { }
          });
        }
      },
      fail: function () {
        //转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          //用户取消转发
          wx.showToast({
            title: '分享已取消',
            icon: 'none',
            duration: 1000,
            mask: true,
            success: function () { }
          });
        } else if (res.errMsg == 'shareAppMessage:fail') {
          //转发失败，其中 detail message 为详细失败信息
          wx.showToast({
            title: '分享失败，请稍后再试',
            icon: 'none',
            duration: 1000,
            mask: true,
            success: function () { }
          });
        }
      },
      complete: function () {
        // 转发结束之后的回调（转发成不成功都会执行）
      }
    };
    // 返回shareObj
    return shareObj;
  },

})