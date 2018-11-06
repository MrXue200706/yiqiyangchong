//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
		pet_id: null, //萌宠ID
		petDetail: null, //萌宠详情
		userInfoID:null,
		isshowEdit:true,
    showOnLike: false
  },
  onLoad(options){
    app.checkLogin()
	  this.setData({
		pet_id: options.pet_id,
		userInfoID:app.globalData.userInfo.data.data.user_id
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
					isshowEdit:that.data.userInfoID==res.data.data.user_id,
          showOnLike: res.data.data.is_like == 0
				})
			},
		})
  },
  onShareAppMessage: function (event) {
    var shareUrl = '/pages/petsDetail/petsDetail?pet_id=' + this.data.pet_id
    var that = this;
    //设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: "我的萌宠", //转发标题
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
  giveLove(){//萌宠点赞
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/like',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        pet_id: this.data.pet_id
      }, success(res) {
        if (res.data.result == 1) {
          wx.showToast({
            title: '点赞成功',
            icon: 'succes',
            duration: 2000,
            mask: true,
            success: function () { }
          })
          //修改显示状态

          //重新刷新宠物详情
          that.loadPetDetail(that.data.pet_id)
        }
      },
    })
  },
  downLove(){//取消点赞
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/unlike',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        pet_id: this.data.pet_id
      }, success(res) {
        if (res.data.result == 1) {
          wx.showToast({
            title: '取消成功',
            icon: 'succes',
            duration: 2000,
            mask: true,
            success: function () { }
          })
          //重新刷新宠物详情
          that.loadPetDetail(that.data.pet_id)
        }
      },
    })
  },
  gotoIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  },
})
