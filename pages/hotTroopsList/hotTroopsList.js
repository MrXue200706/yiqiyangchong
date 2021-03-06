//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    petList: null, //列表数据
    petType: null, //列表类型，fans：粉丝，follow：关注
    uid: null, //用户ID
    pageType: null, //页面类型，用于判断是从哪个页面跳转过来的，如果是看别人的养宠达人中跳过来的，则关闭关注和取消的按钮
  },
  onLoad(options){
    this.setData({
      petType: options.petType, 
      uid: options.uid, 
      pageType: options.pageType,
      goodid:options.goodid
    })
      this.getHotTroopList()
      //this.getFriendList();
  },
  // 获取战队
  getHotTroopList(){
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/team/circle',
      data: {
        page: 1
      },
      success(res) {
        if(res.data.result == 1){
          if(res.data.data.length){
            res.data.data.forEach((element,index) => {
              element.rankingImage='../../images/ranking'+-(-index-1)+'.png'
            });
          }
          that.setData({
            // goods_index: that.data.goods_index.concat(res.data.data)
            petList:res.data.data
          })

        }
        
        // console.log(that.data.goods_index)
      },
    })
  },
  getFriendList() {//获取我的关注宠友
    let that = this;
    let urlStr = "https://wechatapi.vipcsg.com/index/member/my_follow?user_id=19";
    if (this.data.petType =="follow"){
      console.log("关注列表")
      urlStr = "https://wechatapi.vipcsg.com/index/member/my_follow";
      //设置顶部显示文字
      wx.setNavigationBarTitle({ title: '关注列表' }) 
    } else if (this.data.petType =="fans"){
      console.log("粉丝列表")
      urlStr = "https://wechatapi.vipcsg.com/index/member/my_fans";
      //设置顶部显示文字
      wx.setNavigationBarTitle({ title: '粉丝列表' }) 
    }else if (this.data.petType =="friends"){
      console.log("宠友列表")
      urlStr = "https://wechatapi.vipcsg.com/index/goods/recommended";
      //设置顶部显示文字
      wx.setNavigationBarTitle({ title: '宠友列表' }) 
    }
  
if(this.data.petType =="friends"){
  
  wx.request({
    url: urlStr,
    method: 'get',
    data: {
      user_id: this.data.uid || app.globalData.userInfo.data.data.user_id,
      page:1,
      goods_id:-(-this.data.goodid)
    }, success(res) {
      console.log(res.data)
      that.setData({
        petList: res.data.data
      })
    },
  })
}else{
 
  wx.request({
    url: urlStr,
    method: 'GET',
    data: {
      user_id: this.data.uid || app.globalData.userInfo.data.data.user_id,
    }, success(res) {
      console.log(res)
      that.setData({
        petList: res.data.data
      })
    },
  })
}
   
  },
  fansFocus(e) {//粉丝列表按钮
    let txt = e.currentTarget.dataset.txt
    if (txt =="取消关注"){
      this.unFocusOn(e)
    }else{
      let fid = e.currentTarget.dataset.id
      let followid = e.currentTarget.dataset.followid
      let usersid = e.currentTarget.dataset.usersid
      let that = this;
      wx.request({
        url: 'https://wechatapi.vipcsg.com/index/member/follow',
        method: 'POST',
        data: {
          user_id: app.globalData.userInfo.data.data.user_id,
          follow_id: fid||followid||usersid
        }, success(res) {
          if (res.data.result == 1) {
            //弹窗提示
            wx.showToast({
              title: '关注成功',
              icon: 'succes',
              duration: 1000,
              mask: true,
              success: function () {
                //按钮变黑
                that.getFriendList()
              }
            })
          }
        },
      })
    }
  },
  unFocusOn(e) {//取消关注
    console.log(1111)
    let fid = e.currentTarget.dataset.id
    let followid = e.currentTarget.dataset.followid
    let usersid = e.currentTarget.dataset.usersid
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/member/unfollow',
      method: 'POST',
      data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        follow_id: fid ||followid || usersid
      }, success(res) {
        if (res.data.result == 1) {


          //弹窗提示
          wx.showToast({
            title: '取消成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
            success: function () {
              //刷新列表
              that.getFriendList()
            }
          })
        }
      },
    })
  }
})