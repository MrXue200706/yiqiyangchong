//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    tab_list: ["全部", "待付款", "待成团", "待收货", "已完成"],
    orderPtypeDic: {
      "all": "全部",
      "unpay": "待付款",
      "untogether": "待成团",
      "unpick": "待收货",
      "done": "已完成"
    },
    orderStatusDict: {//订单状态码
      "all": "", 
      "unpay": "1", 
      "untogether": "3", 
      "unpick": "2", 
      "done": "9", 
    },
    orderShowBtn:{
      "待付款":"立即支付",
      "待成团": "邀请参团",
      "待收货": "查看订单",
      "已取消": "查看订单",
      "已完成": "查看订单",
    },
    tab_selected_id: 0,
    ptype: "all", //页面类型，默认全部订单，unpay：待付款，untogether：待成团，unpick：待收货，done：已完成
    pageList: [], //页面内容列表
    pageNo: 1,
  },
  onLoad(options) {
    this.setData({
      ptype: options.ptype == undefined ? "all" : options.ptype,
    })
    //设置页码高亮
    let list=this.data.tab_list
    for(let i= 0; i<list.length;i++){
      if (list[i] == this.data.orderPtypeDic[this.data.ptype]){
        this.setData({
          tab_selected_id: i
        })
      }
    }
    //设置页面数据
    this.setPageDetail();
  },
  tab_select_fn(event) {
    let id = event.currentTarget.id;
    let ptypeDic = this.data.orderPtypeDic
    for (let key in ptypeDic){
      if (ptypeDic[key] == this.data.tab_list[id]){
        this.setData({
          ptype: key
        })
      }
    }
    this.setData({
      tab_selected_id: id,//设置高亮
      pageNo: 1, //重置pageNo
      pageList: [], 
    });
    //设置页面数据
    this.setPageDetail();
  },
  setPageDetail() { //设置页面内容
    let that = this;
    // console.log("状态码: " + that.data.orderStatusDict[that.data.ptype])
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/order/order_list',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        order_status: that.data.orderStatusDict[that.data.ptype], //状态码
        page: that.data.pageNo, //分页
      },
      success(res) {
        if (res.data.result == 1) {
          let pageLists = that.data.pageList
          that.setData({
            pageNo: that.data.pageNo+1,
            pageList: pageLists.concat(res.data.data) 
          })
          console.log(that.data.pageList)
        }
      },
    })
  },
  payBtn(event){
    let that = this;
    //根据按钮类型，进行相应的处理
    let btnType = event.currentTarget.dataset.item.status_name
    if (btnType == "待付款"){
      //跳转到支付页面
      wx.navigateTo({
        url: '../unpay/unpay?ptype=unpay&order_id=' + event.currentTarget.dataset.item.id
      })
    } else if (btnType == "待成团" || btnType == "拼团待支付" || btnType == "拼团已支付"){
      //确认是否团长
      if (event.currentTarget.dataset.item.member_id == null || event.currentTarget.dataset.item.member_id == undefined || event.currentTarget.dataset.item.member_id == ""){
        //跳转到邀请页面
        wx.navigateTo({
          url: '../goodsTogether/goodsTogether?events_id=' + event.currentTarget.dataset.item.events_id +'&shopping=' + event.currentTarget.dataset.item.shopping +'&ct=n&param_id=' + event.currentTarget.dataset.item.goods_id +'&order_no=' + event.currentTarget.dataset.item.order_no
        })
      } else{
        //团员拼团
        wx.navigateTo({
          url: '../goodsTogether/goodsTogether?ct=n&param_id=' + event.currentTarget.dataset.item.goods_id +'&order_no=' + event.currentTarget.dataset.item.member_id
        })
      }
    } else if (btnType == "待收货"){
      wx.navigateTo({
        url: '../unpay/unpay?ptype=takegoods&order_id=' + event.currentTarget.dataset.item.id
      })
    } else if (btnType == "已完成") {
      //跳转到支付页面
      wx.navigateTo({
        url: '../unpay/unpay?ptype=done&order_id=' + event.currentTarget.dataset.item.id
      })
    }else{
      //跳转到订单详情
      wx.navigateTo({
        url: '../unpay/unpay?ptype=detail&order_id=' + event.currentTarget.dataset.item.id
      })
    }


  },
  delOrder(event){//取消订单
    let oid = event.currentTarget.dataset.oid
    let ostatus = event.currentTarget.dataset.ostatus
    let that = this;
    if (ostatus == 1) {
      //提示
      wx.showModal({
        title: '提示',
        content: '是否取消该订单',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.request({
              url: 'https://wechatapi.vipcsg.com/index/order/cancel_order',
              method: 'POST',
              data: {
                user_id: app.globalData.userInfo.data.data.user_id,
                order_id: oid
              }, success(res) {
                if (res.data.result == 1) {
                  wx.showToast({
                    title: '取消成功',
                    icon: 'succes',
                    duration: 2000,
                    mask: true,
                    success: function () {
                      that.setData({
                        pageNo: 1, //重置pageNo
                        pageList: [],
                      })
                      //刷新列表
                      that.setPageDetail();
                    }
                  })
                }
              },
            })
          } else {
            console.log('用户点击取消')
          }

        }
      })
    } else {
      wx.showToast({
        title: '该订单无法取消',
        icon: 'none',
        duration: 1000,
        mask: true,
        success: function () {
          that.setData({
            pageNo: 1, //重置pageNo
            pageList: [], 
          })
          //刷新数据
          that.setPageDetail();
        }
      })
    }
  },
  showOrderDetail(event){//查看订单详情
    var ptype = "detail"
    if (event.currentTarget.dataset.status_name=="待付款"){
      ptype = "unpay"
    } else if (event.currentTarget.dataset.status_name == "待收货"){
      ptype ="takegoods"
    }
    //跳转到订单详情
    wx.navigateTo({
      url: '../unpay/unpay?ptype=' + ptype +'&order_id=' + event.currentTarget.dataset.item.id+"&fromOrder=fromOrder"
    })
  },
  onReachBottom: function () { // 下拉底部刷新
    console.log('--------下拉底部刷新-------')
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    this.setPageDetail();
    // 隐藏导航栏加载框
    wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();
  },
  onPullDownRefresh: function () {
    //停下拉复位
    wx.stopPullDownRefresh();
  },

})