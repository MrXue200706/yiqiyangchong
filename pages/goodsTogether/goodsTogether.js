//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    goods_detail: null, //商品详情
    ct: 'n', //y:参与团购  n:开团
    param_id: null, //分享类型的ID 如goods_id
    share_id: null, //发起分享者的用户ID，分享后，别人点进来的入口参数
    share_type: null, //分享的类型 goods、pet、project，分享后，别人点进来的入口参数
    share_date: null, //分享日期，分享后，别人点进来的入口参数
    showShare: true, //预置分享样式
    order_no: null, //开团团长团购订单NO
    fullTogether: false, //团购商品是否满员
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

    //获取商品详情
    this.getGoodsDetail(options.param_id);

    //检查是否满团
    this.groupCheck();
  },
  getGoodsDetail(id) {//获取商品详情，填充页面
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
  buyTogether() {//参团，直接购买
    //检查是否满团
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/order/group_check',
      method: 'GET',
      data: {
        order_no: that.data.order_no
      }, 
      success(res) {
        if (res.data.result==1){
          //可拼团，跳转商品规格选择页面
          console.log("可拼团~~~")
          wx.navigateTo({
            url: "../goodsDetail/goodsDetail?shopping=together&goods_id=" + that.data.goods_detail.id + "&ct=y&order_no=" + that.data.order_no
          })
        }else{
          //弹窗提示
          wx.showToast({
            title: '该团购已满员',
            icon: 'none',
            duration: 2000,
            mask: true,
            success: function () { }
          })
        }
      },
    })

  },
  onShareAppMessage: function (options) {
    //生成分享日期
    var date = new Date();
    var dataStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    var that = this;
    //设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: this.data.goods_detail.goods_name,        //转发标题
      path: '/pages/goodsTogether/goodsTogether?order_no='+this.data.order_no+'&ct=y&param_id=' + this.data.goods_detail.id + '&share_id=' + app.globalData.userInfo.data.data.user_id + '&share_type=goods&share_date=' + dataStr,        // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: this.data.goods_detail.goods_img_list[0].goods_img,     //图片路径
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
          //记录积分
          wx.request({
            url: 'https://wechatapi.vipcsg.com/index/share/callback',
            method: 'POST',
            data: {
              share_id: app.globalData.userInfo.data.data.user_id,
              share_type: 'goods',
              param_id: this.data.goods_detail.id
            }, success(res) {
              if (res.data.result) {
                wx.showToast({
                  title: '积分+' + res.data.data.share_integral,
                  icon: 'succes',
                  duration: 2000,
                  mask: true,
                  success: function () { }
                });
              }
            },
          })
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
    console.log(shareObj)
    return shareObj;
  },
  groupCheck() {//检查是否满团
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/order/group_check',
      method: 'GET',
      data: {
        order_no: that.data.order_no
      }, 
      success(res) {
        if (res.data.result == 1) {
          if (that.data.ct == 'y') {
            debugger;
            //参团操作
            that.setData({
              showShare: false,
              fullTogether: false
            })
          } else {
            //开团操作
            that.setData({
              showShare: true,
              fullTogether: false
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
            success: function () { }
          })
        }
      },
    })
  }
})