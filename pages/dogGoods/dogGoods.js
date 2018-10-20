//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    categoryMenu: null, //分类menu
    categoryDetailList: null, //分类详情
    menuId: null, //当前分类menuID
    pageNo: 1, //当前分类的页码
  },
  onLoad(options) {
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
          })
          //获取第一个菜单的数据
          that.getCategoryDetailList()
        }
      },
    })
  },
  getCategoryDetailList() { //获取分类商品详情
    let that = this;
    wx.request({
      url: 'https://wechatapi.vipcsg.com/index/goods/category_goods',
      method: 'GET',
      data: {
        category_id: that.data.menuId,
        pageNo: that.data.pageNo,
      },
      success(res) {
        if (res.data.result == 1) {
          that.setData({
            categoryDetailList: res.data.data
          })
          console.log("获取分类商品详情列表（" + that.data.menuId + "）：")
          console.log(that.data.categoryDetailList)
        }
      },
    })

  },
  chooseMenu(event) {
    console.log(event)
    this.setData({
      menuId: event.currentTarget.dataset.menuid,
      pageNo: 1,
    })
    //重新获取商品列表数据
    this.getCategoryDetailList()
  }
})