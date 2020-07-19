//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    isDlaigShow:false,
    isFirstDlaigShow:false,
    team_id:'',
    detail:'',
    rewardData:'',
    ismodalHidden:true,
    isshowdis:false,
    litterPrence:0,
    shareDate:false,
    memberId:'',
    shareId:'',
    isSelfShare:false,
    itempercent:0,
    teamUserId:'',
    isAdressmodalHidden:true,
    adressList:[],
    toAddAdress:false,
    submitAddress:'',
    cechaEvent:'',
    addressMsg:[]
  },
  onLoad(options) {
    //由于onLoad只加载一次数据，所以改用onShow每次都刷新数据
    this.setData({
      team_id: options.team_id || '',
      shareDate:options.shareDate || '',
      //memberId:options.memberId || '',
      shareId:options.shareId || '',
      shareUseId:options.shareUseId || ''
      //userInfoID:app.globalData.userInfo.data.data.user_id
    });
    // if(options.addressMsg && options.addressMsg.length){
    //   this.setData({
    //     adressList:options.addressMsg
    //   });
    // }
    console.log(options)
  },
  onShow() {
    this.getShareId()
    this.getUserInfoDetail(); //获取用户数据，刷新数据
    this.getHotTroopDetail()
    this.getAddressList(true)
    this.userIsLogin()
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
  // 退出战队
  kitkOutSelf(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/team/kick_out',
      method: 'POST',
      data: {
        captain_id:that.data.teamUserId,
        member_id: app.globalData.userInfo.data.data.user_id,
        team_id: that.data.team_id
      },
      success(res) {
        if (res.data.result == 1) {
          wx.showToast({
            title: '成功',
            icon: 'succes',
            duration: 2000,
            mask: true
          })
          wx.switchTab({
            url: '../mine/mine',
          })
        }else{
          wx.showToast({
            title: res.data.msg || '操作失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
    })
  },
  previewImage: function (e){
    console.log(122);
    var current = e.target.dataset.src;   //这里获取到的是一张本地的图片
    console.log(current)
    console.log(e.target.dataset)
    wx.previewImage({
      current: current,//需要预览的图片链接列表
      urls: [current]  //当前显示图片的链接
    })
  },
  showModaldis:function(e){
    this.setData({
     ismodalHidden:!this.data.ismodalHidden,
    })
   },
   modalBindaconfirmdis:function(){
     this.save()
     console.log(this.data.ismodalHidden)
     this.setData({
      ismodalHidden:!this.data.ismodalHidden,
      isshowdis:!this.data.isshowdis,
      tip:'您点击了【确认】按钮！',
      buttonDisabled:!this.data.buttonDisabled
    })
    //this.dissolution()
    //this.dissolution(this.data.member_id)
   },
   //点击保存图片
 save () {
  let that = this
  //若二维码未加载完毕，加个动画提高用户体验
  wx.showToast({
   icon: 'loading',
   title: '正在保存图片',
   duration: 1000
  })
  //判断用户是否授权"保存到相册"
  wx.getSetting({
   success (res) {
    //没有权限，发起授权
    if (!res.authSetting['scope.writePhotosAlbum']) {
     wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success () {//用户允许授权，保存图片到相册
       that.savePhoto();
      },
      fail () {//用户点击拒绝授权，跳转到设置页，引导用户授权
       wx.openSetting({
        success () {
         wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {
           that.savePhoto();
          }
         })
        }
       })
      }
     })
    } else {//用户已授权，保存到相册
     that.savePhoto()
    }
   }
  })
 },
