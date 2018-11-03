function checkLogin(){

}

//用户登录
function loginApp() {
  // 查看是否授权
  wx.getSetting({
    success: function (res1) {
      if (res1.authSetting['scope.userInfo']) {
        //已授权过的，直接登录跳转
        loginUser();
      } else {
        //跳转到授权页面
        wx.navigateTo({
          url: '../login/login',
        })
      }
    }
  })
}

function loginUser() {
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
                app.globalData.userInfo = resUser
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
}