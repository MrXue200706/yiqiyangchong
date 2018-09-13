//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    integral: 0, //积分数
	integralList: null, //积分明细
  },
  onLoad(options){
	  this.setData({
		  integral: options.integral
	  });
  },
  calculate(){//计算积分可抵扣的钱
	  
  }
})