//保存图片到相册，提示保存成功
 savePhoto() {
  let that = this
  console.log(that.data.detail.weixin_img)
  wx.downloadFile({
   url: 'https:'+that.data.detail.weixin_img,
   success: function (res) {
     console.log(res)
    wx.saveImageToPhotosAlbum({
     filePath: res.tempFilePath,
     success(res) {
       console.log(res)
      wx.showToast({
       title: '保存成功',
       icon: "success",
       duration: 1000
      })
     },
     fail(res) {
      wx.showToast({
        title: '保存失败',
        icon: 'none',
        duration: 2000
      });
    }
    })
   }
  })
 },
   modalBindcanceldis:function(){
     this.setData({
     ismodalHidden:!this.data.ismodalHidden,
     tip:'您点击了【取消】按钮！'
    })
   },
  getHotTroopDetail: function(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/team/details',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        team_id: that.data.team_id
      },
      success(res) {
        if (res.data.result == 1) {
          console.log(res.data.data.ranking)
          res.data.data.rankingImg='../../images/ranking'+res.data.data.ranking+'.png'
          if(res.data.data.is_captain==1||res.data.data.is_member==1){
            that.getTeamReward()
          }
          that.setData({
            detail: res.data.data,
            teamUserId:res.data.data.user_id
          })
          wx.setNavigationBarTitle({
            title: res.data.data.team_name+'战队'
          })
        }
      },
    })
  },
  getTeamReward:function(team_id){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/team/team_reward',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        team_id:that.data.team_id
      },
      success(res) {
        if (res.data.result == 1) {
          console.log(res.data.data)
          that.setLoadPrence(res.data.data)
          that.setData({
            userInfo: res.data.data,
            rewardData:res.data.data,
          })
        }
      },
    })
  },
  setLoadPrence(rewardData){
    const prenceList= rewardData.reward || []
    const hasPrence = rewardData.team_power || 0
    let flag=0
    let upPrence =0
    let itemLen=prenceList.length
    for(var i=0;i<itemLen;i++){
      // console.log(i)
      // console.log(prenceList[i].power)
      // console.log(hasPrence)

      if(prenceList[i].power>hasPrence){
        prenceList[i].cannouse=true
      }else{
        prenceList[i].cannouse=false
      }
      if(prenceList[i].is_receive!=0){
        prenceList[i].power='已领取'
        prenceList[i].cannouse=true
      }else{
        prenceList[i].power+='战力'
      }
      if(prenceList[i].power && prenceList[i].power<= hasPrence){
        if(i+1<itemLen){
          if(prenceList[i+1].power<=hasPrence){
            prenceList[i].percent=100
          }else{
            prenceList[i].percent=50
            this.setData({
              litterPrence:prenceList[i+1].power-hasPrence
            })
          }
        }
      }
    }
    console.log(prenceList)
    // if(prenceList[itemLen-1].power<=hasPrence){
    //   prenceList[itemLen-1].percent=50
    // }else{
    //   prenceList[itemLen-1].percent=0
    // }
    

    // prenceList.forEach((element,index) => {
    //   if(element.power && element.power<= hasPrence){
    //     if(index)(

    //     )
    //     element.percent = 50; 
    //   }else {
    //     flag++
    //     if(flag==1){
    //       element.percent=(hasPrence-upPrence)/(element.power-upPrence)*100
    //       this.setData({
    //         litterPrence:element.power-hasPrence
    //       })
    //     }
    //   }
    //   upPrence=element.power || 0
    // });
    //console.log(prenceList)

  },
  // 获取奖励
  getReward(event){
    console.log(event)
    let that = this;
    this.setData({
      cechaEvent:event
    })
    if(event.currentTarget.dataset.isreceive==1){
      wx.showToast({
        title: '该奖励已领取',
        icon: 'succes',
        duration: 2000,
        mask: true
      })
      return
    }
    if(event.currentTarget.dataset.rewardtype==2){
      //获取地址
      that.setData({
        toAddAdress:true
      })
      that.getAddressList()
    }else{
      this.getRewardAjax(event)
    } 
  },
  modalAdressconfirmdis(){
    this.setData({
      submitAddress:this.data.adressList[0].name + ' ' + this.data.adressList[0].phone + ' ' + this.data.adressList[0].addres
    })
    this.getRewardAjax(this.data.cechaEvent)
  },
  chooseAdr() { //选择地址
    wx.navigateTo({
      url: "../myAdress/myAdress?from=hotTroopDetail"
    })
  },
  // 获取奖励
  getRewardAjax(event){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/team/receive_reward',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        reward_id:event.currentTarget.dataset.rewardid,
        team_id: that.data.team_id,
        member_id:app.globalData.userInfo.data.data.user_id,
        addres: that.data.adressList[0].phone || '',
        name:that.data.adressList[0].name || '',
        phone:that.data.adressList[0].phone || '',
      },
      success(res) {
        if (res.data.result == 1) {
          wx.showToast({
            title: '成功',
            icon: 'succes',
            duration: 2000,
            mask: true
          })
          
        }else{
          wx.showToast({
            title: res.data.msg || '领取失败',
            icon: 'none',
            duration: 2000,
            mask: true
          })
        }
        that.setData({
          isAdressmodalHidden:true
        })
        that.getHotTroopDetail()
      },
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
          console.log(that.data.addressMsg)
          console.log(that.data.adressList)
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
  getUserInfoDetail: function() {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/my_info',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        that.setData({
          isSelfShare:that.data.shareUseId == app.globalData.userInfo.data.data.user_id
        })
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
    wx.navigateTo({
      url: '../specialTopic/specialTopic'
     // success: function(res) {},
      // fail: function(res) {},
      // complete: function(res) {},
    })
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
  //获取shareid
  getShareId(){
    if(this.data.shareId){
      return
    }
    let that=this
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/team/share',
      method: 'POST',
      data: {
        //member_id:app.globalData.userInfo.data.data.user_id,
        team_id: this.data.team_id,
        user_id: app.globalData.userInfo.data.data.user_id,
      },
      success(res) {
        if (res.data.result == 1) {
          that.data.shareId=res.data.data.share_id
        }
      },
    })
  },
  // 加入战队
  joinTeam(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/team/join_team',
      method: 'POST',
      data: {
        member_id:app.globalData.userInfo.data.data.user_id,
        team_id: that.data.team_id,
        share_id: that.data.shareId,
        //app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        if (res.data.result == 1) {
          wx.showToast({
            title: '成功',
            icon: 'succes',
            duration: 2000,
            mask: true
          })
          that.getUserInfoDetail(); //获取用户数据，刷新数据
          that.getHotTroopDetail()
        }else{
          wx.showToast({
            title: res.data.msg || '加入战队失败',
            icon: 'none',
            duration: 2000,
            mask: true
          })
        }
      },
    })
  },
  	 //分享
     onShareAppMessage: function (event) {

      var shareUrl = '/pages/hotTroopDetail/hotTroopDetail?team_id=' + this.data.team_id+'&shareDate=true'+'&memberId='+this.data.memberId+'&shareId='+this.data.shareId+'&shareUseId='+app.globalData.userInfo.data.data.user_id
      var that = this;
      console.log(shareUrl)
      //设置菜单中的转发按钮触发转发事件时的转发内容
      var shareObj = {
        title: '加入' + that.data.detail.team_name +'战队', //转发标题
        path: shareUrl,
        imageUrl:'../../images/hotshare.jpg',
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
  

  loginIntegral() { //每日登陆积分
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/integral/sign_day',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
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
          setTimeout(()=>{
            that.setData({
              isDlaigShow: true
            })
          },1000)
         
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