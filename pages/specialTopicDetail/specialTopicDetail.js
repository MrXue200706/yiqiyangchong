//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    special_topic_detail:{},//详情
  },
  onLoad(o){
    this.getSpecialTopicDetail(o.id);
  },

  //专题详情
  getSpecialTopicDetail(id){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/project/details',
      data: {
        project_id:id
      },
      success(res) {
        that.setData({
          special_topic_detail: res.data.data
        })
        console.log(that.data.special_topic_detail)
      },
    })
  },
})