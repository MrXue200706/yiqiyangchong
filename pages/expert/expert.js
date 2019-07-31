//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    expertDetail: null, //养宠达人个人中心
    isActive:false,
    keyId:null,
  },
  onLoad(options){
    this.setData(
      {keyId:options.key}
    )
    this.getDetail(options.key);
    this.getUsefollowsList()
  },
  getDetail(key){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/info',
      method: 'GET',
      data: {
        user_id: key
      }, success(res) {
        that.setData({
          expertDetail: res.data.data
        })
        console.log(res)
      },
    })
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
        console.log(that.data.keyId)
        if(res.data.result == 1){
          var fliterList=res.data.data.filter(item =>{
             return item.follow_id==that.data.keyId
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
        }
        
      },
    })
  },
  //取消关注
  toNoActive(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/unfollow',
      method: 'post',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        follow_id:that.data.keyId
      }, success(res) {
        console.log(res)
        console.log(that.data.keyId)
        if(res.data.result == 1){
          //弹窗提示
          // wx.showToast({
          //   title: '取消关注成功',
          //   icon: 'succes',
          //   duration: 1000,
          //   mask: true,
          //   success: function () {
          //   }
          // })
          that.getUsefollowsList()
        }
      },
    })
  },
  //去关注
  toActive(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/follow',
      method: 'post',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        follow_id:that.data.keyId
      }, success(res) {
        console.log(res)
        console.log(that.data.keyId)
        if(res.data.result == 1){
          //弹窗提示
          // wx.showToast({
          //   title: '关注成功',
          //   icon: 'succes',
          //   duration: 1000,
          //   mask: true,
          //   success: function () {
          //   }
          // })
          that.getUsefollowsList()
        }
      },
    })
  }

})