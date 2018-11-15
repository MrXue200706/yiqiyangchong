//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    special_topic_detail:{},//详情
    specialid:"",
    islike:0,
    joinChoujian:"joinChoujian"
  },
  onLoad(o){
    this.setData({
      specialid: o.id
    })
    this.getSpecialTopicDetail(o.id);
  },

  //专题详情
  getSpecialTopicDetail(id){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/project/details',
      data: {
        project_id:id,
        user_id:app.globalData.userInfo.data.data.user_id
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
  //点赞按钮
  jionClick(){
    let that = this;
    if(that.data.islike==1){
      return
    }
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/project/like',
      method: 'POST',
      data: {
        project_id:that.data.specialid,
        user_id:app.globalData.userInfo.data.data.user_id
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
        that.getSpecialTopicDetail(that.data.specialid)
        }else{
          wx.showToast({
            title: "操作失败，" + res.data.msg,
            icon: 'none',
            duration: 2000,
            mask: true,
            success: function() {}
          })
        }
      },
    })
  },
  //分享
  onShareAppMessage: function (event) {
    var shareUrl = '/pages/specialTopicDetail/specialTopicDetail?id=' + this.data.specialid
    var that = this;
    //设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: "专题精选", //转发标题
      path: shareUrl,
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
  gotoIndex(){
    wx.switchTab({
      url: '../index/index',
    })
  }
})