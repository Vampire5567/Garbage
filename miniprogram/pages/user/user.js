// pages/user/user.js
const db = wx.cloud.database();
const user = db.collection("user");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    items: ["搜索历史", "答题历史", "清空缓存"],
    logined: false,
    nickName: null,
    avatarUrl: "../../images/avatar_default.png"
  },

  //页面加载时触发，加载完成后这个函数已经执行完
  //加载时应该判断用户有没有登陆过，登陆过就可以把登录信息显示上去
  onLoad: function() {
    var that = this;
    //获取登录状态
    try {
      var logined = wx.getStorageSync("logined");
      //如果已登录过
      if (logined) {
        //根据openId查询数据库取得用户信息
        try {
          var openId = wx.getStorageSync("openId");
          if (openId) {
            user
              .where({
                _openid: openId // 填入当前用户 openid
              })
              .get()
              .then(res => {
                console.log(res.data[0])
                that.setData({
                  logined: logined,
                  nickName: res.data[0].nickName,
                  avatarUrl: res.data[0].avatarUrl
                });
              });
          }
        } catch (e) {}
      }
    } catch(e){}
  },
  // 点击头像退出登录
  logout: function() {
    if (this.data.logined) {
      wx.showModal({
        content: "是否退出登录",
        showCancel: true,
        cancelText: "取消",
        cancelColor: "#000000",
        confirmText: "确定",
        confirmColor: "#3CC51F",
        success: result => {
          if (result.confirm) {
            this.setData({
              nickName: null,
              avatarUrl: "../../images/avatar_default.png",
              logined: false
            });
            wx.setStorage({
              key: "logined",
              data: this.data.logined
            });
          }
        }
      });
    }
  },

  // 点击登录按钮，获取用户信息
  getUserInfo: function(e) {
    console.log(e);
    var that = this;
    this.setData({
      nickName: e.detail.userInfo.nickName,
      avatarUrl: e.detail.userInfo.avatarUrl,
      logined: true
    });
    wx.setStorage({
      key: "logined",
      data: this.data.logined
    });

    try {
      var openId = wx.getStorageSync("openId");
      // console.log(openId)
      if (openId) {
        //根据openid查询数据库
        user
          .where({
            _openid: openId
          })
          .get({
            success(res) {
              console.log(res);
              //如果数据库没有这条记录
              console.log(res.data.length == 0);

              if (res.data.length == 0) {
                console.log(res);
                user.add({
                  // data 字段表示需新增的 JSON 数据
                  data: {
                    nickName: that.data.nickName,
                    avatarUrl: that.data.avatarUrl
                  }
                });
              }
            }
          });
      }
    } catch (e) {}
  },

  goToPages:function(){

  },

  
});
