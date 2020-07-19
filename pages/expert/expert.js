//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    expertDetail: null, //养宠达人个人中心
    isActive:false,
    keyId:null,
    scrollList:[],
    isJoin:false,
    TeamDetail:''
  },
  onLoad(options){
    this.setData(
      {keyId:options.key}
    )
    this.getDetail(options.key);
    this.getMyPetList(options.key)
    this.getUsefollowsList()
    this.isJoinTeam(options.key)
  },
  getDetail(key){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/info',
      method: 'GET',
      data: {
        user_id: key
      }, success(res) {
        that.setData({
          expertDetail: res.data.data
        })
        console.log(res)
      },
    })
  },
  //获取用户follows列表
  getUsefollowsList(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/my_follow',
      method: 'GET',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id
      }, success(res) {
        if(res.data.result == 1){
          var fliterList=res.data.data.filter(item =>{
             return item.follow_id==that.data.keyId
          })
          if(fliterList.length>0){
            that.setData({
              isActive:true
            })
          }else{
            that.setData({
              isActive:false
            })
          }
        }
        
      },
    })
  },
  // 获取萌宠点赞列表
  getMyPetList(key){
	  let that = this;
		wx.request({
		  url: 'https://wechatapi.vipcsg.com/index/member/pet_list',
		  method: 'GET',
		  data: {
			  user_id: key
		  }, success(res) {
        console.log(res)
        if(res.data.result === 1){
          that.setData({
            scrollList: res.data.data
          })
        }
		  },
		})
  },
  //判断是否加入战队
    isJoinTeam(key){
      let that = this
      wx.request({
        url: 'https://wechatapi.vipcsg.com/index/team/is_team_member',
        method: 'GET',
        data: {
          user_id:key
        },
        success(res) {
          if(res.data.result==1){
            console.log(res.data.data.team_id)
            if(res.data.data.team_id){
              that.setData({
                isJoin: true,
              })
              that.getTeamDetail(res.data.data.team_id) 
            }
            
          }
        },
      })
    },
    getTeamDetail(key){
      let that = this
      wx.request({
        url: 'https://wechatapi.vipcsg.com/index/team/details',
        method: 'GET',
        data: {
          user_id:app.globalData.userInfo.data.data.user_id,
          team_id:key
        },
        success(res) {
          if(res.data.result==1){
            that.setData({
              TeamDetail: res.data.data,
            })
            console.log(res.data.data)
          }
        },
      })
    },
  
  // 点赞
  petLikeBtn(event){
    console.log("petid" + event.currentTarget.dataset.petid)
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/like',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        pet_id: event.currentTarget.dataset.petid
      }, success(res) {
        if (res.data.result == 1) {
          wx.showToast({
            title: '点赞成功',
            icon: 'succes',
            duration: 2000,
            mask: true,
            success: function () { }
          })
          //修改显示状态

          //重新刷新宠物详情
          that.getDetail(that.data.keyId);
          that.getMyPetList(that.data.keyId)
          that.getUsefollowsList()
        }
      },
    })

  },
  
  //取消关注
  toNoActive(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/unfollow',
      method: 'post',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        follow_id:that.data.keyId
      }, success(res) {
        console.log(res)
        console.log(that.data.keyId)
        if(res.data.result == 1){
          //弹窗提示
          // wx.showToast({
          //   title: '取消关注成功',
          //   icon: 'succes',
          //   duration: 1000,
          //   mask: true,
          //   success: function () {
          //   }
          // })
          that.getUsefollowsList()
        }
      },
    })
  },
  //去关注
  toActive(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/follow',
      method: 'post',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        follow_id:that.data.keyId
      }, success(res) {
        console.log(res)
        console.log(that.data.keyId)
        if(res.data.result == 1){
          //弹窗提示
          // wx.showToast({
          //   title: '关注成功',
          //   icon: 'succes',
          //   duration: 1000,
          //   mask: true,
          //   success: function () {
          //   }
          // })
          that.getUsefollowsList()
        }
      },
    })
  }

})