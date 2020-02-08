var t = require("../../utils/module"),
  s = t(require("../../mainInfo.js")),
  n = require("../../tipInfo.js");

getApp();

Page({

  data: {
    SHOW_TOP: true,
    images: {
      magnifier: "/images/tab_bar_icon_magnifier.png",
      qrB: "/images/qr_b.png",
      wsgQr: "/images/zsm.jpg",
      location: "/images/location.png",
      broadcast: "/images/broadcast.png"
    },
    tipInfo: n.tipInfo,
    city: "shanghai",
    
  },

  onLoad: function (options) {
    this.initData(), wx.showShareMenu({
      withShareTicket: !0
    });

    var myDate = new Date();
    var isShowed = wx.getStorageSync("tip")
    if (isShowed != 1) {
      setTimeout(() => {
        this.setData({
          SHOW_TOP: false,
          showChooseCity: !0,
          enableScroll: !1
        })
        wx.setStorageSync("tip", 1)
      }, 2 * 1000)
    } else {
      this.setData({
        SHOW_TOP: false
      })
    }

    
  },

  initData: function () {
    void 0 === wx.getStorageSync("city") || 0 === wx.getStorageSync("city").length ? (wx.setStorageSync("city", this.data.city)) : this.setData({
      city: wx.getStorageSync("city")
    });
    var e = [];
    for (var a in s.default.cities) e.push(s.default.cities[a]);
    this.setData({
      tipInfo: n.tipInfo,
      config: s.default,
      cities: e
    });
  },
  onShow: function () {
    (this.setData({
      tipInfo: n.tipInfo
    }))

    wx.getStorageSync("city") !== this.data.city && this.setData({
      city: wx.getStorageSync("city"),
    });
    this.setFakeSearchLeft()
  },
  startSearch: function (t) {
    wx.navigateTo({
      url: "../ai/search"
    });
  },
  chooseCity: function (t) {
    var e = t.currentTarget.dataset.itemKey;
    e !== this.data.city && (wx.setStorageSync("city", e), this.setData({
      city: e,
      showChooseCity: !1,
      enableScroll: !0
    }), this.setFakeSearchLeft());
  },
  closeOverlay: function () {
    this.setData({
      showChooseCity: !1,
      enableScroll: !0
    });
  },
  showChooseCity: function () {
    this.setData({
      showChooseCity: !0,
      enableScroll: !1
    });
  },
  switchToTest: function () {
    wx.switchTab({
      url: "../../pages/exam/exam"
    });
  },
  setFakeSearchLeft: function () {
    var t = this;
    wx.createSelectorQuery().select("#currentCity").boundingClientRect(function (e) {
      t.setData({
        fakeSearchLeft: "left: calc(25rpx + 21rpx + " + e.width + "px);"
      });
    }).exec();
  },
  goSearch: function () {
    wx.navigateTo({
      url: 'search',
    })
  },
  onBindCamera: function () {
    wx.getSetting({
      success(res) {
        console.log(res);
        if (!res.authSetting['scope.camera']) {
          wx.authorize({
            scope: 'scope.camera',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.navigateTo({
                url: 'camera/camera',
              })
            },
            fail() {
              console.log("用户已拒绝摄像头授权");
              //如果拒绝，在这里进行再次获取授权的操作
              wx.showModal({
                content: '检测到您没打开摄像头权限，将无法进行智能识别，是否去设置打开？',
                confirmText: "确认",
                cancelText: "取消",
                success: function (res) {
                  console.log(res);
                  //点击“确认”时打开设置页面
                  if (res.confirm) {
                    console.log('用户点击确认')
                    wx.openSetting({
                      success: (res) => { }
                    })
                  } else {
                    console.log('用户点击取消')
                  }
                }
              });
            }
          })
        } else {
          wx.navigateTo({
            url: 'camera/camera',
          })
        }
      }
    })
  },
  onAikefu: function () {
    wx.navigateTo({
      url: '/pages/android/qa',
    })
  },
  onShareAppMessage: function () {
    return {
      title: "智能分类垃圾",
      imageUrl: "../../images/no-result.png",
      path: "pages/ai/index"
    }
  },
  showZsm: function (t) {
    wx.previewImage({
      current: "https://6465-debug-5c669b-1259717830.tcb.qcloud.la/zsm.jpg?sign=16e6fff2194f22a46e6c753fbba4abd8&t=1576561884",
      urls: ["https://6465-debug-5c669b-1259717830.tcb.qcloud.la/zsm.jpg?sign=16e6fff2194f22a46e6c753fbba4abd8&t=1576561884"],
    })
  }
})