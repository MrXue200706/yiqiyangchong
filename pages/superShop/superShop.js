//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    superShop:{},//
    events_id: null, //活动ID
    shareTitle:""
  },
  onLoad(o){
    this.setData({
      events_id: o.id
    })
    this.getSwiper(o.id);
  },

  //请求
  getSwiper(id) {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/events/goods',
      data: {
        events_id:id
      },
      success(res) {
        console.log(res)
        that.setData({
          superShop: res.data.data,
          shareTitle:res.data.data.events_info.events_title 
        });
        console.log(that.data.shareTitle)
        wx.setNavigationBarTitle({
          title: res.data.data.events_info.events_title 
        })
      },
    })
  },
  onShareAppMessage: function (options) {
    let that = this
    let urlStr = '/pages/superShop/superShop?id=' + this.data.events_id + '&share_id=' + app.globalData.userInfo.data.data.user_id + '&share_type=goods'

    //设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: "有福利！"+that.data.shareTitle+"发现好东西", //转发标题
      path: urlStr,
     // imgUrl:that.superShop.events_info.events_content_img, //图片路径
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
})