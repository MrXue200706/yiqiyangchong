//index.js
//获取应用实例
const app = getApp()
app.checkLogin()

Page({
  data: {
    userInfo: {},
    isDlaigShow:false,
    isFirstDlaigShow:false,
    eventList:[],
    isJoin:false,
    teamId:''
  },
  onLoad() {
    //this.shareIntegralIn(o)
    app.checkLogin()
    // this.getUserInfoDetail(); //获取用户数据，刷新数据
    // this.isJoinTeam()
    // this.getEventsList()
    //由于onLoad只加载一次数据，所以改用onShow每次都刷新数据
  },
  onShow() {
    this.getUserInfoDetail(); //获取用户数据，刷新数据
    this.isJoinTeam()
    this.getEventsList()
  },
  bindGetUserInfo: function(e) {
    console.log(e.detail.userinfo);
    if (e.detail.userinfo) {
      //用户点击了授权
    } else {
      //用户取消授权
      console.log("取消授权xxx")
    }
  },
  getEventsList(){
    let that = this;
    var useid="";
    if(app.globalData.userInfo==null||app.globalData.userInfo==undefined){
      useid=wx.getStorageSync('LoginSessionKey')
    }
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/eventslike',
      method: 'GET',
      data: {
        user_id: useid || app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        if (res.data.result == 1) {
          console.log(res.data.data)
          that.setData({
            eventList: res.data.data
          })
        }
      },
    })
  },
  // 判断是否已加入战队
  isJoinTeam(){
    let that = this
    var useid="";
    if(app.globalData.userInfo==null||app.globalData.userInfo==undefined){
      useid=wx.getStorageSync('LoginSessionKey')
    }
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/team/is_team_member',
      data: {user_id:useid||app.globalData.userInfo.data.data.user_id},
      success(res) {
        if(res.data.result==1){
          that.setData({
            isJoin: res.data.data.is_team_member,
            teamId:res.data.data.team_id
          }) 
        }
       
        // debugger;
        console.log(that.data.pet_expert)
      },
    })

  },
  getUserInfoDetail: function() {
    let that = this;
    console.log(app.globalData)
    var useid="";
    if(app.globalData.userInfo==null||app.globalData.userInfo==undefined){
      useid=wx.getStorageSync('LoginSessionKey')
    }
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/my_info',
      method: 'GET',
      data: {
        user_id:useid || app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        console.log(res)
        if (res.data.result == 1) {
          console.log(res.data.data)
          that.setData({
            userInfo: res.data.data
          })
        }
      },
    })
  },
  cooperation() { //合作
    //(临时测试用)
    if(this.data.isJoin){
      wx.navigateTo({
        url: '../hotTroopDetail/hotTroopDetail?team_id='+this.data.teamId
       // success: function(res) {},
        // fail: function(res) {},
        // complete: function(res) {},
      })
    }else{
      wx.navigateTo({
        url: '../hotTroopMake/hotTroopMake'
       // success: function(res) {},
        // fail: function(res) {},
        // complete: function(res) {},
      })
    }
    
  },
  changeFirstShowDiag(){
    this.setData({
      isFirstDlaigShow: false
    })  
  },
  showRedBag(){
    this.setData({
      isFirstDlaigShow: true
    })
  },
  changeShowDiag() {
    this.setData({
      isDlaigShow: false
    })
  },
  loginIntegral() { //每日登陆积分
    let that = this;
    var useid="";
    if(app.globalData.userInfo==null||app.globalData.userInfo==undefined){
      useid=wx.getStorageSync('LoginSessionKey')
    }
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/integral/sign_day',
      method: 'POST',
      data: {
        user_id: useid||app.globalData.userInfo.data.data.user_id,
      },
      success(res) {
        // setTimeout(()=>{
        //   that.setData({
        //     isDlaigShow: true
        //   })
        // },300)
        if (res.data.result == 1) {
          wx.showToast({
            title: '已领取每日登陆积分',
            icon: 'succes',
            duration: 1000,
            mask: true,
            success: function () { }
          })
          // setTimeout(()=>{
          //   that.setData({
          //     isDlaigShow: true
          //   })
          // },1000)
         
        }else{
          wx.showToast({
            title: res.data.msg || '当天已领取"',
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