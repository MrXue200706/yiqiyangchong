//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    swiper:[],//轮播图片
  },
  onLoad(){
    let that = this;
    //请求轮播图
    wx.request({
      url:'https://wechatapi.vipcsg.com/index/slider/index',
      data:{},
      success(res){
        that.setData({swiper:res.data.data})
        console.log(that.data.swiper)
      },
    })
  }
})
