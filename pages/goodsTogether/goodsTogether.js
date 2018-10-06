//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    goods_detail: null, //商品详情
    group_info: null, //团单详情
    ct: 'n', //y:参与团购  n:开团
    param_id: null, //分享类型的ID 如goods_id
    share_id: null, //发起分享者的用户ID，分享后，别人点进来的入口参数
    share_type: null, //分享的类型 goods、pet、project，分享后，别人点进来的入口参数
    share_date: null, //分享日期，分享后，别人点进来的入口参数
    showShare: true, //预置分享样式
    order_no: null, //开团团长团购订单NO
    fullTogether: false, //团购商品是否满员
    endTime: null, //拼团结束倒计时
    countdown: null, //倒计时显示
    timerNo: null, //定时器NO
    groupMsg: null, //团单错误信息
  },
  onLoad(options) {
    this.setData({
      ct: options.ct,
      param_id: options.param_id,
      share_id: options.share_id == undefined ? null : options.share_id,
      share_type: options.share_type == undefined ? null : options.share_type,
      share_date: options.share_date == undefined ? null : options.share_date,
      order_no: options.order_no == undefined ? null : options.order_no,
    });
  },
  onShow(){
    //获取商品详情
    this.getGoodsDetail(this.data.param_id);

    //检查是否满团
    this.groupCheck();

    //获取团单详情
    this.getGroupDetail();
  },
  onHide() {
    //关闭定时器
    clearInterval(this.data.timerNo);
  },
  onUnload(){
    //关闭定时器
    clearInterval(this.data.timerNo);
  },
  getGroupDetail(){//获取团单详情
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/group/group_info',
      method: 'GET',
      data: {
        order_no: this.data.order_no
      }, success(res) {
        if (res.data.result == 1) {
          that.setData({
            group_info: res.data.data,
            endTime: res.data.data.time,
          })
          //启动定时器
          that.data.timerNo = setInterval(function () {
            var temp = that.data.endTime -1
            var countdown = that.dateformatOut(Number(temp)*1000)
            // console.log("倒计时时间：" + countdown)
            that.setData({
              endTime: temp,
              countdown: countdown
            })
          }, 1000);
        }else{
          that.setData({
            groupMsg: res.data.msg
          })
        }
      },
    })
  },
  getGoodsDetail(id) { //获取商品详情，填充页面
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/details',
      data: {
        goods_id: id
      },
      success(res) {
        that.setData({
          goods_detail: res.data.data
        });
      },
    })
  },
  buyTogether() { //参团，直接购买
    //检查是否满团
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/order/group_check',
      method: 'GET',
      data: {
        order_no: that.data.order_no,
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        if (res.data.result == 1) {
          //可拼团，跳转商品规格选择页面
          console.log("可拼团~~~")
          wx.navigateTo({
            url: "../goodsDetail/goodsDetail?type=together&id=" + that.data.goods_detail.id + "&ct=y&order_no=" + that.data.order_no
          })
        } else {
          //弹窗提示
          wx.showToast({
            title: '该团购已满员',
            icon: 'none',
            duration: 2000,
            mask: true,
            success: function() {}
          })
        }
      },
    })

  },
  onShareAppMessage: function(options) {
    //生成分享日期
    var date = new Date();
    var dataStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    var that = this;
    //设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: this.data.goods_detail.goods_name, //转发标题
      path: '/pages/goodsTogether/goodsTogether?order_no=' + this.data.order_no + '&ct=y&param_id=' + this.data.goods_detail.id + '&share_id=' + app.globalData.userInfo.data.data.user_id + '&share_type=goods&share_date=' + dataStr, // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: this.data.goods_detail.goods_img_list[0].goods_img, //图片路径
      success: function(res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
          wx.showToast({
            title: '分享成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
            success: function() {}
          });
          //记录积分
          wx.request({
            url: 'https://wechatapi.vipcsg.com/index/share/callback',
            method: 'POST',
            data: {
              share_id: app.globalData.userInfo.data.data.user_id,
              share_type: 'goods',
              param_id: this.data.goods_detail.id
            },
            success(res) {
              if (res.data.result) {
                wx.showToast({
                  title: '积分+' + res.data.data.share_integral,
                  icon: 'succes',
                  duration: 2000,
                  mask: true,
                  success: function() {}
                });
              }
            },
          })
        }
      },
      fail: function() {
        //转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          //用户取消转发
          wx.showToast({
            title: '分享已取消',
            icon: 'none',
            duration: 1000,
            mask: true,
            success: function() {}
          });
        } else if (res.errMsg == 'shareAppMessage:fail') {
          //转发失败，其中 detail message 为详细失败信息
          wx.showToast({
            title: '分享失败，请稍后再试',
            icon: 'none',
            duration: 1000,
            mask: true,
            success: function() {}
          });
        }
      },
      complete: function() {
        // 转发结束之后的回调（转发成不成功都会执行）
      }
    };

    // 返回shareObj
    console.log(shareObj)
    return shareObj;
  },
  groupCheck() { //检查是否满团
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/order/group_check',
      method: 'GET',
      data: {
        order_no: that.data.order_no,
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        if (res.data.result == 1) {
          if (that.data.ct == 'y') {
            //参团操作
            that.setData({
              showShare: false,
              fullTogether: false,
            })
          } else {
            //开团操作
            that.setData({
              showShare: true,
              fullTogether: false,
            })
          }
        } else {
          that.setData({
            fullTogether: true
          })
          //弹窗提示
          wx.showToast({
            title: '该团购已满员',
            icon: 'none',
            duration: 2000,
            mask: true,
            success: function() {}
          })
        }
      },
    })
  },
  goShopping(){//跳转抢购页面
    //跳转抢购页面
    wx.switchTab({
      url: '../shoping/shoping',
    })
  },
  dateformatOut(micro_second, t = 1) { // 时间格式化输出
    // 总秒数
    var second = Math.floor(micro_second / 1000);
    // 天数
    var day = Math.floor(second / 3600 / 24);
    // 小时
    var hr = Math.floor(second / 3600 % 24);
    // 分钟
    var min = Math.floor(second / 60 % 60);
    // 秒
    var sec = Math.floor(second % 60);

    return (hr < 10 ? "0" + hr : hr) + ":" + (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec)

    // if (t == 0) {
    //   return day + "天" + hr + "小时" + min + "分钟" + sec + "秒";
    // } else {
    //   return hr + "小时" + min + "分钟" + sec + "秒";
    // }
  }
})