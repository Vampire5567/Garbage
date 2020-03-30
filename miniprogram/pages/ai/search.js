const db = wx.cloud.database();
const _ = db.command;
const app = getApp();

var t = require("../../utils/module"),
  s = t(require("../../mainInfo.js"));
Page({
  data: {
    MAX_LIMIT: 20, //返回数据的最大个数
    page: 0, //设置上拉加载的第几次，默认为0
    dataCount: 0,
    datas: [], //放置返回数据的数组
    searchTxt: "", //搜索的完整关键字
    logo: "",
    isSHow: false, //判断垃圾分类图标是否显示在顶层
    isHasData: true,
    map: ["", 2, 3, 0, 1],
    city: "shanghai",
    historyMode: false //用来标记用户是从哪里进入的,从搜索记录进入为true
  },

  onLoad: function (options) {
    this.setData({
      config: s.default,
      map: this.data.map,
      city: wx.getStorageSync("city")
    });
    // 从搜索记录和拍照页进入为search页面
    if (options.keyword) {
      this.setData({
        searchTxt: options.keyword,
        page: 0,
        datas: [],
      });
      if (options.historyMode === 'true') {
        this.setData({
          historyMode: true
        });
      }
      this.onGetData();
    }
  },

  // bindconfirm绑定的事件，在点击完成按钮时触发，从view层传入'完整的关键字e'给逻辑层
  //searchIcon：搜索包含关键字的垃圾名称，显示在页面上
  searchIcon: function (e) {
    // console.log(e)
    this.setData({
      searchTxt: e.detail.value,
      datas: [],
      page: 0,
      isHasData: true
    })
    this.onGetData();
  },

  //获取包含关键字的垃圾名称
  onGetData: function () {

    if (!this.data.isHasData) return

    wx.showLoading({
      title: "正在加载数据中....."
    });
    var that = this;

    // 首次请求时，datas置空
    if (this.data.page == 0) {
      this.data.datas = [];
    }

       db
      .collection("product")
      .skip(this.data.page * this.data.MAX_LIMIT)
      .limit(this.data.MAX_LIMIT)
      .where({
        name: db.RegExp({
          regexp: that.data.searchTxt
        })
      })
      .get({
        async success(res) {
          wx.hideLoading();
          console.log(res);
          //将搜索关键字上传到用户的搜索记录中，关键字+时间
          const logined = wx.getStorageSync("logined");
          const openId = wx.getStorageSync("openId");
          // 按下搜索、下拉刷新、上拉刷新都会进行数据请求，即执行onGetData（），page等于0时（即按下搜索，第一次进行数据请求），会将搜索关键字上传到搜索历史中
          if (logined && !that.data.historyMode && that.data.page === 0) {
            try {
              const key = that.data.searchTxt
              that.saveSearchHistory(openId, key)
            } catch (error) {
              console.log(error);
            }
          }
          // 将搜索的包含关键字的结果存入datas数组
          const data = res.data
          console.log(that.data.datas)

          if (data.length === 0 && that.data.page === 0) {
            that.setData({
              isHasData: false
            });
            return
          }
          if (data.length < that.data.MAX_LIMIT && that.data.page > 0) {
            wx.showToast({
              title: "数据已经加载完",
              icon: "none"
            });

          }
          const datas = that.data.datas.concat(data)
          that.setData({
            datas: datas,
            isHasData: true,
            page: that.data.page + 1
          });
          app.globalData.searchResult = datas
          
        },
        fail: res => {
          wx.hideLoading();
          that.setData({
            isHasData: false
          });
          wx.showToast({
            title: "数据加载失败",
            icon: "none"
          });
        }
      });
  },
  onGoHome: function () {
    wx.switchTab({
      url: "/pages/ai/index"
    });
  },
  onItemClick: function (event) {
    const {index,name} = event.currentTarget.dataset;
    wx.navigateTo({
      url:`/pages/ai/searchResult/searchResult?name=${name}&index=${index}&city=${this.data.city}`
    })
  },
  hideModal: function () {
    this.setData({
      isShow: !this.data.isShow
    });
  },
  cancelSearch: function (t) {
    wx.navigateBack({
      delta: 1
    });
  },
  // 上拉刷新，重新请求
  onPullDownRefresh: function () {
    this.data.page = 0;
    this.data.datas = [];
    this.onGetData();
  },
  // 下拉加载更多
  onReachBottom: function () {
    this.onGetData();
  },
  // 保存搜索记录
  async saveSearchHistory(openId, key) {
    const user = db.collection("user");
    const res = await user
      .where({
        _openid: openId
      })
      .get();
    const userId = res.data[0]._id;

    // const searchHistory = res.data[0].searchHistory;
    user.doc(userId).update({
      data: {
        searchHistory: _.unshift({
          key,
          date: Date.now()
        })
      }
    });
  }
});
