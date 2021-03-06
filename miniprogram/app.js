//app.js
App({
  //onlaunch监听小程序初始化，全局只触发一次
  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'study-qrgq5',
        traceUser: true,
      })
    };
      
      // getStorage api  移除try catch   改用if语句
      // try catch  获取storage出错情况不包括 openid该值不存在的情况,不存在会返回空字符串
      // 调用云函数getOpenId，取得openId的值存储在storage
      var openId = wx.getStorageSync('openId')
    
      if (openId) {
        console.log(openId);
      } else {
        //获取openId，存入storage
        wx.cloud.callFunction({
          name: 'getOpenId',
        }).then(res => {
          // console.log(res.result.event.userInfo.openId);
          wx.setStorage({
            key: "openId",
            data: res.result.event.userInfo.openId
          });
        })
      }


    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
            }
          });
        }
      }
    });
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      console.log(res.hasUpdate)
      if (res.hasUpdate) {
        updateManager.onUpdateReady(function () {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })

    // 将登陆状态logined存储到storage
    wx.getStorage({
      key: 'logined',
      success: (result) => { },
      fail: () => { },
      complete: () => { }
    });
  },
  globalData: {
    userInfo: null,
    searchResult:[]
  }
})