//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    tab_list:["全部","待付款","待成团","待收货","已完成"],
    tab_selected_id:0,
  },
  onLoad(options){
	  
  },
  tab_select_fn(event){
    let id = event.currentTarget.id;
    this.setData({
      tab_selected_id: id
    });
    console.log(11)
  }
})