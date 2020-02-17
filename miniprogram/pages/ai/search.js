const db = wx.cloud.database();
const _ = db.command;

var t = require('../../utils/module'),
  s = t(require('../../mainInfo.js'));
Page({
  data: {
    MAX_LIMIT: 20,
    page: 0,
    dataCount: 0,
    datas: [],
    searchTxt: '',
    logo: '',
    isSHow: false,
    isHasData: true,
    map: ['', 2, 3, 0, 1],
    city: 'shanghai',
    historyMode: false
  },

  onLoad: function(options) {
    
    this.setData({
      config: s.default,
      map: this.data.map,
      city: wx.getStorageSync('city'),
    });
    if(options.key){
      console.log(options);
      
      this.setData({
        searchTxt: options.key,
        page:0,
        datas:[],
        historyMode: true
      })
      this.onGetData();
   }
  },
  searchIcon: function(e) {
    this.data.searchTxt = e.detail.value;
    this.data.datas = [];
    this.data.page == 0;
    this.onGetData();
  },
  onGetData: function() {
    this.data.page = 0;
    wx.showLoading({
      title: '正在加载数据中.....',
    });
    var that = this;
    if (this.data.page == 0) {
      this.data.datas = [];
    }
    var datas = db
      .collection('product')
      .skip(this.data.page * this.data.MAX_LIMIT)
      .limit(this.data.MAX_LIMIT)
      .where({
        name: db.RegExp({
          regexp: that.data.searchTxt,
        }),
      })
      .get({
         async success(res) {
          wx.hideLoading();
          const logined = wx.getStorageSync('logined');
          const openId = wx.getStorageSync('openId');

          if (logined && !that.data.historyMode && that.data.page === 0) {
            try {
              const user = db.collection('user');
              const res = await user.where({
                _openid: openId,
              }).get()
              const userId = res.data[0]._id;
              user.doc(userId).update({
                data:{
                  searchHistory: _.unshift({
                    key: that.data.searchTxt,
                    date: Date.now()
                  })
                }
              })
              
            } catch (error) {
              console.log(error);
              
            }
          }

          that.data.page = that.data.page + 1;
          for (var i = 0; i < res.data.length; i++) {
            that.data.datas.push(res.data[i]);
          }
          that.setData({
            datas: that.data.datas,
            isHasData: true,
          });
          if (that.data.datas.length % that.data.MAX_LIMIT === 0 && that.data.page !== 0) {
            wx.showToast({
              title: '数据已经加载完',
              icon: 'none',
            });
            that.setData({
              isHasData: false,
            });
          }
        },
        fail: res => {
          wx.hideLoading();

          that.setData({
            isHasData: false,
          });

          wx.showToast({
            title: '数据加载失败',
            icon: 'none',
          });
        },
      });
  },
  onGoHome: function() {
    wx.switchTab({
      url: '/pages/ai/index',
    });
  },
  commit: function() {
    wx.navigateTo({
      url: '/pages/result/commit?keyword=' + this.data.searchTxt,
    });
  },
  onItemClick: function(event) {
    var index = event.currentTarget.dataset.index;
    var config = s.default;
    var logoImg =
      config.cats[config.cities[this.data.city].cats[this.data.map[index]]]
        .imageSrc;
    this.setData({
      logo: logoImg,
      isShow: !this.data.isShow,
    });
  },
  hideModal: function() {
    this.setData({
      isShow: !this.data.isShow,
    });
  },
  cancelSearch: function(t) {
    wx.navigateBack({
      delta: 1,
    });
  },
  onPullDownRefresh: function() {
    this.data.page = 0;
    this.data.datas = [];
    this.onGetData();
  },

  onReachBottom: function() {
    this.onGetData();
  },
});
