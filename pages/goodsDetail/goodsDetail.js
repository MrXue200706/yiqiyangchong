//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    is_iframe:false,//点击购买按钮弹出选择弹出层
    type_two:false,//规格2显示
    type_active:false,//修改点击后的样式
  },
  iframeFn(){
    this.setData({is_iframe:!this.data.is_iframe});
  },
  typeTwoFn(e){
    this.setData({type_two:true});
    this.setData({type_active:true});
  }
})