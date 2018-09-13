//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
	type: null,
    adressList: {},
    goods_id: null,//商品id，临时存储
	type_selected: null,//选择规格，临时存储
	selected_numb: 1,//选择数量，临时存储
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
	let adrId = e.currentTarget.dataset.id;
	if(this.data.type=="shopping"){
		//如果是在购买页面跳转过来的，单击直接填充地址
		wx.navigateTo({ 
		  url: "../checkPay/checkPay?adrId="+adrId+"&goods_id="+this.data.goods_id+"&type_selected="+this.data.type_selected+"&selected_numb="+this.data.selected_numb
		});
	}else{
		//进入编辑页面
		wx.navigateTo({
		  url: '../addAdress/addAdress?type=editAdr&adrId='+adrId,
		});
	}
  },
  setDef(e){
	let adrId = e.currentTarget.dataset.id;
	let name = e.currentTarget.dataset.name;
	let phone = e.currentTarget.dataset.phone;
	let address = e.currentTarget.dataset.address;
	let isdef = e.currentTarget.dataset.def;
	
	let that = this;
	wx.request({
	  url: 'https://wechatapi.vipcsg.com/index/member/update_address',
	  method: 'POST',
	  data: {
		"address_id": adrId,
		"user_id": app.globalData.userInfo.data.data.user_id,
		"is_default": isdef,
		"name": name,
		"phone": phone,
		"addres": address
	  }, success(res) {
		if (res.data.result == 1){
			wx.showToast({
				title: '设置成功',
				icon: 'succes',
				duration: 1000,
				mask:true
			})
		    //设置高亮操作xxxxxxxxxxTODO
			
			
		}else{
		    //保存失败
			wx.showToast({
				title: '设置出错，请稍后再试',
				icon: 'none',
				duration: 1000,
				mask:true
			})
		}
	  },
	})
  },
  delAdr(e){
	let adrId = e.currentTarget.dataset.id;
	let that = this;
	wx.showModal({
		title: '提示',
		content: '确认删除当前地址？',
		success: function (res) {
		   if (res.confirm) {//这里是点击了确定以后
				wx.request({
				  url: 'https://wechatapi.vipcsg.com/index/member/delete_address',
				  method: 'POST',
				  data: {
					user_id: app.globalData.userInfo.data.data.user_id,
					address_id: adrId 
				  }, success(res) {
					  wx.showToast({
							title: '删除成功',
							icon: 'succes',
							duration: 1000,
							mask:true,
							success:function(){
								that.getAddressList();//更新数据
							}
						})
				  },
				})
		   } else {//这里是点击了取消以后
				console.log('用户点击取消')
		   }
		}
    })
  }
})