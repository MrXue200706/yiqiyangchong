//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    
  },
  onShow(){
    this.getList();
  },
  getNowTime(){

  },
  getList(){
    //获取当前时间
    let nowH = new Date().getHours()
    console.log(nowH);
    let that = this;
    wx.request({
      url: 'http://wechatapi.vipcsg.com/index/flashsale/index',
      method: 'GET',
      data: {
        time: "15:00"
      }, success(res) {
        console.log(res);
      },
    })
  }
})