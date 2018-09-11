//index.js
//获取应用实例
const app = getApp()
//文件引用
var CusBase64 = require('../../utils/base64.js');

Page({
  data: {
    is_iframe:false,//点击购买按钮弹出选择弹出层
    type_one_active:null,//修改点击后的样式
    type_two_active:null,//修改点击后的样式
    type_selected:{},//选中的规格
    shopping:'normal',//是否抢购，否则正常
    goods_detail:{},//详情
    selected_numb:1,//选择的数量
    descript:null,//描述
  },
  iframeFn(){//规格选择弹出
    this.setData({is_iframe:!this.data.is_iframe});
  },
  typeOneFn(event){//规格1选择
    let type_select = event.target.dataset.type;
    let id = event.target.id;
    this.setData({type_selected:type_select});
    this.setData({type_one_active:id});
    // console.log(this.type_one_active)
  },
  typeTwoFn(event){//规格2选择
    this.setData({type_two_active:!this.data.type_two_active});
  },
  onLoad(o){
    if(o.type == 'shopping'){
      this.setData({shopping:'shopping'})
    }

    //请求
    this.getGoodsDetail(o.id);
  },
  getGoodsDetail(id){//获取页面细节
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/details',
      data: {
        goods_id:id
      },
      success(res) {
        that.setData({
          goods_detail: res.data.data
        });
        that.setData({
          descript:res.data.data.goods_desc
        });
        console.log(that.data.goods_detail)
        console.log(that.data.descript)
      },
    })
  },
  numberReduceFn(){//减
    this.setData({selected_numb:this.data.selected_numb-1});
    this.data.selected_numb < 1 ? 
      this.setData({selected_numb:1}):null;
  },
  numberAddFn(){//加
    this.setData({selected_numb:this.data.selected_numb+1})
  },
})