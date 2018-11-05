//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    goods_detail: null,
    group_info: null, //团单详情
    ct: 'n', //y:参与团购  n:开团
    param_id: null, //分享类型的ID 如goods_id
    share_id: null, //发起分享者的用户ID，分享后，别人点进来的入口参数
    share_type: null, //分享的类型 goods、pet、project，分享后，别人点进来的入口参数
    share_date: null, //分享日期，分享后，别人点进来的入口参数
    showShare: true, //预置分享样式
    order_no: null, //开团团长团购订单NO
    events_id: null, //活动ID
    flashsale_id: null,
    endTime: null, //拼团结束倒计时
    countdown: "00:00", //倒计时显示
    timerNo: null, //定时器NO
    groupMsg: null, //团单错误信息,
    goods_index: [], //首页商品列表
    showprice: true,
    shares: null,
    own: false,
    spec1: null, //产品规格1
    spec2: null, //产品规格2
    selected_numb: 1, //购买数量
    groupList: [], //团购成员数组
    callback_id: null,
    shopping: 'normal',
    shoppingType: 'together',
  },
  onLoad(options) {
    app.checkLogin()
    if (options.shares == 2) {
      //非团购分享，回调记录数据
      this.recordData(options)
    } else if (options.shares == 1) {
      //非团购分享
    } else if (options.ct == undefined || options.ct == null) {
      //获取参团数据出错，停止加载
      wx.showToast({
        title: '数据出错',
        icon: 'none',
        duration: 2000,
        mask: true,
        success: function() {}
      })
      return
    }

    this.setData({
      ct: options.ct == undefined ? null : options.ct,
      param_id: options.param_id,
      share_id: options.share_id == undefined ? null : options.share_id,
      share_type: options.share_type == undefined ? null : options.share_type,
      share_date: options.share_date == undefined ? null : options.share_date,
      order_no: options.order_no == undefined ? null : options.order_no,
      shares: options.shares == undefined ? null : options.shares,
      own: options.share_id == undefined ? false : options.share_id == app.globalData.userInfo.data.data.user_id,
      events_id: options.events_id == undefined ? null : options.events_id,
      flashsale_id: options.flashsale_id == undefined ? null : options.flashsale_id,
      shopping: options.shopping == undefined ? 'normal' : options.shopping
    });
    this.getGoodsIndex();

    if (this.data.shares == null) {
      //检查是否满团
      this.groupCheck();

      //获取团单详情
      this.getGroupDetail();
    } else if (this.data.shares == 1 || this.data.shares == 2) {
      //非团购分享
      //获取商品详情
      this.getGoodsDetail()
    }

  },
  onShow() {

  },
  onHide() {
    //关闭定时器
    clearInterval(this.data.timerNo);
  },
  onUnload() {
    //关闭定时器
    clearInterval(this.data.timerNo);
  },
  // 处理成员数组
  getgroupList(data) {
    let resList = [];
    if (!data) {
      return resList;
    }
    let itemObj = {
      "avatarUrl": ""
    };
    if (data.member_avatar_list.length <= 0 && data.total_group_number >= 2) {
      for (var i = 0; i < data.total_group_number - 1; i++) {
        resList.push(itemObj)
      }
      resList = data.member_avatar_list.concat(resList)
    } else {
      for (var i = data.member_avatar_list.length; i < data.total_group_number - 1; i++) {
        resList.push(itemObj)
      }
      resList = data.member_avatar_list.concat(resList)
    }
    console.log(resList);
    return resList;
  },
  getGoodsDetail() { //获取商品详情
    let queryUrl = "https://wechatapi.vipcsg.com/index/goods/details"
    if (this.data.shopping == "shopping") {
      queryUrl = "https://wechatapi.vipcsg.com/index/flashsale/details"
    } else if (this.data.shopping == "activity") {
      queryUrl = "https://wechatapi.vipcsg.com/index/events/details"
    }
    let that = this;
    wx.request({
      url: queryUrl,
      data: {
        goods_id: this.data.param_id,
        flashsale_id: this.data.flashsale_id,
        events_id: this.data.events_id
      },
      success(res) {
        that.setData({
          goods_detail: res.data.data,
        })
      },
    })
  },
  getGroupDetail() { //获取团单详情
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/group/group_info',
      method: 'GET',
      data: {
        order_no: this.data.order_no
      },
      success(res) {
        if (res.data.result == 1) {
          console.log(res.data.data)
          that.setData({
            group_info: res.data.data,
            endTime: res.data.data.time,
            groupList: that.getgroupList(res.data.data),
          })
          //启动定时器
          that.data.timerNo = setInterval(function() {
            var temp = that.data.endTime - 1
            var countdown = that.dateformatOut(Number(temp) * 1000)
            // console.log("倒计时时间：" + countdown)
            that.setData({
              endTime: temp,
              countdown: countdown
            })
          }, 1000);
        } else {
          that.setData({
            group_info: res.data.data,
            groupList: that.getgroupList(res.data.data),
          })
        }
        debugger;
      },
    })
  },
  //请求商品列表
  getGoodsIndex() {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/index',
      data: {},
      success(res) {
        that.setData({
          goods_index: res.data.data
        })
        console.log(that.data.goods_index)
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
            url: "../goodsDetail/goodsDetail?type=together&id=" + that.data.goods_detail.id + "&ct=y&order_no=" + that.data.order_no + "&showprice=" + that.data.showprice + "&events_id=" + that.data.events_id
          })
        } else {
          if (res.data.msg == "拼团已超过24小时" || res.data.msg == "拼团不存在或拼团已完成") {
            that.setData({
              groupMsg: '该团购已结束'
            })
            //弹窗提示
            wx.showToast({
              title: '该团购已结束',
              icon: 'none',
              duration: 2000,
              mask: true,
              success: function() {}
            })
          } else {
            that.setData({
              groupMsg: '该团购已满员'
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
        }
      },
    })
  },
  onShareAppMessage: function(event) {
    //生成分享日期
    var date = new Date();
    var dataStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    var shareUrl = '/pages/goodsTogether/goodsTogether?order_no=' + this.data.order_no + '&ct=y&param_id=' + this.data.param_id + '&share_id=' + app.globalData.userInfo.data.data.user_id + '&share_type=goods&share_date=' + dataStr + '&events_id=' + this.data.events_id + "&shopping=" + this.data.shopping + "&shoppingType=" + this.data.shoppingType

    //如果是商品推荐
    if (event.target.dataset.goodsshare) {
      shareUrl = '/pages/goodsTogether/goodsTogether?param_id=' + this.data.goods_detail.id + '&shares=2&share_id=' + app.globalData.userInfo.data.data.user_id + '&share_type=goods&share_date=' + dataStr + '&events_id=' + this.data.events_id + "&shopping=" + this.data.shopping
    }

    var that = this;
    //设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: this.data.group_info == null ? this.data.goods_detail.goods_name: this.data.group_info.goods_info.goods_name, //转发标题
      path: shareUrl,
      imgUrl: this.data.group_info == null ? this.data.goods_detail.goods_img_list[0].goods_img : this.data.group_info.goods_info.goods_img, //图片路径
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
              param_id: that.data.goods_detail.id
            },
            success(res) {
              console.log("获取积分数：" + res.data.data.share_integral)
              if (res.data.result == 1) {
                wx.showToast({
                  title: "积分" + (res.data.data.share_integral > 0 ? "+" + res.data.data.share_integral : ""),
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
          //未满团，判断是否为发起者本人
          if (that.data.ct == 'y' && that.data.share_id != app.globalData.userInfo.data.data.user_id) {
            //参团操作
            that.setData({
              showShare: false,
            })
          } else {
            //开团操作
            that.setData({
              ct: 'n',
              showShare: true,
            })
          }
        } else {
          if (res.data.msg == "拼团已超过24小时" || res.data.msg == "拼团不存在或拼团已完成") {
            that.setData({
              groupMsg: '该团购已结束'
            })
            //弹窗提示
            wx.showToast({
              title: '该团购已结束',
              icon: 'none',
              duration: 2000,
              mask: true,
              success: function() {}
            })
          } else {
            that.setData({
              groupMsg: '该团购已满员'
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
          console.log("groupMsg: " + that.data.groupMsg)
        }
      },
    })
  },
  buyGoods(e) { //购买商品
    //弹窗提示
    //弹框选择规格
    // console.log(e.currentTarget.dataset.id) 
    wx.navigateTo({
      url: "../goodsDetail/goodsDetail?type=normal&id=" + e.currentTarget.dataset.id + "&ct=y&showprice=false&callback_id=" + this.data.callback_id
    })
  },
  goShopping() { //跳转抢购页面
    wx.switchTab({
      url: '../shoping/shoping',
    })
  },
  recordData(options) {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/share/receive_integral',
      method: 'POST',
      data: {
        receive_id: app.globalData.userInfo.data.data.user_id,
        share_id: options.share_id,
        share_type: options.share_type,
        param_id: options.param_id,
        share_date: options.share_date,
      },
      success(res) {
        debugger
        if (res.data.result == 1) {
          that.setData({
            callback_id: res.data.data.callback_id
          })
          wx.showToast({
            title: "积分" + (res.data.data.share_integral > 0 ? "+" + res.data.data.share_integral : ""),
            icon: 'succes',
            duration: 2000,
            mask: true,
            success: function() {}
          });
        }
      },
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
  },
})