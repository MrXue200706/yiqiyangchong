//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    pet_name: null, //名称
    pet_sex: null, //性别
    pet_type: null, //品种
    pet_birthday: null, //生日
    pet_story: null, //故事
    pet_img: null, //照片
    petFilePaths: null, //图片上传临时变量
  },
  onLoad(options) {
	this.data.pet_birthday = this.stringToDate("2018-08-13","-");
  },
  petNameVal(e) {
    this.data.pet_name = e.detail.value;
  },
  petSexVal(e) {
    this.data.pet_sex = e.currentTarget.dataset.sex;
  },
  petTypeVal(e) {
    this.data.pet_type = e.detail.value;
  },
  petBirthdayVal(e) {
    this.data.pet_birthday = stringToDate("2018-08-13","-");
  },
  petStoryVal(e) {
    this.data.pet_story = e.detail.value;
  },
  addPic() {//图片上传临时变量填充
	let that = this;
    wx.chooseImage({
      count: 6, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.data.petFilePaths = res.tempFilePaths;
        //图片回显操作
        debugger;
      }
    })
  },
  submitForm() {  //提交表单
    //数据校验
    if (!this.checkFormData()) {
      return;
    }
    let that = this;
    //提交基本信息
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/pet',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        pet_name: this.data.pet_name, //名称
        pet_sex: this.data.pet_sex, //性别
        pet_type: this.data.pet_type, //品种
        pet_birthday: this.data.pet_birthday, //生日
        pet_story: this.data.pet_story, //故事
      }, success(res) {
        let pet_id = res.data.data.pet_id;
		if(pet_id == undefined && pet_id == null){
			//上传数据出错
			wx.showToast({
				title: '上传数据出错，请稍后再试',
				icon: 'none',
				duration: 2000,
				mask: true
			  });
			  return;
		}

		//上传图片
        let tempFilePaths = that.data.petFilePaths;
        if (tempFilePaths != null) {
          //启动上传等待中...
          wx.showToast({
            title: '正在上传...',
            icon: 'loading',
            mask: true,
            duration: 10000
          })
          var uploadImgCount = 0;
          for (var i = 0; i < tempFilePaths.length; i++) {
            wx.uploadFile({
              url: 'https://wechatapi.vipcsg.com/index/member/upload_pet_img',
              filePath: tempFilePaths[i],
              name: 'file',
              formData: {
                'user_id': app.globalData.userInfo.data.data.user_id,
				        'pet_id': pet_id
              },
              header: {
                "Content-Type": "multipart/form-data"
              },
              success: function (res) {
                uploadImgCount++;
				debugger;

                //如果是最后一张,则隐藏等待中
                if (uploadImgCount == tempFilePaths.length) {
                  wx.hideToast();
                }
				//上传结束
				wx.showToast({
					title: '成功',
					icon: 'succes',
					duration: 2000,
					mask:true
				})
				wx.navigateTo({
				  url: '../myPets/myPets',
				})
              },
              fail: function (res) {
				  debugger;
                wx.hideToast();
                wx.showModal({
                  title: '错误提示',
                  content: '上传图片失败',
                  showCancel: false,
                  success: function (res) { }
                })
				//跳转到列表页
				wx.navigateTo({
				  url: '../myPets/myPets',
				})
              }
            });
          }
        }else{
			//上传结束
			wx.showToast({
				title: '成功',
				icon: 'succes',
				duration: 2000,
				mask:true
			})
			wx.navigateTo({
			  url: '../myPets/myPets',
			})
		}
      },
    })
  },
  checkFormData() {//表单数据校验
    if (this.data.pet_name == null) {
      wx.showToast({
        title: '请输入宠物的昵称',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return false;
    }
    if (this.data.pet_sex == null) {
      wx.showToast({
        title: '请选择宠物性别',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return false;
    }
    if (this.data.pet_type == null) {
      wx.showToast({
        title: '请输入宠物的品类',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return false;
    }
    if(this.data.pet_birthday == null ){
      wx.showToast({
        title: '请选择宠物的生日',
        icon: 'none',
        duration: 2000,
        mask:true
      });
      return false;
    }
    if (this.data.pet_story == null) {
      wx.showToast({
        title: '请简单介绍一下宠物的故事',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return false;
    }
    return true;
  },
  stringToDate: function (dateStr, separator) {//临时日期格式化
    if (!separator) {
      separator = "-";
    }
    var dateArr = dateStr.split(separator);
    var year = parseInt(dateArr[0]);
    var month;
    //处理月份为04这样的情况                         
    if (dateArr[1].indexOf("0") == 0) {
      month = parseInt(dateArr[1].substring(1));
    } else {
      month = parseInt(dateArr[1]);
    }
    var day = parseInt(dateArr[2]);
    var date = new Date(year, month - 1, day);
    return date;
  },
})