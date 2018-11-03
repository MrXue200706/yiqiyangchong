//app.js
App({
  onLaunch: function () {
    
  },
  globalData: {
    userInfo: null
  },
  checkLogin(){
    if (this.globalData.userInfo == null || this.globalData.userInfo == undefined){
      this.loginApp()
    }
  },
  //用户登录
  loginApp() {
    var that = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res1) {
        if (res1.authSetting['scope.userInfo']) {
          //已授权过的，直接登录跳转
          that.loginUser();
        } else {
          //跳转到授权页面
          wx.navigateTo({
            url: '../login/login',
          })
        }
      }
    })
  },
  loginUser() {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          var code = res.code;
          wx.getUserInfo({ //getUserInfo流程
            success: function (res2) { //获取userinfo成功
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
                },
                success(resUser) {
                  that.globalData.userInfo = resUser
                  console.log(resUser);
                  //wx.setStorageSync('LoginSessionKey', resUser.data.data.user_id)  //保存在session中
                  //每日登陆积分
                  that.loginIntegral()
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
  loginIntegral() { //每日登陆积分
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/integral/sign_day',
      method: 'POST',
      data: {
        user_id: that.globalData.userInfo.data.data.user_id
      },
      success(res) {
        if (res.data.result == 1) {
          wx.showToast({
            title: '已领取每日登陆积分',
            icon: 'succes',
            duration: 3000,
            mask: true,
            success: function () { }
          })
        }
      },
    })
  }
})