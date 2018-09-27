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
      "untogether": "6", 
      "unpick": "3", 
      "done": "5", 
    },
    orderShowBtn:{
      "未付款":"立即支付",
      "拼团待支付": "邀请参团",
      "待收货": "邀请参团",
    },
    tab_selected_id: 0,
    ptype: "all", //页面类型，默认全部订单，unpay：待付款，untogether：待成团，unpick：待收货，done：已完成
    pageList: null, //页面内容列表
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
    //设置高亮
    this.setData({
      tab_selected_id: id
    });
    //设置页面数据
    this.setPageDetail();
  },
  setPageDetail() { //设置页面内容
    let that = this;
    console.log("状态码: " + that.data.orderStatusDict[that.data.ptype])
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/order/order_list',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        order_status: that.data.orderStatusDict[that.data.ptype], //状态码
        page: "", //分页
      },
      success(res) {
        if (res.data.result == 1) {
          console.log(res.data.data)
          that.setData({
            pageList: res.data.data
          })
        }
      },
    })
  },
  payBtn(event){
    //根据按钮类型，进行相应的处理
    //event.currentTarget.
    console.log(event.currentTarget.dataset.btntype)
    console.log(event.currentTarget.dataset.item)
    let btnType = event.currentTarget.dataset.btntype
    if(btnType=="立即支付"){
      //跳转到支付页面
      wx.navigateTo({
        url: '../unpay/unpay?order_id=' + event.currentTarget.dataset.item.id
      })
    } else if (btnType == "邀请参团"){
      //跳转到邀请页面
      wx.navigateTo({
        url: '../goodsTogether/goodsTogether?ct=n&param_id=23'
      })
    }
  }
})