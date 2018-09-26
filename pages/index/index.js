//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    swiper: [], //轮播图片
    goods_index: [], //首页商品列表
    pet_expert:[],//养宠达人列表
    special_topic:[],//专题
    goods_recommend:[],//活动

  },
  onLoad() {
    //请求
    this.getSwiper();
    this.getGoodsIndex();
    this.getPetExpert();
    this.getSpecialTopic();
    this.getGoodsRecommend();
	this.loginApp();
  },

  //请求轮播图
  getSwiper() {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/slider/index',
      data: {},
      success(res) {
        that.setData({
          swiper: res.data.data
        })
        // console.log(that.data.swiper)
      },
    })
  },

  //请求商品列表
  getGoodsIndex(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/index',
      data: {},
      success(res) {
        that.setData({
          goods_index: res.data.data
        })
        console.log(that.data.goods_index)
      },
    })
  },

  //养宠达人
  getPetExpert(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/friend/index',
      data: {},
      success(res) {
        that.setData({
          pet_expert: res.data.data
        })
        // debugger;
        console.log(that.data.pet_expert)
      },
    })
  },

  //专题
  getSpecialTopic(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/project/index',
      data: {},
      success(res) {
        that.setData({
          special_topic: res.data.data
        })
        // console.log(that.data.special_topic)
      },
    })
  },

  //活动
  getGoodsRecommend(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/events/index',
      data: {},
      success(res) {
        that.setData({
          goods_recommend: res.data.data
        })
        // console.log(that.data.goods_recommend)
      },
    })
  },
  
  //用户登录
  loginApp(){
	  var that = this;
        // 查看是否授权
        wx.getSetting({
            success: function (res1) {
                if (res1.authSetting['scope.userInfo']) {
				    //已授权过的，直接登录跳转
				    that.loginUser();
                }else{
					//跳转到授权页面
					wx.navigateTo({
					   url: '../login/login', 
					})
				}
            }
        })
  },
  loginUser(){
		wx.login({
		  success: function (res) {
			if (res.code) {
				var code = res.code;
				wx.getUserInfo({//getUserInfo流程
				success: function (res2) {//获取userinfo成功
				  var encryptedData = encodeURIComponent(res2.encryptedData);
				  var iv = res2.iv;
				  //发起网络请求
				  wx.request({
						url: 'https://wechatapi.vipcsg.com/index/member/login',
						method: 'POST',
						data: {
						  code: res.code,
						  encryptedData: encryptedData,
						  iv: iv
						},success(resUser) {
							  app.globalData.userInfo = resUser
							  console.log(resUser);
							  wx.setStorageSync('LoginSessionKey', resUser.data.data.user_id)  //保存在session中
						  },
							  })
						}
				  })
					  
			} else {
				console.log('登录失败！' + res.errMsg)
				//跳转到授权页面
				wx.navigateTo({
				   url: '../login/login', 
				})
			}
		  }
		})	
	},

  //关注
  focusOn(e){
    let friend_id = e.currentTarget.dataset.friendid
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/follow',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        follow_id: friend_id
      }, success(res) {
        if(res.data.result==1){
          //弹窗提示
          wx.showToast({
            title: '关注成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
            success: function () {
              //按钮变黑
              
            }
          })
        }
      },
    })
  }
})