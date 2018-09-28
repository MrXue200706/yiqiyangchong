//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    shopList: null, //列表
    dateListNum: [],  //时间段num列表
    nowTime: null, //当前时间，用于判断并实时刷新当前列表
    timerNo: null, //定时器No，计算时间
    chooseTimeNum: null, //当前列表页所在时间段区间，用户点击时间区间，用于标注当前是哪个时间段的列表
    shoppingGoodsTimeNo: null, //当前时间抢购的时间段，自动计算当前哪个时间段在做抢购
  },
  onLoad(){
    this.setData({
      nowTime: Number(new Date().getHours())
    })
    this.getTimeList();
  },
  onShow(){
    this.getShopList(Number(new Date().getHours()));
    let that = this;
    //启动定时器
    this.data.timerNo = setInterval(function () {
      //获取下一个抢购时间
      //遍历获取下一个时间
      console.log("编写倒计时TODO")
      let tempTime = Number(new Date().getHours())
      if (that.data.nowTime != tempTime && that.data.dateListNum.indexOf(tempTime) != -1) {
        //更新列表数据
        that.setData({
          nowTime: tempTime
        })
        this.getShopList(tempTime);
      }
    }, 1000);
  },
  chooseTimeShow(e){//选择时间段，展示列表
    this.getShopList(e.currentTarget.dataset.timenum);
  }, 
  onHide(){
    //关闭定时器
    clearInterval(this.data.timerNo);
  },
  getTimeList(){//获取时间段信息
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/flashsale/time_list',
      method: 'GET',
      data: {}, 
      success(res) {
        let dataListTemp = res.data.data
        console.log(dataListTemp)
        let tempNumList=[]
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
  getShopList(timeNum){//获取给定时间数字的抢购列表
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
      }, success(res) {
        that.setData({
          shopList: res.data.data
        })
      },
    })
  }
})