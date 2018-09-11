//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    
  },
  onLoad(){
    this.getUserInfoDetail();//获取用户数据
  },
  bindGetUserInfo:function(e){
    console.log(e.detail.userinfo);
    if(e.detail.userinfo){
      //用户点击了授权
    }else{
      //用户取消授权
      console.log("取消授权xxx")
    }
  },
  getUserInfoDetail:function(){
    /*
    //获取用户数据
    let userId = wx.getStorageSync("LoginSessionKey");
    console.log("userId: " + userId);
    //http://wechatapi.vipcsg.com/index/member/my_info
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/my_info',
      method: 'GET',
      data: {
        user_id: userId
      }, success(resUser) {
        debugger;
        console.log(resUser);
      },
    })*/
    console.log(app.globalData.userInfo)
  }
})