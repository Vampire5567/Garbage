// pages/exam/paper/paper.js
const rubishData = require('../../../rubish_data.js');
const utils = require('../../../utils/util.js');
const db = wx.cloud.database();
const _ = db.command;


function c(c){
  let cname ='';
  if (c == '1') {
    cname = '湿垃圾';
  } else if (c == '2') {
    cname = '干垃圾';
  } else if (c == '3') {
    cname = '可回收物';
  } else if (c == '4') {
    cname = '有害垃圾';
  } else {
    cname = '未知';
  }
  return cname;
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    num: 1,
    question: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    answer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  preSteps() {
    this.setData({
      num: this.data.num === 1 ? 1 : this.data.num - 1,
    });
  },
  async nextSteps() {
    let max = this.data.question.length;
    if (this.data.num >= max) {
      let question = this.data.question;
      let answer = this.data.answer;
      let cateItems = [];
      let score = 0;
      for (let i = 0; i < question.length; i++) {
        let que = {};
        que.name = question[i].n;
        que.cname = c(question[i].c);
        que.aname = c(answer[i]);
        que.color = 'red';
        if (que.cname == que.aname) {
          que.color = 'green';
          score += 10;
        }
        cateItems.push(que);
      }
      wx.setStorageSync('cateItems', cateItems);
      wx.setStorageSync('score', score);
      const logined = wx.getStorageSync('logined');
      const openId = wx.getStorageSync('openId');

      if (logined) {
        try {
          const user = db.collection('user');
          const res = await user.where({
            _openid: openId,
          }).get()
          const userId = res.data[0]._id;
          user.doc(userId).update({
            data:{
              examHistory: _.unshift({
                cateItems,
                score,
                name:cateItems[0].name+'...'+cateItems.pop().name,
                date: Date.now()
              })
            }
          })
          
        } catch (error) {
          console.log(error);
          
        }
      }
      wx.navigateTo({
        url: '../result/result',
      });
    }
    this.setData({
      num: this.data.num + 1,
    });
  },
  radioChange(e) {
    let index = e.target.dataset.index;
    let value = e.detail.value;
    let answer = this.data.answer;
    answer[index] = value;
    this.setData({
      answer: answer,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let array1 = rubishData.result.data[1];
    let array2 = rubishData.result.data[2];
    let array3 = rubishData.result.data[3];
    let array4 = rubishData.result.data[4];
    let array = array1.concat(array2, array3, array4);
    this.setData({
      question: utils.randomArray(array, 10),
    });
  },
});
