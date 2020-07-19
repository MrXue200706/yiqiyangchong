//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
		pet_id: null, //萌宠ID
		petDetail: null, //萌宠详情
		userInfoID:null,
		isshowEdit:true,
    showOnLike: false,
    showimages:false,
    showIndex:0,
    petMan_id:'',
    isActive:'',
    petList:'',
    pageType:'',
    isownId:false,
  },
  onLoad(options){
    app.checkLogin()
	  this.setData({
		pet_id: options.pet_id,
		userInfoID:app.globalData.userInfo.data.data.user_id
	  });
    this.loadPetDetail(options.pet_id,options.user_id);
    wx.setStorage({key:"petAddoK",data:false});
    wx.setStorage({key:"petAddlistoK",data:false});
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
          isownId: res.data.data.user_id==app.globalData.userInfo.data.data.user_id,
					petDetail: res.data.data,
					isshowEdit:that.data.userInfoID==res.data.data.user_id,
          showOnLike: res.data.data.is_like == 0,
          petMan_id:res.data.data.user_id,
          pageType: res.data.data.user_id == app.globalData.userInfo.data.data.user_id ? 'mine':false
        })
        console.log(that.data.pageType)
        that.getPetMan()
			},
		})
  },
  getPetMan(){
    let that = this;
		wx.request({
			url: 'https://wechatapi.vipcsg.com/index/member/info',
			method: 'GET',
			data: {
			user_id: that.data.petMan_id
			}, success(res) {
				console.log(res)
				that.setData({
					petList: res.data.data,
        })
        that.getUsefollowsList()
			},
		})
  },
  loadimg(event){
    console.log(event)
    event.detail = {height:'120rpx', width:'120rpx'}
  },
  //获取用户follows列表
  getUsefollowsList(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/my_follow',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      }, success(res) {
        console.log(res)
        console.log(that.data.petMan_id)
        if(res.data.result == 1){
          var fliterList=res.data.data.filter(item =>{
             return item.follow_id==that.data.petMan_id
          })
          if(fliterList.length>0){
            that.setData({
              isActive:true
            })
          }else{
            that.setData({
              isActive:false
            })
          }
          console.log(fliterList)
        }
        
      },
    })
  },
  fansFocus(e) {//粉丝列表按钮
    let txt = e.currentTarget.dataset.txt
    if (txt =="取消关注"){
      this.unFocusOn(e)
    }else{
      let that = this;
      wx.request({
        url: 'https://wechatapi.vipcsg.com/index/member/follow',
        method: 'POST',
        data: {
          user_id: app.globalData.userInfo.data.data.user_id,
          follow_id: that.data.petMan_id
        }, success(res) {
          if (res.data.result == 1) {
            //弹窗提示
            wx.showToast({
              title: '关注成功',
              icon: 'succes',
              duration: 1000,
              mask: true,
              success: function () {
                //按钮变黑
                that.getUsefollowsList()
              }
            })
          }
        },
      })
    }
  },
  unFocusOn(e) {//取消关注
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/unfollow',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        follow_id: that.data.petMan_id
      }, success(res) {
        if (res.data.result == 1) {


          //弹窗提示
          wx.showToast({
            title: '取消成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
            success: function () {
              //刷新列表
              that.getUsefollowsList()
            }
          })
        }
      },
    })
  },
  changshow(e){
    console.log(e)
    this.setData({
      showimages:!this.data.showimages,showIndex:e.currentTarget.dataset.showindex || 0
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
