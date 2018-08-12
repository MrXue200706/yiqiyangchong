//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    swiper: [], //轮播图片
    goods_index: [], //首页商品列表
    pet_expert:[],//养宠达人列表
    special_topic:[],//专题
    goods_recommend:[],//活动

  },
  onLoad() {
    //请求
    this.getSwiper();
    this.getGoodsIndex();
    this.getPetExpert();
    this.getSpecialTopic();
    this.getGoodsRecommend();
  },

  //请求轮播图
  getSwiper() {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/slider/index',
      data: {},
      success(res) {
        that.setData({
          swiper: res.data.data
        })
        // console.log(that.data.swiper)
      },
    })
  },

  //请求商品列表
  getGoodsIndex(){
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

  //养宠达人
  getPetExpert(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/friend/index',
      data: {},
      success(res) {
        that.setData({
          pet_expert: res.data.data
        })
        // console.log(that.data.pet_expert)
      },
    })
  },

  //专题
  getSpecialTopic(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/project/index',
      data: {},
      success(res) {
        that.setData({
          special_topic: res.data.data
        })
        // console.log(that.data.special_topic)
      },
    })
  },

  //活动
  getGoodsRecommend(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/events/index',
      data: {},
      success(res) {
        that.setData({
          goods_recommend: res.data.data
        })
        // console.log(that.data.goods_recommend)
      },
    })
  }
})