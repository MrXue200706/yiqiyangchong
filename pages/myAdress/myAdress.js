//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
	type: null,
    adressList: {},
    goods_id: null,//商品id
	type_selected: null,//选择规格
	selected_numb: 1,//选择数量
  },
  onLoad(options){
	if (options.type == "shopping"){
		this.setData({
			type: options.type,
			goods_id: options.goods_id,
			type_selected: options.type_selected,
			selected_numb: options.selected_numb,
		})
	}else{
		this.setData({
			type: "editAdr"
		})
	}
    this.getAddressList();
  },
  getAddressList(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/addres_list',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      },
      success(res) {
        console.log(res);
        that.setData({
          adressList: res.data.data
        })
      },
    })
  },
  chooseAdr(e){
	var adrId = e.currentTarget.dataset.id;
	if(this.data.type=="shopping"){
		//如果是在购买页面跳转过来的，单击直接填充地址
		wx.navigateTo({
		  url: "../checkPay/checkPay?adrId="+adrId+"&goods_id="+this.data.goods_id+"&type_selected="+this.data.type_selected+"&selected_numb="+this.data.selected_numb
		});
	}else{
		//进入编辑页面
		wx.navigateTo({
		  url: '../addAdress/addAdress?adrId='+adrId,
		});
	}
  }
})