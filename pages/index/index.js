//index.js
//获取应用实例
const app = getApp()
app.checkLogin()

Page({
  data: {
    swiper: [], //轮播图片
    goods_index: [], //首页商品列表
    pet_expert: [], //养宠达人列表
    special_topic: [], //专题
    goods_recommend: [], //活动
    pageno:1
  },
  onLoad() {
    //请求
    this.getSwiper();
    this.getGoodsIndex(1);
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
  onReachBottom() {
    // 下拉触底，先判断是否有请求正在进行中
    // 以及检查当前请求页数是不是小于数据总页数，如符合条件，则发送请求
   // if (!this.loading && this.data.page < this.data.pages) {    
      this.getGoodsIndex(++this.data.pageno)
    //}
  },

  //请求商品列表
  getGoodsIndex(pageno) {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/index',
      data: {page:pageno},
      success(res) {
        that.setData({
          goods_index: that.data.goods_index.concat(res.data.data) 
        })
        console.log(that.data.goods_index)
      },
    })
  },

  //养宠达人
  getPetExpert() {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/friend/index',
      data: {},
      success(res) {
        that.setData({
          pet_expert: res.data.data
        })
        // debugger;
        console.log(that.data.pet_expert)
      },
    })
  },

  //专题
  getSpecialTopic() {
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
  getGoodsRecommend() {
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
  },

  //关注
  focusOn(e) {
    let friend_id = e.currentTarget.dataset.friendid
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/follow',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        follow_id: friend_id
      },
      success(res) {
        if (res.data.result == 1) {
          //弹窗提示
          wx.showToast({
            title: '关注成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
            success: function () {
              //按钮变黑

            }
          })
        }
      },
    })
  },
})