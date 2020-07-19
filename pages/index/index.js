//index.js
//获取应用实例
const app = getApp()
//app.checkLogin()

Page({
  data: {
    swiper: [], //轮播图片
    goods_index: [], //首页商品列表
    pet_expert: [], //养宠达人列表
    special_topic: [], //专题
    goods_recommend: [], //活动
    pageno: 1,
    isDlaigShow: false,
    pet_expert_item_button:"pet_expert_item_button",
    pet_expert_item_button_noclick:"pet_expert_item_button_noclick",
    isJoin:false,
    modalTogoList:[],
    isModalTogoList:false
  },
  onLoad() {
    this.uploadApp()
    app.checkLogin()
    console.log( app.checkLogin)
    //请求
    var today = wx.getStorageSync('today');
    console.log(today)
    if(today==new Date().getDate()){
      this.setData({
        isDlaigShow: false
      })
    }else{
      this.setDiagHide()
    }
    this.getSwiper();
    this.getGoodsIndex(1);
    //this.getPetExpert();
    this.getSpecialTopic();
    this.getGoodsRecommend();
    this.getModalTogo()
  },
onShow(){
 // app.checkLogin()
 //wx.getUserInfo()
 var today = wx.getStorageSync('today');
 if(today==new Date().getDate()){
   console.log(1111)
   this.changeShowDiag()
 }
},

  // 小程序版本更新
  uploadApp(){
    console.log(wx.canIUse("getUpdateManager"))
    if (wx.canIUse("getUpdateManager")) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function(res) {
         console.log(res);
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
  // 获取modal跳转
  getModalTogo(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/slider/popup',
      data: {},
      success(res) {
        if(res.data.data.length){
          that.setData({
            modalTogoList: res.data.data,
            isModalTogoList:true
          })
          that.toCloseModal()
        }
        console.log(res)
        // console.log(that.data.swiper)
      },
    })
  },
  toCloseModal(){
    let that=this
    console.log(999)
    setTimeout(function() {
      that.setData({
        isModalTogoList:false
      })
    }, 3000);

  },
  
  onReachBottom() {
    // 下拉触底，先判断是否有请求正在进行中
    // 以及检查当前请求页数是不是小于数据总页数，如符合条件，则发送请求
    // if (!this.loading && this.data.page < this.data.pages) {    
    this.getGoodsIndex(++this.data.pageno)
    //}
  },

  //请求商品列表
  getGoodsIndex(pageno) {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/index',
      data: {
        page: pageno
      },
      success(res) {
        that.setData({
          goods_index: that.data.goods_index.concat(res.data.data)
        })
        console.log(that.data.goods_index)
      },
    })
  },
  changeShowDiag() {
    this.setData({
      isDlaigShow: false,
      isModalTogoList:false
    })
  },

  setDiagHide() {
    let that = this
    var nowdata=new Date().getDate()
    console.log(nowdata)
    var valuelist = wx.getStorageSync('isShowtimes');
    if(!valuelist){
      valuelist=0
    }
    wx.setStorage({
      key: "isShowtimes",
      data: ++valuelist
    });
    if(valuelist>=5){
      wx.setStorage({
        key: "today",
        data: nowdata
      });
      wx.setStorage({
        key: "isShowtimes",
        data: 0
      });
    }
    setTimeout(function () {
      that.setData({
        isDlaigShow: false
      })
    }, 4000)
  },
  //分享设置
  onShareAppMessage: function (options) {
    let that = this
    let urlStr = '/pages/index/index?type=' + this.data.shopping + '&share_id=' + app.globalData.userInfo.data.data.user_id + '&share_type=goods'

    //设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: "一起养宠", //转发标题
      path: urlStr,
      imgUrl: this.data.swiper[0].img, //图片路径
      success: function (res) {
        // 分享成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
          wx.showToast({
            title: '分享成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
            success: function () {}
          });
          //记录积分
          wx.request({
            url: 'https://wechatapi.vipcsg.com/index/share/callback',
            method: 'POST',
            data: {
              share_id: app.globalData.userInfo.data.data.user_id,
              share_type: 'goods',
              // param_id: that.data.goods_detail.id
            },
            success(res) {
              if (res.data.result) {
                wx.showToast({
                  title: '积分+' + res.data.data.share_integral,
                  icon: 'succes',
                  duration: 2000,
                  mask: true,
                  success: function () {}
                });
              }
            },
          })
        }
      },
      fail: function () {
        //转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          wx.showToast({
            title: '分享已取消',
            icon: 'none',
            duration: 1000,
            mask: true,
            success: function () {}
          });
        } else if (res.errMsg == 'shareAppMessage:fail') {
          wx.showToast({
            title: '分享失败，请稍后再试',
            icon: 'none',
            duration: 1000,
            mask: true,
            success: function () {}
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
  //养宠达人
  getPetExpert() {
    let that = this;
    console.log(app.globalData)
    var useid="";
    if(app.globalData.userInfo==null||app.globalData.userInfo==undefined){
      useid=wx.getStorageSync('LoginSessionKey')
    }
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/friend/index',
      data: {user_id:useid||app.globalData.userInfo.data.data.user_id},
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
  getSpecialTopic() {
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
  getGoodsRecommend() {
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

  //关注
  focusOn(e) {
    let friend_id = e.currentTarget.dataset.friendid
    let isfolo=e.currentTarget.dataset.isfollow
    if(isfolo==1){
      return;
    }
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/follow',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        follow_id: friend_id
      },
      success(res) {
        if (res.data.result == 1) {
          //弹窗提示
          wx.showToast({
            title: '关注成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
            success: function () {
              //按钮变黑
              that.getPetExpert()
            }
          })
        }
      },
    })
  },
  navigatorUrl(event) { //轮播图跳转
    wx.navigateTo({
      url: event.currentTarget.dataset.url
    })
  }
})