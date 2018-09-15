//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    goods_id: null, //商品ID
    goods_detail: null, //商品详情
  },
  onLoad(options){
    this.getGoodsDetail(options.goods_id);
  },
  getGoodsDetail(id) {//获取商品详情，填充页面
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/details',
      data: {
        goods_id: id
      },
      success(res) {
        that.setData({
          goods_detail: res.data.data
        });
      },
    })
  },
  shareTogetherShop(){//邀请组团，分享
    
  }
})