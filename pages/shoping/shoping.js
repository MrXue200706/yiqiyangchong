//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    shopList: null, //列表
    dateListNum: [], //时间段num列表
    endHours: 14, //结束抢购的时间（小时）
    timerNo: null, //定时器No，计算时间
    showH: null, //显示倒计时，时
    showM: null, //显示倒计时，分
    showS: null, //显示倒计时，秒
  },
  onLoad() {
    this.getTimeList();
  },
  onShow() {
    this.getShopList(Number(new Date().getHours()));
    let that = this;
    //启动定时器
    this.data.timerNo = setInterval(function() {
      var nowTimed = new Date();
      var nowTime = nowTimed.getTime()
      var eTime = nowTimed.getFullYear() + "-" + (nowTimed.getMonth() + 1) + "-" + nowTimed.getDate() + " " + that.data.endHours + ":00:00";
      var etimes = Date.parse(new Date(eTime.replace(/-/g, "/")));
      var poorTime = etimes - nowTime
      var fTimeStr = that.dateformatOut(poorTime)
      //console.log("倒计时时间：" + fTimeStr)
      //判断当前是否为整点
      var min = Math.floor(nowTime / 1000 / 60 % 60);
      var sec = Math.floor(nowTime/1000 % 60);
      if(min==0 && sec==0){
        //整点刷新列表
        //TODO
      }
    }, 1000);
  },
  chooseTimeShow(e) { //选择时间段，展示列表
    this.getShopList(e.currentTarget.dataset.timenum);
  },
  onHide() {
    //关闭定时器
    clearInterval(this.data.timerNo);
  },
  getTimeList() { //获取时间段信息
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/flashsale/time_list',
      method: 'GET',
      data: {},
      success(res) {
        let dataListTemp = res.data.data
        console.log(dataListTemp)
        let tempNumList = []
        for (var i in dataListTemp) {
          if (dataListTemp[i] == '全天') continue
          let tempStr = String(dataListTemp[i]).replace(/:.*/g, '');
          tempNumList.push(Number(tempStr))
        }
        that.setData({
          dateListNum: tempNumList
        })
      },
    })
  },
  getShopList(timeNum) { //获取给定时间数字的抢购列表
    timeNum = timeNum % 2 > 0 ? timeNum - 1 : timeNum;
    let timeStr = timeNum < 10 ? '0' + timeNum + ':00' : timeNum + ':00';
    //设置当前列表区间
    this.setData({
      chooseTimeNum: timeNum
    })
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/flashsale/index',
      method: 'GET',
      data: {
        time: timeStr
      },
      success(res) {
        that.setData({
          shopList: res.data.data
        })
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
  }
})