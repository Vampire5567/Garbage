// pages/exam/paper/paper.js
const rubishData = require('../../../rubish_data.js');
const utils = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: 1,
    question:[{},{},{},{},{},{},{},{},{},{}],
    answer:[0,0,0,0,0,0,0,0,0,0]
  },
  preSteps() {
    this.setData({
      num: this.data.num === 1 ? 1 : this.data.num - 1
    })
  },
  nextSteps() {
    let max = this.data.question.length
    if (this.data.num >= max) {
      let question = JSON.stringify(this.data.question);
      let answer = JSON.stringify(this.data.answer);
      wx.setStorageSync('question', question);
      wx.setStorageSync('answer', answer);
      wx.navigateTo({
        url: '../result/result'
      });
    }
    this.setData({
      num: this.data.num + 1
    })
  },
  radioChange(e){
    let index = e.target.dataset.index;
    let value = e.detail.value;
    let answer = this.data.answer;
    answer[index] = value;
    this.setData({
      answer: answer
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let array1 = rubishData.result.data[1];
    let array2 = rubishData.result.data[2];
    let array3 = rubishData.result.data[3];
    let array4 = rubishData.result.data[4];
    let array = array1.concat(array2, array3, array4);
    this.setData({
      question: utils.randomArray(array, 10)
    });
  }
})
