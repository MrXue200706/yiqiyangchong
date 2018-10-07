//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    shopData: null, //抢购数据
    endHours: 22, //结束抢购的时间（小时）
    timerNo: null, //定时器No，计算时间
    timerNo2: null, //定时器No2，定时刷新数据
    showH: '00', //显示倒计时，时
    showM: '00', //显示倒计时，分
    showS: '00', //显示倒计时，秒
  },
  onShow() {
    this.getListDetail();
    let that = this;
    //启动定时器
    this.data.timerNo = setInterval(function() {
      var nowTimed = new Date();
      var nowTime = nowTimed.getTime()
      var eTime;
      if (that.data.shopData.allshop.allFlag == "Y") {
        eTime = nowTimed.getFullYear() + "-" + (nowTimed.getMonth() + 1) + "-" + (nowTimed.getDate() + 1) + " " + "00:00:00";
      } else {
        eTime = nowTimed.getFullYear() + "-" + (nowTimed.getMonth() + 1) + "-" + nowTimed.getDate() + " " + that.data.endHours + ":00";
      }
      var etimes = Date.parse(new Date(eTime.replace(/-/g, "/")));
      var poorTime = etimes - nowTime
      var fTimeStr = that.dateformatOut(poorTime)
      //console.log("倒计时时间：" + fTimeStr)
      //判断当前是否为整点
      var minutes = parseInt((nowTime % (1000 * 60 * 60)) / (1000 * 60))
      var seconds = (nowTime % (1000 * 60)) / 1000
      if (minutes == 0 && seconds == 0) {
        //整点刷新列表
        that.getListDetail()
      }
    }, 1000);

    //定时器2：每10秒刷新一次数据
    this.data.timerNo2 = setInterval(function () {
      console.log("定时刷新数据：" + that.dateformatOut(new Date().getTime()))
        that.getListDetail()
    }, 10000);


  },
  onHide() {
    //关闭定时器
    clearInterval(this.data.timerNo);
    clearInterval(this.data.timerNo2);
  },
  onPullDownRefresh() {//下拉刷新
    console.log("上啦刷新数据")
    this.getListDetail()
    wx.showNavigationBarLoading() //在标题栏中显示加载
    wx.hideNavigationBarLoading() //关闭加载
  },
  getListDetail() { //获取列表数据
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/flashsale/flashsale_list',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        if (res.data.result == 1) {
          that.setData({
            shopData: res.data.data,
          })
          if (res.data.data.currentshop.nowFlag == "Y" && res.data.data.allshop.allFlag != "Y") {
            var nowSTime = res.data.data.currentshop.nowSTime
            var temp = nowSTime.replace(/.+-/g, "")
            that.setData({
              endHours: temp
            })
          }
          console.log(that.data.shopData)
        }
      },
    })
  },
  callMe(){//提醒我
    console.log("callMe")
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

    this.setData({
      showH: hr < 10 ? "0" + hr : hr,
      showM: min < 10 ? "0" + min : min,
      showS: sec < 10 ? "0" + sec : sec,
    })
    if (t == 0) {
      return day + "天" + hr + "小时" + min + "分钟" + sec + "秒";
    } else {
      return hr + "小时" + min + "分钟" + sec + "秒";
    }
  },
})