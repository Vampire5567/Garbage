const app = getApp();
Page({
  data: {
    ColorList: [
      "../../images/RecycleableWaste.jpg",
      "../../images/HazardouAwaste.jpg",
      "../../images/HouseholdfoodWaste.jpg",
      "../../images/ResidualWaste.png",
    ]
  },
  goSearch: function () {
    wx.navigateTo({
      url: '/pages/ai/search',
    })
  },
  onClick:function(e){
    console.log(JSON.stringify(e))
    var index = e.currentTarget.dataset.index
    var indexClick=0;
    switch (index){
      case 0:
      indexClick=1
      break;
       case 1:
        indexClick = 2
      break;
      case 2:
        indexClick = 3
        break;
      case 3:
        indexClick = 4
        break;
    }
    wx.navigateTo({
      url: '/pages/ai/filter/filter?type=' + indexClick,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "智能分类垃圾",
      imageUrl: "https://6465-debug-5c669b-1259717830.tcb.qcloud.la/share.png?sign=2ec95a7fa286225f6df67ad718c214aa&t=1565925671",
      path: "pages/sort/sort"
    }
  },
})