//app.js
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'study-qrgq5',
        traceUser: true,
      })
    };

    try {
      var openId = wx.getStorageSync('openId')
      if (openId) {
        console.log(openId);      
      }
    } catch (e) {
      //获取openId，存入storage
      wx.cloud.callFunction({
        name: 'getOpenId',     
      }).then( res => {
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
    updateManager.onCheckForUpdate(function(res) {
      console.log(res.hasUpdate)
      if (res.hasUpdate) {
        updateManager.onUpdateReady(function() {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function(res) {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
    updateManager.onUpdateFailed(function() {
      // 新版本下载失败
    })
    wx.getStorage({
      key: 'logined',
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },
  globalData: {
    userInfo: null
  }
})