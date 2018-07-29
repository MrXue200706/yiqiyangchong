//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    is_iframe:false,//点击购买按钮弹出选择弹出层
    type_two:false,//规格2显示
    type_active:false,//修改点击后的样式
    shopping:'normal',//是否抢购，否则正常
  },
  iframeFn(){
    this.setData({is_iframe:!this.data.is_iframe});
  },
  typeTwoFn(e){
    this.setData({type_two:!this.data.type_two});
    this.setData({type_active:!this.data.type_active});
  },
  onLoad(o){
    if(o.type == 'shopping'){
      this.setData({shopping:'shopping'})
    }
  }
})