//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    collectList: null, //收藏列表
  },
  onLoad(options){
    if (options.ptype =="recommend"){//推荐商品
      wx.setNavigationBarTitle({ title: '推荐商品' }) 

    } else if (options.ptype == "collect"){//收藏商品
      wx.setNavigationBarTitle({ title: '收藏' }) 
      this.getCollectList(options.uid, 1);
    }
  },
  getCollectList(uid,pageNo){//获取收藏列表
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/collection_list',
      method: 'GET',
      data: {
        user_id: uid,
        page: pageNo
      }, success(res) {
        that.setData({
          collectList: res.data.data
        })
      },
    })
  },
  getRecommendList() {//获取商品推荐列表TODO
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/collection_list',
      method: 'GET',
      data: {
        user_id: uid,
        page: pageNo
      }, success(res) {
        that.setData({
          collectList: res.data.data
        })
      },
    })
  }
})
