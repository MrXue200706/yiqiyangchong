//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    collectList: null, //收藏列表
  },
  onLoad(){
    this.getCollectList(1);
  },
  getCollectList(pageNo){//获取收藏列表
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/collection_list',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        page: pageNo
      }, success(res) {
        that.setData({
          collectList: res.data.data
        })
      },
    })
  }
})
