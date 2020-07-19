//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    team_name:null,
    team_id:null,
    user_id: null,
    pet_id: null, //萌宠ID，用于数据更新
    pet_name: null, //名称
    pet_sex: null, //性别
    pet_type: null, //品种
    pet_birthday: "", //生日
    pet_story: null, //故事
    pet_img: [], //照片
    petFilePaths: null, //图片上传临时变量
    showCancelBtn:true,//删除照片按钮显示
    petsAdd:"petsAdd",
    is_captain:false,
    //editmore:true
    modalHidden:true,
    show:false,
    member_id:'',
    ismodalHidden:true,
    isshowdis:false,
  },
  onLoad(options) { 
    this.setData({
      petsAdd:"petsAdd",
      team_id: options.teamId != undefined ? options.teamId : null,
    })
    this.data.pet_birthday = this.stringToDate("2018-08-13", "-");
    this.getHotTroopDetail()
    //获取萌宠详情
    this.getPetDetail()
    //this.isCaptain()
  },
  onShow(options){
    this.setData({
     // petsAdd: "hidepets"
    })
    // wx.showLoading({
    //   title: '加载中...',
    // })
    let that=this
    var value = wx.getStorageSync('petAddoK');
    var valuelist = wx.getStorageSync('petAddlistoK');
    console.log(this)
    //return;
			if (value&&valuelist) {   
        wx.setStorage({key:"petAddoK",data:false});
        wx.setStorage({key:"petAddlistoK",data:false});
				wx.switchTab({
					url: '../mine/mine',
        })
        return;
    }
  },
  petNameVal(e) {
    this.setData({
      team_name: e.detail.value
    })
  },
  // 获取战队详情
  getHotTroopDetail: function(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/team/details',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        team_id: that.data.team_id
      },
      success(res) {

        if (res.data.result == 1) {
          let imgArr=[]
          imgArr.push({pet_img:res.data.data.team_img})
          that.setData({
            team_name:res.data.data.team_name,
            pet_img:imgArr
          })
          console.log(that.data.pet_img)
          if(res.data.data.is_captain==1){
            that.setData({
              is_captain:true
            })
          }
          if(res.data.data.is_captain==1||res.data.data.is_member==1){
            //that.getTeamReward()
          }
          that.setData({
            detail: res.data.data
          })
        }
        let a={
          data:
          {user_id: 19, is_new: 0}
        }
      },
    })
  },
  // 判断是否队长
  // isCaptain(){
  //   let that = this 
  //   wx.request({
  //     url: 'https://wechatapi.vipcsg.com/index/team/is_captain',
  //     method: 'POST',
  //     data: {
  //       user_id: app.globalData.userInfo.data.data.user_id,
  //     },
  //     success(res) {
  //       if (res.data.result == 1) {
  //         that.setData({
  //           is_captain: res.data.data
  //         })
  //       }
  //     },
  //   })
  // },
  showModaldis:function(e){
    let memberId= e.currentTarget.dataset.captainid || e.currentTarget.dataset.memberid
    console.log(memberId)
    this.setData({
     ismodalHidden:!this.data.ismodalHidden,
    })
   },
   modalBindaconfirmdis:function(){
     this.setData({
     ismodalHidden:!this.data.ismodalHidden,
     isshowdis:!this.data.isshowdis,
     tip:'您点击了【确认】按钮！',
     buttonDisabled:!this.data.buttonDisabled
    })
    this.dissolution()
    //this.dissolution(this.data.member_id)
   },
   modalBindcanceldis:function(){
     this.setData({
     ismodalHidden:!this.data.ismodalHidden,
     tip:'您点击了【取消】按钮！'
    })
   },
  // 解散战队
  dissolution(){
    let that = this
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/team/dissolution',
      method: 'POST',
      data: {
        captain_id: app.globalData.userInfo.data.data.user_id,
        team_id: that.data.team_id
      },
      success(res) {
        if (res.data.result == 1) {
          wx.showToast({
            title: '成功',
            icon: 'succes',
            duration: 2000,
            mask: true
          })
          wx.switchTab({
            url: '../index/index',
          })
        }
      },
    })
  },
  showModal:function(e){
    let memberId= e.currentTarget.dataset.captainid || e.currentTarget.dataset.memberid
    console.log(memberId)
    this.setData({
     modalHidden:!this.data.modalHidden,
     member_id:memberId
    })
   },
   modalBindaconfirm:function(){
     this.setData({
     modalHidden:!this.data.modalHidden,
     show:!this.data.show,
     tip:'您点击了【确认】按钮！',
     buttonDisabled:!this.data.buttonDisabled
    })

    this.kickOutTroop(this.data.member_id)
   },
   modalBindcancel:function(){
     this.setData({
     modalHidden:!this.data.modalHidden,
     tip:'您点击了【取消】按钮！'
    })
   },
  // 踢出战队
  kickOutTroop(eid){
    let that = this
    console.log(eid)
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/team/kick_out',
      method: 'POST',
      data: {
        captain_id: app.globalData.userInfo.data.data.user_id,
        team_id: that.data.team_id,
        member_id:eid
      },
      success(res) {
        if (res.data.result == 1) {
          wx.showToast({
            title: '成功',
            icon: 'succes',
            duration: 2000,
            mask: true
          })
          that.getHotTroopDetail()
          //获取萌宠详情
          that.getPetDetail()
        }
      },
    })
  },
 
  addPic() { //图片上传临时变量填充
    let that = this;
    wx.chooseImage({
      count: 6, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.data.petFilePaths = res.tempFilePaths;
        //图片回显操作
        var arr = [];
        console.log(res)
        for (var i = 0; i < res.tempFilePaths.length; i++){
          var json = {};
          json.pet_img = res.tempFilePaths[i];
          that.data.pet_img[0]=json;
        }
        console.log(that.data.pet_img)
        that.setData({
          pet_img: that.data.pet_img
        })
      }
    })
  },
  submitForm() { //提交表单
    //数据校验
    if (!this.checkFormData()) {
      return;
    }
    let that = this;
    var flat=false;
    console.log(that)
    let url = 'https://wechatapi.vipcsg.com/index/team/create_team'
    if (that.data.team_id) {
      //更新萌宠信息
      url = 'https://wechatapi.vipcsg.com/index/team/team_edit'
      flat=true;
    }
    //提交基本信息
    wx.request({
      url: url,
      method: 'POST',
      data: {
        team_name:that.data.team_name,
        user_id: app.globalData.userInfo.data.data.user_id,
        team_id: that.data.team_id || ''
        // pet_id: this.data.pet_id, //用于数据更新
        // pet_name: this.data.pet_name, //名称
        // pet_sex: this.data.pet_sex, //性别
        // pet_type: this.data.pet_type, //品种
        // pet_birthday: this.data.pet_birthday, //生日
        // pet_story: this.data.pet_story, //故事
      },
      success(res) {
        let pet_id = res.data.data.team_id;
        console.log(res.data.msg)
        if (pet_id == undefined && pet_id == null&&!flat) {
          if(res.data.msg=="不能添加萌宠"){
              //上传数据出错
          wx.showToast({
            title: '多次违规，限制添加',
            icon: 'none',
            duration: 2000,
            mask: true
          });
          return;
          }
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
              url: 'https://wechatapi.vipcsg.com/index/team/upload_team_img',
              filePath: tempFilePaths[i],
              name: 'file',
              formData: {
                'user_id': app.globalData.userInfo.data.data.user_id,
                'team_id': pet_id
              },
              header: {
                "Content-Type": "multipart/form-data"
              },
              success: function(res) {
                uploadImgCount++;

                //如果是最后一张,则隐藏等待中
                if (uploadImgCount == tempFilePaths.length) {
                  wx.hideToast();
                }
                //上传结束
                wx.showToast({
                  title: '成功',
                  icon: 'succes',
                  duration: 2000,
                  mask: true
                })
                wx.switchTab({
                  url: '../mine/mine',
                })
                // wx.setStorage({key:"petAddoK",data:true});
                // wx.navigateTo({
                //   url: '../myPets/myPets',
                // })
              },
              fail: function(res) {
                // debugger;
                wx.hideToast();
                wx.showModal({
                  title: '错误提示',
                  content: '上传图片失败',
                  showCancel: false,
                  success: function(res) {}
                })
                wx.setStorage({key:"petAddoK",data:true});
                //跳转到列表页
                wx.navigateTo({
                  url: '../myPets/myPets',
                })
              }
            });
          }
        } else {
          //上传结束
          wx.showToast({
            title: '成功',
            icon: 'succes',
            duration: 2000,
            mask: true
          })
          var pages = getCurrentPages(); // 获取页面栈
          console.log(pages)
          wx.switchTab({
            url: '../mine/mine',
          })
         // wx.getStorage(wx.getStorageSync)
         
        //  wx.setStorage({key:"petAddoK",data:true});
        //   wx.navigateTo({
          
        //     url: '../hotTroopMake/hotTroopMake',
        //   })
        }
      },
    })
  },
  //日期选择
 
  bindDateChange: function (e) {
    console.log(e.detail.value)
   this.setData({
    pet_birthday: e.detail.value
   })
 },
 cancelPic(e){
   let that = this;
   console.log(e)
   wx.request({
     url: 'https://wechatapi.vipcsg.com/index/member/delete_pet_img',
     method: 'POST',
     data: {
       user_id: app.globalData.userInfo.data.data.user_id,
       id: e.currentTarget.dataset.pid,
     },
     success(res) {
       if (res.data.result == 1) {
         wx.showToast({
           title: '删除成功',
           icon: 'succes',
           duration: 2000,
           mask: true,
           success: function () { }
         })
       }
     },
   })
   this.getPetDetail()
 },
  checkFormData() { //表单数据校验
    if (this.data.team_name == null || this.data.team_name == undefined || this.data.team_name.length == 0) {
      wx.showToast({
        title: '请输入战队名称',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return false;
    }
    return true;
  },
  stringToDate: function(dateStr, separator) { //临时日期格式化
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
  getPetDetail() {
    console.log(this.data.pet_id)
    if (this.data.pet_id == undefined || this.data.pet_id == null) {
      return
    }

    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/pet_details',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        pet_id: this.data.pet_id,
        order: '',
      }, 
      success(res) {
        if (res.data.result == 1) {
          console.log(res.data.data.pet_img)
          that.setData({
            //数据填充
            team_name: res.data.data.team_name, //名称
            pet_img: res.data.data.pet_img != undefined ? res.data.data.pet_img : null ,//照片
            petsAdd:"petsAdd",  
          })
        }
      },
    })
  },
})