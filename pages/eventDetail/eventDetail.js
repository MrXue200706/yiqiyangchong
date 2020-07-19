//index.js
//获取应用实例
const app = getApp()
app.checkLogin()

Page({
  data: {
    special_topic_detail:{},//详情
    specialid:"",
    islike:0,
    joinChoujian:"joinChoujian",
    backgroundCol:'#fff',
    like_member_list:[],
    isLikeEvent:false,
    isShare:false,
    receiveId:"",
    shareUseId:'',
    isSelfShare:false,
    isNewEvent:false,//是否拉新
    isAdressmodalHidden:true,
    cechaEvent:'',
    submitAddress:'',
    addressMsg:[]
  },
  onLoad(o){
    console.log(o)
    this.setData({
      specialid: o.id,
      isShare:o.shareDate || false,
      shareUseId:o.shareUseId || '',
      receiveId:o.receiveId||''
    })
    
    // this.initIsSelf()
    // if(this.data.receiveId){
    //   this.getIslikeEvents()
    // }else{
    //   this.getUserIsEvent()
    //   this.eventsReceive()
    // }
    // this.getAddressList(true)
    //this.getSpecialTopicDetail(o.id);
    //this.geteventslike()
  },
  onShow(o){
     //console.log(o)
    // this.setData({
    //   specialid: o.id,
    //   isShare:o.shareDate || false,
    //   shareUseId:o.shareUseId || '',
    //   receiveId:o.receiveId||''
    // })
    
    this.initIsSelf()
    if(this.data.receiveId){
      this.getIslikeEvents()
    }else{
      this.getUserIsEvent()
      this.eventsReceive()
    }
    this.getAddressList(true)
    this.userIsLogin()
  },
  initIsSelf(){
    this.setData({
      isSelfShare:this.data.shareUseId == app.globalData.userInfo.data.data.user_id
    })
  },
  // 好友点赞
  setEventJion(){
    let that = this;
    // let ell='user_id'+app.globalData.userInfo.data.data.user_id.toString()+'events_id'
    // +that.data.specialid+'receive_id'+that.data.receiveId+'is_new'+app.globalData.userInfo.data.data.is_new
    // wx.showToast({
    //   title: ell,
    //   icon: 'none',
    //   duration: 6000,
    //   mask:true
    // })
    // return
    // 判断是否拉新活动
    console.log(this.data.isNewEvent)
    console.log(app.globalData.userInfo.data.data.is_new)
    console.log('参数')
    if(this.data.isNewEvent){
      if(app.globalData.userInfo.data.data.is_new!=1){
        wx.showToast({
          title: '您不是新用户，无法助力',
          icon: 'none',
          duration: 1000,
          mask:true
        })
        return
      }
    }
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/eventslike/like',
      method: 'POST',
      data: {
        events_id:that.data.specialid,
        user_id:app.globalData.userInfo.data.data.user_id,
        receive_id:that.data.receiveId,
        is_new:app.globalData.userInfo.data.data.is_new || 0
        //user_id:19
      },
      success(res) {
        if(res.data.result==1){
          wx.showToast({
            title: '成功',
            icon: 'succes',
            duration: 1000,
            mask:true
          })
          that.getUserIsEvent()
        }else{
          wx.showToast({
            title: res.data.msg || '不可重复点赞',
            icon: 'none',
            duration: 1000,
            mask:true
          })
        }
      }
    })
  
  },
  chooseAdr() { //选择地址
    wx.navigateTo({
      url: "../myAdress/myAdress?from=eventDetail"
    })
  },
  // 判断用户是否登陆
  userIsLogin(){
    //TODO 注：由于领取积分需要登录，所以该处需要处理登录信息(貌似我点进来就自己自动登录了。) cao
    if (app.globalData.userInfo == null || app.globalData.userInfo.data.data.user_id == undefined && !wx.getStorageSync('LoginSessionKey')) {
      // 查看是否授权
      wx.getSetting({
        success: function(res1) {
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
    }
  },
  loginUser() {
    var that = this;
    wx.login({
      success: function(res) {
        if (res.code) {
          var code = res.code;
          wx.getUserInfo({ //getUserInfo流程
            success: function(res2) { //获取userinfo成功
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
                  //that.loginIntegral()
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
  getAddressList(noShow) {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/addres_list',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        if(res.data.data.length){
          let getDefaltList=res.data.data.filter(item =>item.is_default==1)
          if(that.data.addressMsg.length<=0){
            that.setData({
              adressList: getDefaltList.length ? getDefaltList : res.data.data,
              isAdressmodalHidden:noShow || false
            })
          }else{
            let resetAdress=[]
            resetAdress.push(that.data.addressMsg)
            that.setData({
              adressList:resetAdress,
              isAdressmodalHidden:false
            })
          }
        }else{
          if(that.data.toAddAdress){
            wx.navigateTo({
              url: '../myAdress/myAdress'
            })
          }
        }
        
      },
    })
  },
  modalAdresscanceldis(){
    this.setData({
      isAdressmodalHidden:true
    })
  },

  //判断是否领取活动
  getUserIsEvent(){
    let that = this;
    //分享不用判断
    console.log(app.globalData.userInfo.data.data.user_id)
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/eventslike/is_events_receive',
      method:'POST',
      data: {
        events_id:that.data.specialid,
        user_id:app.globalData.userInfo.data.data.user_id
        //user_id:19
      },
      success(res) {
        that.setData({
          isSelfShare:that.data.shareUseId == app.globalData.userInfo.data.data.user_id
        })
        console.log(app.globalData.userInfo.data.data.user_id)
        if(res.data.result==1){
          if(res.data.data.is_receive ){
            that.setData({
              isLikeEvent:true
            })
            that.getIslikeEvents()
            that.setData({
              receiveId: res.data.data.receive_id,
            })
          }else{
            that.geteventslike()
            that.eventsReceive()
          }   
        }else{
          that.geteventslike()
          that.eventsReceive()
        } 
      },
    })
  },
  // 设置按钮是否可领取
  setGetPoint(res){
    const pointList = res.events_like_reward || []
    pointList.forEach(item => {
      //item.like_number && res.like_member_list && (res.like_member_list.length >= item.like_number? item.ableClick= true : item.ableClick= false) || (item.ableClick=false)
      (res.like_member_list.length >= item.like_number? item.ableClick= true : item.ableClick= false) || (item.ableClick=false)
    });
    console.log(pointList)
  },

  //获取活动奖励
  getEventsReward(event){
    console.log("eventgetid" + event.currentTarget.dataset.eventgetid)
    let that = this;
    this.setData({
      cechaEvent:event
    })
    if(event.currentTarget.dataset.rewardtype==2){
      //获取地址
      that.setData({
        toAddAdress:true
      })
      that.getAddressList()
    }else{
      that.getEventsRewardAjax(event)
    }
  },
  modalAdressconfirmdis(){
    this.setData({
      submitAddress:this.data.adressList[0].name + ' ' + this.data.adressList[0].phone + ' ' + this.data.adressList[0].addres
    })
    console.log(this.data.submitAddress)
    this.getEventsRewardAjax(this.data.cechaEvent)
  },
  getEventsRewardAjax(event){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/eventslike/events_receive_reward',
      method:'POST',
      data: {
        user_id:app.globalData.userInfo.data.data.user_id,
        id:event.currentTarget.dataset.eventgetid || '',
        events_id:that.data.specialid,
        //addres:that.data.submitAddress || ''
        addres: that.data.adressList[0].phone || '',
        name:that.data.adressList[0].name || '',
        phone:that.data.adressList[0].phone || '',
      },
      success(res) {
        console.log(res)
        if(res.data.result==1){
          wx.showToast({
            title: '成功',
            icon: 'succes',
            duration: 1000,
            mask:true
          })
          that.getIslikeEvents()
        }else{
          wx.showToast({
            title: res.data.msg || '领取失败',
            icon: 'none',
            duration: 1000,
            mask:true
          })
        }
        that.setData({
          isAdressmodalHidden:true
        })
      },
    })
  },
  // 已经点赞的详情
  getIslikeEvents(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/eventslike/details',
      method: 'get',
      data: {
        events_id:that.data.specialid,
        user_id:that.data.shareUseId||app.globalData.userInfo.data.data.user_id
        //user_id:19
      },
      success(res) {
        if(res.data.result==1){
          that.setGetPoint(res.data.data)
          console.log(res.data.data.events_info.events_type)
          
          that.setData({
            special_topic_detail: res.data.data,
            islike: res.data.data.is_like,
            joinChoujian:res.data.data.is_like==0?"joinChoujian":"unjoinChoujian",
            backgroundCol:res.data.data.events_info.colour_no,
            like_member_list:res.data.data.like_member_list || [],
            isNewEvent:res.data.data.events_info.events_type==2
          })
          wx.setNavigationBarTitle({
            title: res.data.data.events_info.events_title 
          })
          console.log(that.data.special_topic_detail)
        }
      }
    })
  },

 //专题详情
 geteventslike(id){
  let that = this;
  console.log(app.globalData.userInfo.data.data.user_id)
  wx.request({
    url: 'https://wechatapi.vipcsg.com/index/eventslike/events_details',
    method: 'get',
    data: {
      events_id:that.data.specialid,
      //user_id:app.globalData.userInfo.data.data.user_id
      //user_id:19
    },
    success(res) {
      if(res.data.result==1){
        that.setData({
          isSelfShare:that.data.shareUseId == app.globalData.userInfo.data.data.user_id
        })
        console.log(app.globalData.userInfo.data.data.user_id)
        that.setGetPoint(res.data.data)
        that.setData({
          special_topic_detail: res.data.data,
          islike: res.data.data.is_like,
          joinChoujian:res.data.data.is_like==0?"joinChoujian":"unjoinChoujian",
          backgroundCol:res.data.data.events_info.colour_no,
          like_member_list:res.data.data.like_member_list || []
        }) 
        wx.setNavigationBarTitle({
          title: res.data.data.events_info.events_title 
        })
        console.log(that.data.special_topic_detail)
      }
    },
  })
},
  //专题详情
  getSpecialTopicDetail(id){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/project/details',
      data: {
        project_id:id,
        user_id:19
      },
      success(res) {
        that.setData({
          special_topic_detail: res.data.data,
          islike: res.data.data.is_like,
          joinChoujian:res.data.data.is_like==0?"joinChoujian":"unjoinChoujian"
        })
        wx.setNavigationBarTitle({
          title: res.data.data.project_info.project_title 
        })
        console.log(that.data.special_topic_detail)
      },
    })
  },
  eventsReceive(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/eventslike/events_receive',
      method:'POST',
      data: {
        events_id:that.data.specialid,
        user_id:app.globalData.userInfo.data.data.user_id
        //user_id:19
      },
      success(res) {
        if(res.data.result==1){
          that.setData({
            receiveId: res.data.data.receive_id,
          })
          
         // that.onShareAppMessage()
        }
      }
    })
  },
  setDefault(){
    // console.log(111)
  },
  //分享
  onShareAppMessage: function (event) {
    var shareUrl = '/pages/eventDetail/eventDetail?id=' + this.data.specialid+'&shareDate=true'+'&shareUseId='+app.globalData.userInfo.data.data.user_id+'&receiveId='+ this.data.receiveId
    var that = this;
    console.log(that.data.special_topic_detail.events_info.share_img)
    //设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: that.data.special_topic_detail.events_info.events_title, //转发标题
      path: shareUrl,
      imageUrl: 'https:'+that.data.special_topic_detail.events_info.share_img || 'https:'+that.data.special_topic_detail.events_info.events_img, //图片路径
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
  gotoIndex(){
    wx.switchTab({
      url: '../index/index',
    })
  }
})