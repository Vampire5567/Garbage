// pages/examHistory/examHistory.js
const db = wx.cloud.database();
Page({
  data: {
    historyGroup: [],
    load:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    let historyGroup = [];
    let historyGroupMap = {};
    let examHistory;
    this.setData({
      load: true
    })
    // 获取用户的搜索记录
    const openId = wx.getStorageSync('openId');
    try {
      const userDocs = await db
        .collection('user')
        .where({
          _openid: openId,
        })
        .get();
      examHistory = userDocs.data[0].examHistory;
    } catch (error) {}
   
    // 将搜索记录按日期作为key,转化为对象结构,方便处理
    if (examHistory.length > 0) {
      examHistory.forEach(item => {
        const itemDate = new Date(item.date);
        const year = itemDate.getFullYear();
        const month = itemDate.getMonth() + 1;
        const date = itemDate.getDate();
        const dateString = `${year}年${month}月${date}日`;
        if (historyGroupMap[dateString]) {
          historyGroupMap[dateString].push(item);
        } else {
          historyGroupMap[dateString] = [item];
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
  onShow() {
    this.onLoad();
  },
  navigate(event) {
    const data = event.currentTarget.dataset.data;
    wx.setStorageSync('cateItems', data.cateItems);
    wx.setStorageSync('score', data.score);
    wx.navigateTo({
      url: '/pages/exam/result/result?historyMode=yes',
    });
  },
});
