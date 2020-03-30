var t = require("../../utils/module"),
  s = t(require("../../mainInfo.js")),
  n = require("../../tipInfo.js");
const QQMapWX = require('../../libs/qqmap-wx-jssdk.min')
// App（）注册一个程序，是小程序的入口方法
// app（）必须在app.js中注册，且只能注册一个
// 通过getApp（）获取app（）中的全局对象，可以进行全局变量和全局方法的使用
getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  data: {
    images: {
      magnifier: "/images/tab_bar_icon_magnifier.png",
      location: "/images/location.png",
      // broadcast: "/images/broadcast.png"
    },
    tipInfo: n.tipInfo,
    city: "shanghai",

  },

  // onLoad页面第一次加载时触发，从跳转页面返回时不能触发，可以传递参数
  // 小程序之onShow 会在onLoad 执行完以后执行。onShow 页面每次都刷新，onLoad 初次页面刷新
  onLoad: function (options) {
    this.initData()
    var myDate = new Date();
    //初始化时，城市选择框在2秒后自动弹出
    var isShowed = wx.getStorageSync("tip")
    if (isShowed != true) {
      setTimeout(() => {
        this.setData({
          showChooseCity: true,
        })
        wx.setStorageSync("tip", true)
      }, 2000)
    } else { }

  },

  // 初始化一些数据：将city的值存进storage，将mainInfo.js和tipInfo.js的数据导入，并将main.js中的城市信息做处理，赋值给cities数组
  initData: function () {
    // 将city的值暂存进storage
    // void 0 的作用的返回undefined
    void 0 === wx.getStorageSync("city") || 0 === wx.getStorageSync("city").length ? (wx.setStorageSync("city", this.data.city)) : this.setData({
      city: wx.getStorageSync("city")
    });
    // 将各城市的信息由对象{}转为数组[]
    var e = [];
    for (var a in s.default.cities) {
      e.push(s.default.cities[a]);
    }
    // console.log(e) 
    // console.log(n)  
    // console.log(s) 
    this.setData({
      tipInfo: n.tipInfo,
      config: s.default,
      cities: e
    });
  },

  onShow: function () {
    // this.setData({
    //   tipInfo: n.tipInfo
    // })
    // 将city的值从storage读取赋值到本地this.data.city(同步city的值)
    wx.getStorageSync("city") !== this.data.city && this.setData({
      city: wx.getStorageSync("city"),
    });
  },

  // 点击搜索框，跳转到文字搜索页面
  startSearch: function (t) {
    wx.navigateTo({
      url: "../ai/search"
    });
  },

  // 在城市选择框中选择城市
  //view层选择的城市名称传到逻辑层接收
  chooseCity: function (t) {
    var e = t.currentTarget? t.currentTarget.dataset.itemKey: t;
    e !== this.data.city && (wx.setStorageSync("city", e),
      this.setData({
        city: e,
        showChooseCity: false,
      })
    );
  },

  //点击灰色蒙版，关闭城市选择框
  closeOverlay: function () {
    this.setData({
      showChooseCity: false,
    });
  },

  // 点击显示城市选择框
  showChooseCity: function () {
    this.setData({
      showChooseCity: true,
    });
  },

  // 点击广播条切换到答题exam页面
  switchToTest: function () {
    wx.switchTab({
      url: "../../pages/exam/exam"
    });
  },

  // 开启摄像头权限，进入拍照页面
  onBindCamera: function () {
    wx.getSetting({
      success(res) {
        // res是只会出现小程序已经向用户请求过的权限
        console.log(res);
        if (!res.authSetting['scope.camera']) {
          wx.authorize({
            scope: 'scope.camera',
            success() {
              // 用户已经同意小程序使用相机拍照功能，后续调用 wx.startRecord 接口不会弹窗询问
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

  // onAikefu: function () {
  //   wx.navigateTo({
  //     url: '/pages/android/qa',
  //   })
  // },
  autoLocation() {
    const that =  this
    wx.getLocation({
      type: 'gcj02 ',
      success(res) {
        const { latitude, longitude } = res;
        var qqmapsdk = new QQMapWX({
          key: 'KLUBZ-4AKLO-VA5W7-S34Y6-3GWI5-IXB3X'
        });
        qqmapsdk.reverseGeocoder({
          location: {
            latitude,
            longitude
          },
          success(res){
            if(res.status === 0){
              const locationCity = res.result.address_component.city;
              let key 
              const isValid  = that.data.cities.some(item => {
                if(locationCity.indexOf(item.name) !== -1){
                   key = item.key
                   return true
                }
              })
              if(isValid){
                  that.chooseCity(key);
              }else{
                wx.showToast({
                  title: '当前定位城市不在识别范围内,请手动选择',
                  icon:'none',
                  duration: 3000
                })
              }
            }else{
              wx.showToast({
                title: '客户端错误,请稍后试试',
                icon:'none',
                duration: 2000
              })
            }
              
          },
          fail(error){
            wx.showToast({
              title: '获取定位失败,请稍后尝试',
              icon:'none',
              duration: 2000
            })
          }
        })

      },
      fail(error) {
        wx.showToast({
          title: '用户授权失败',
          duration: 1000
        })
      }
    })
  },
  // 转发的卡片信息
  onShareAppMessage: function () {
    return {
      title: "智能垃圾分类",
      imageUrl: "../../images/no-result.png",
      path: "pages/ai/index"
    }
  }

})