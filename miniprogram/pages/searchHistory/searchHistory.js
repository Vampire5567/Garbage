// pages/searchHistory/searchHistory.js
const db = wx.cloud.database();
Page({
  data: {
    historyGroup: [],
    load: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    this.setData({
      load: true
    })
    wx.showLoading({
      title: '加载中...',
      mask: true,
    });
    let historyGroup = [];
    let historyGroupMap = {};
    let searchHistory;
    // 获取用户的搜索记录
    const openId = wx.getStorageSync('openId');
    try {
      const userDocs = await db.collection('user').where({
        _openid: openId,
      }).get();
       searchHistory = userDocs.data[0].searchHistory;
       
       
    } catch (error) {}
    // 将搜索记录按日期作为key,转化为对象结构,方便处理
    wx.hideLoading();
    if (searchHistory.length > 0) {
      searchHistory.forEach(item => {
        const itemDate = new Date(item.date);
        const year = itemDate.getFullYear();
        const month = itemDate.getMonth() + 1;
        const date = itemDate.getDate();
        const dateString = `${year}年${month}月${date}日`;
        if (historyGroupMap[dateString]) {
          historyGroupMap[dateString].push(item.key);
        } else {
          historyGroupMap[dateString] = [item.key];
        }
      });
    }
    
    // 将对象结构的搜索记录,转化为数组结构
    for (const key in historyGroupMap) {
      if (historyGroupMap.hasOwnProperty(key)) {
        const list = historyGroupMap[key];
        historyGroup.push({
          date: key,
          list,
        });
      }
    }
    this.setData({
      load: false
    })
    this.setData({
      historyGroup,
    });
  },
  onShow(){
    this.onLoad()
  },
  navigate(event){
    console.log(event);
    
    const key = event.currentTarget.dataset.key;
    wx.navigateTo({
      url: `/pages/ai/search?key=${key}`,
    });
  }
});
