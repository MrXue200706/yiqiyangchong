//获取应用实例
const app = getApp()

Page({
    data: {
        //判断小程序的API，回调，参数，组件等是否在当前版本可用。
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    onLoad: function () {
        
    },
    bindGetUserInfo: function (e) {
        if (e.detail.userInfo) {
            //用户按了允许授权按钮
            var that = this;
            //跳转页面
            wx.switchTab({
				  url: '../index/index'
			  })
        } else {
            //用户按了拒绝按钮
            wx.showModal({
                title:'警告',
                content:'您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
                showCancel:false,
                confirmText:'返回授权',
                success:function(res){
                    if (res.confirm) {
                        console.log('用户点击了“返回授权”')
                    } 
                }
            })
        }
    },
    loginUser(){
		wx.login({
		  success: function (res) {
			if (res.code) {
				var code = res.code;
				wx.getUserInfo({//getUserInfo流程
				success: function (res2) {//获取userinfo成功
				  console.log(res2);
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
							  //app.globalData.userId = resUser.data.data.user_id
							  wx.setStorageSync('LoginSessionKey', resUser.data.data.user_id)  //保存在session中
							  // console.log(that.data.goods_recommend)
							  //页面跳转
							  wx.switchTab({
								  url: '../index/index'
							  })
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
	}
})
