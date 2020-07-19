//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    hasData: true, //确认是否有抢购商品
    shopData: null, //抢购数据
    endHours: 22, //结束抢购的时间（小时）
    timerNo: null, //定时器No，计算时间
    timerNo2: null, //定时器No2，定时刷新数据
    showH: '00', //显示倒计时，时
    showM: '00', //显示倒计时，分
    showS: '00', //显示倒计时，秒
    tmoShopData: null, //第二天商品列表
    nxtDay: '', //次日日期
    toDay:'',
    nextDay:'',
    otherDate:[],
    timeList:[]
,    radio: [], //积分广播
  },
  onShow() {
    this.getshopTime()
    //积分广播
    this.getRadio();
    //当天商品列表
    this.getListDetail();
    //次日商品列表
    this.getTmoShopData();
    let that = this;
    //启动定时器
    this.data.timerNo = setInterval(function() {
      var nowTimed = new Date();
      var nowTime = nowTimed.getTime()
      var eTime;
      if (that.data.shopData != null && that.data.shopData.allshop.allFlag != undefined && that.data.shopData.allshop.allFlag == "Y") {
        eTime = nowTimed.getFullYear() + "-" + (nowTimed.getMonth() + 1) + "-" + (nowTimed.getDate() + 1) + " " + "00:00:00";
        //console.log(111)
        //console.log(eTime)
      } else {
        let showtime=that.data.endHours
        if(that.data.endHours=='24:00'){
          showtime='23:59:59'
        }
        eTime = nowTimed.getFullYear() + "-" + (nowTimed.getMonth() + 1) + "-" + nowTimed.getDate() + " " + showtime ;
        //console.log(222)
        //console.log(eTime)
      }
      var etimes = Date.parse(new Date(eTime.replace(/-/g, "/")));
      var poorTime = etimes - nowTime
     // console.log(poorTime);
      var fTimeStr = that.dateformatOut(poorTime)
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
        that.getListDetail()
    }, 10000);


  },
  onHide() {
    //关闭定时器
    clearInterval(this.data.timerNo);
    clearInterval(this.data.timerNo2);
  },
  onPullDownRefresh() {//下拉刷新数据
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
        //本日有抢购商品数据
        if (res.data.result == 1 && res.data.data != false) {
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
        }
        wx.stopPullDownRefresh()
      },
    })
  },
  callMe(e){//提醒我
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/message/subscribe',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        goods_id: e.detail.target.dataset.goodid,
        flashsale_id: e.detail.target.dataset.flashsale_id,
        form_id: e.detail.formId,
        url: "pages/goodsDetail/goodsDetail?type=shopping&start=y&id=" + e.detail.target.dataset.goodid + "&flashsale_id=" + e.detail.target.dataset.flashsale_id
      },
      success(res) {
        if(res.data.result== 1){
          //弹窗提示
          wx.showToast({
            title: '成功' ,
            icon: 'success',
            duration: 5000,
            mask: true,
            success: function () { }
          })
        }else{
          //弹窗提示
          wx.showToast({
            title: '错误信息：' + res.data.msg,
            icon: 'none',
            duration: 5000,
            mask: true,
            success: function () { }
          })
          
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
  getTmoShopData(){//仅获取一次
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/flashsale/next_day',
      method: 'GET',
      data: {},
      success(res) {
        let nowTime = new Date();

        //次日有抢购商品数据
        if (res.data.result == 1 && res.data.data.allshop != undefined) {
          let nowMon=nowTime.getMonth+1>9?nowTime.getMonth()+1:'0'+(nowTime.getMonth()+1)
          let nowData=nowTime.getDate()+1>9?nowTime.getDate():'0'+nowTime.getDate()
          that.setData({
            tmoShopData: res.data.data,
            nxtDay: (nowTime.getFullYear()) + "-" + (nowMon) + "-" + (nowData) 
          })
          console.log(that.data.tmoShopData)
          console.log(that.data.nxtDay)
        }
      },
    })
  },
  getshopTime(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/flashsale/flashsale_date',
      method: 'GET',
      data: {},
      success(res) {
        let nowTime = new Date();
        let nextDateMs=new Date((new Date()).getTime() + 24*60*60*1000)
        let data=nowTime.getDate()>9?nowTime.getDate():'0'+nowTime.getDate()
        let nextDay=nextDateMs.getDate()>9?nextDateMs.getDate():'0'+nextDateMs.getDate()

        let dataMon = nowTime.getMonth()+1>9?nowTime.getMonth()+1:'0'+(nowTime.getMonth()+1)
        let dataNextMon = nextDateMs.getMonth()+1>9?nextDateMs.getMonth()+1:'0'+(nextDateMs.getMonth()+1)

        that.setData({
          toDay:(nowTime.getFullYear()) + "-" + dataMon + "-" + data,
          nextDay:(nextDateMs.getFullYear()) + "-" + dataNextMon + "-" + nextDay,
        })
        console.log(that.data.toDay)
        console.log(that.data.nextDay)
        //获取抢购时间
        if (res.data.result == 1) {
          console.log(that.data.toDay)
          const timelist = []
          res.data.data.forEach(item=>{
            if(item.flash_date!=that.data.toDay &&  item.flash_date != that.data.nextDay){
              timelist.push(item)
            }
          })
          console.log(timelist)
          that.setData({
            timeList:timelist
          })
          that.getDateShopDetail(timelist)
        }
      },
    })

  },
  getDateShopDetail(idsArr){
    let that = this;
    console.log(idsArr)
    if(idsArr.length){
      that.data.otherDate=[]
      idsArr.forEach((item,i)=>{
        wx.request({
          url: 'https://wechatapi.vipcsg.com/index/flashsale/flashsale_date_goods',
          method: 'GET',
          data: {
            date_id:item.id
          },
          success(res) {
            //获取抢购详情
            if (res.data.result == 1) {
              let chacheData=that.data.otherDate
              res.data.data.showTime=item.flash_date
              chacheData.push(res.data.data)
              console.log(chacheData)
              that.setData({
                otherDate:chacheData
              })
              console.log(that.data.otherDate)
            }
          },
        })
      })
    }
   
  },
  getRadio(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/integral/flashsale_integral',
      method: 'GET',
      data: {},
      success(res) {
        //次日有抢购商品数据
        if (res.data.result == 1) {
          that.setData({
            radio: res.data.data,
          })
        }
      },
    })
  }
})