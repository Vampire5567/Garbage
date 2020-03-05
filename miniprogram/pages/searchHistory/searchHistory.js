const db = wx.cloud.database();
Page({
  data: {
    historyGroup: [], 
    load: false  //是否加载
  },


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
       console.log(searchHistory)
    } catch (error) {}
    // 将搜索记录按日期作为key,转化为对象结构,方便处理
    wx.hideLoading();
    // 有搜索记录的情况
    if (searchHistory.length > 0) {
      searchHistory.forEach(item => {
        console.log(item)
        const itemDate = new Date(item.date);
        const year = itemDate.getFullYear();
        const month = itemDate.getMonth() + 1;
        const date = itemDate.getDate();
        const dateString = `${year}年${month}月${date}日`;
        // 如果时间相同，就以时间为key，搜索的关键字数组为key的值
        if (historyGroupMap[dateString]) {
          historyGroupMap[dateString].push(item.key);
        } else {
          historyGroupMap[dateString] = [item.key];
        }
      });
      console.log(historyGroupMap)
    }
    
    // 将对象结构的搜索记录,转化为数组结构，方便在页面显示出来
    for (const key in historyGroupMap) {
      if (historyGroupMap.hasOwnProperty(key)) {
        // list是关键字数组
        const list = historyGroupMap[key];
        console.log(list)
        historyGroup.push({
          date: key,
          list: list
        });
        console.log(historyGroup);     
      }
    } 
    this.setData({
      historyGroup:historyGroup
    });
    this.setData({
      load: false
    })
  },

  //每次进入此页面，都要重新加载

  // 点击搜索记录的关键字，携带key值进入search页面
  //key的值要由前台view层通过data-xxx的形式传入逻辑层
  navigate(event){
    console.log(event);
    const key = event.currentTarget.dataset.key;
    wx.navigateTo({
      url: `/pages/ai/search?keyword=${key}&historyMode=true`,
    });
  }
});
