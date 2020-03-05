var md5 = require("../../../utils/md5.js");
var http = require("../../../utils/http.js");
var util = require("../../../utils/util.js");


//1、根据apikey和secret key调用云函数获取accessToken（令牌）
//2、根据accessToken和图片向百度的api中心获取图片ai识别结果
Page({
  data: {
    accessToken: "",
    isShow: false,
    results: [],
    src: "",
    isCamera: true,
    btnTxt: "拍照"
  },

  //初始化取得accessToken的值，超过一个月就要重新获取（因为会过期）
  onLoad() {
    this.ctx = wx.createCameraContext(); //创建 camera 上下文 CameraContext 对象
    var time = wx.getStorageSync("time");
    var curTime = new Date().getTime(); //返回距 1970 年 1 月 1 日之间的毫秒数
    var timeNum = new Date(parseInt(curTime - time) * 1000).getDay(); //返回从获取到access_token到现在的天数，方便判断access_token是否过期
    console.log("===timeNum===" + timeNum);
    var accessToken = wx.getStorageSync("access_token");
    console.log("===accessToken===" + accessToken);
    if (timeNum > 28 || accessToken == "" || accessToken == null || accessToken == undefined) {
      this.accessTokenFunc();
    } else {
      this.setData({
        accessToken: wx.getStorageSync("access_token")
      });
    }
  },

  //点击拍照
  takePhoto() {
    var that = this;
    if (this.data.isCamera == false) {
      this.setData({
        isCamera: true,
        btnTxt: "拍照"
      });
      return;
    }
    this.ctx.takePhoto({
      quality: "high",
      success: res => {
        console.log(res);
        this.setData({
          src: res.tempImagePath,
          isCamera: false,
          btnTxt: "重拍"
        });
        wx.showLoading({
          title: "正在加载中"
        });
        //读取本地文件内容
        wx.getFileSystemManager().readFile({
          filePath: res.tempImagePath,
          encoding: "base64",
          success: res => {
            that.req(that.data.accessToken, res.data);
          },
          fail: res => {
            wx.hideLoading();
            wx.showToast({
              title: "拍照失败,未获取相机权限或其他原因",
              icon: "none"
            });
          }
        });
      }
    });
  },

  // 根据accessToken和照片请求，请求图片上包含的信息，一些关键字
  req: function(token, image) {
    var that = this;
    http.req(
      "https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general?access_token=" +
        token,
      {
        image: image
      },
      //请求成功回调函数
      function(res) {
        wx.hideLoading();
        console.log(JSON.stringify(res));
        var num = res.result_num; //结果的个数
        var results = res.data.result;//结果
        if (results != undefined && results != null) {
          that.setData({
            isShow: true,
            results: results
          });
          console.log(results);
        } else {
          wx.showToast({
            icon: "none",
            title: "AI识别失败,请联系管理员"
          });
        }
      },
      "POST"
    );
  },

  //获取accessToken的值
  accessTokenFunc: function() {
    var that = this;
    console.log("accessTokenFunc is start");
    // 调用云函数，获取accessToken的值 and 获取当下的时间，并且存进storage
    wx.cloud.callFunction({
      name: "baiduAccessToken",
      success: res => {
        console.log("====" + JSON.stringify(res));
        console.log("====" + JSON.stringify(res.result.data.access_token));
        that.data.accessToken = res.result.data.access_token;
        wx.setStorageSync("access_token", res.result.data.access_token);
        wx.setStorageSync("time", new Date().getTime());
      },
      fail: err => {
        wx.showToast({
          icon: "none",
          title: "调用失败"
        });
        console.error("[云函数] [sum] 调用失败：", err);
      }
    });
  },

  chooseKeyword:function(e){
    console.log(e.currentTarget.dataset.keyword)
    wx.navigateTo({
      url: "/pages/ai/search?keyword=" + e.currentTarget.dataset.keyword
    });
  },

  hideModal: function() {
    this.setData({
      isShow: false
    });
  },

  error(e) {
    console.log(e.detail);
  }
});
