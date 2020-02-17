
Page({
  data: {
    cateItems:[],
    score:0,
    historyMode: false
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    if(options.historyMode){
      this.setData({
        historyMode: true,
      });
    }
    let cateItems = wx.getStorageSync("cateItems");
    let score = wx.getStorageSync("score");
    this.setData({
      cateItems: cateItems,
      score:score
    });
  },
  onUnload: function () {
    if(this.data.historyMode) return
    wx.navigateBack({
      url: '../../exam/exam'
    })
  },
  onShareAppMessage: function (ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    return {
      title: '垃圾分类怎么办',
      path: '/pages/index/index?id=share',
      success: function (res) {
        // 转发成功
        console.log(res);
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }   
})

function c(c){
  let cname ='';
  if (c == '1') {
    cname = '湿垃圾';
  } else if (c == '2') {
    cname = '干垃圾';
  } else if (c == '3') {
    cname = '可回收物';
  } else if (c == '4') {
    cname = '有害垃圾';
  } else {
    cname = '未知';
  }
  return cname;
}