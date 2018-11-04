//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    searchHistort:[],
    hotsearch:[],
    searchres:"",
    categoryMenu: null, //分类menu
    categoryDetailList: [], //分类详情列表
    menuId: null, //当前分类menuID
    orderBy:1, //默认综合排行
    pageNo: 1, //当前分类的页码
    searchHistoryBl:true,
    clickItem:false,
    searchMes:""
  },
  onShow(){
  

  },
  onHide(){

  },
  onLoad(options){
    this.getsearch();
    //this.searchSubmit(params)

    switch (options.category_id) {
      case "1": //狗狗
        wx.setNavigationBarTitle({
          title: '狗狗'
        })
        break;
      case "2": //猫猫
        wx.setNavigationBarTitle({
          title: '猫猫'
        })
        break;
      case "3": //小宠
        wx.setNavigationBarTitle({
          title: '小宠'
        })
        break;
      case "4": //周边
        wx.setNavigationBarTitle({
          title: '周边'
        })
        break;
      default:
        return
        break;
    }
    this.getCategoryMenu(options.category_id)
    
  },
  //获取历史
  getsearch(params) {
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/search/index',
      method: 'GET',
      data: {
      user_id: app.globalData.userInfo.data.data.user_id
      }, success(res) {
        if (res.data.result==1){
          console.log(res.data.data.member_keys)
        that.setData({
        searchHistort: res.data.data.member_keys,//历史记录
        hotsearch:res.data.data.system_keys//热门

        })
      }
      },
    })
    
  },

  //收索结果
  searchSubmit(e){
    console.log(e);
    let params=e.currentTarget.dataset.id;
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/search',
      method: 'GET',
      data: {
      user_id: app.globalData.userInfo.data.data.user_id,
      goods_name: params,
      order: '1',
      }, success(res) {
        if (res.data.result==1){
        that.setData({
          searchres: res.data.data,
          searchHistoryBl:false,
          clickItem:true
        })
      }
      },
    })  
  },
  getCategoryMenu(category_id) { //获取分类菜单
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/category',
      method: 'GET',
      data: {
        category_id: category_id
      },
      success(res) {
        if (res.data.result == 1) {
          that.setData({
            categoryMenu: res.data.data,
            menuId: res.data.data[0].id, //默认第一个菜单No
            orderBy: 1,
          })
          //获取第一个菜单的数据
          that.getCategoryDetailList()
        }
      },
    })
  },
  getCategoryDetailList() { //获取分类商品详情
    let that = this;
    let oldArray = this.data.categoryDetailList
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/category_goods',
      method: 'GET',
      data: {
        category_id: that.data.menuId,
        order: that.data.orderBy,
        pageNo: that.data.pageNo,
      },
      success(res) {
        if (res.data.result == 1) {
          that.setData({
            categoryDetailList: oldArray.concat(res.data.data)
          })
          console.log("获取分类商品详情列表（" + that.data.menuId + "）：")
          console.log(that.data.categoryDetailList)
        }
      },
    })

  },
  getInputval: function (e) {
    let seach = e.detail.value;
    let that=this;
    if(seach){
      wx.request({
        url: 'https://wechatapi.vipcsg.com/index/goods/search',
        method: 'GET',
        data: {
        user_id: app.globalData.userInfo.data.data.user_id,
        goods_name: seach,
        order: '1',
        }, success(res) {
          if (res.data.result==1){
          that.setData({
            searchres: res.data.data,
            searchHistoryBl:false,
            clickItem:true
          })
        }
        },
      })  
    }
  },
  chooseMenu(event) {//切换菜单
    this.setData({
      menuId: event.currentTarget.dataset.menuid,
      pageNo: 1,
      categoryDetailList: [],
      orderBy: 1
    })
    this.getCategoryDetailList()
  },
  orderByBtn(event) {//排序方式
    console.log("排序方式：" + event.currentTarget.dataset.ordernum)
    this.setData({
      categoryDetailList: [],
      pageNo: 1,
      orderBy: event.currentTarget.dataset.ordernum
    })
    this.getCategoryDetailList()
  },
  onReachBottom: function () { // 下拉底部刷新
    let that = this
    this.setData({
      pageNo: that.data.pageNo + 1
    })

    console.log('--------下拉底部刷新-------')
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    
    this.getCategoryDetailList();

    // 隐藏导航栏加载框
    wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();
  },
})