//获取应用实例
const app = getApp()

Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    height:''
    //item:[{image:''}]
  },
  onLoad: function() {
   this.uploadApp()
    // this.setData({
    //   height: wx.getSystemInfoSync().windowHeight,
    //   width: wx.getSystemInfoSync().windowWidth
    // })

  },
  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      app.checkLogin()
      //跳转页面
      wx.switchTab({
        url: '../index/index'
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },
   // 小程序版本更新
   uploadApp(){
    if (wx.canIUse("getUpdateManager")) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function(res) {
        // console.log(res.hasUpdate);
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: "更新提示",
              content: "新版本已经准备好，是否重启应用？",
              success(res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(function() {
            // 新的版本下载失败
            wx.showModal({
              title: "已经有新版本了哟~",
              content: "新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~"
            });
          });
        }
      });
    } else {
      wx.showModal({
        title: "提示",
        content:
          "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。"
      });
    }
  },
  loginUser() {
    wx.login({
      success: function(res) {
        if (res.code) {
          var code = res.code;
          wx.getUserInfo({ //getUserInfo流程
            success: function(res2) { //获取userinfo成功
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
                },
                success(resUser) {
                  app.globalData.userInfo = resUser
                  console.log(resUser);
                  //app.globalData.userId = resUser.data.data.user_id
                  wx.setStorageSync('LoginSessionKey', resUser.data.data.user_id) //保存在session中
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