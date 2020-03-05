const rubishData = require("../../../rubish_data.js");
const utils = require("../../../utils/util.js");
const db = wx.cloud.database();
const _ = db.command;

function c(c) {
  let cname = "";
  if (c == "1") {
    cname = "湿垃圾";
  } else if (c == "2") {
    cname = "干垃圾";
  } else if (c == "3") {
    cname = "可回收物";
  } else if (c == "4") {
    cname = "有害垃圾";
  } else {
    cname = "未知";
  }
  return cname;
}
Page({
  data: {
    num: 1, //用来记录题的顺序
    question: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}], //问题
    answer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //答案
  },

  onLoad: function() {
    let array1 = rubishData.result.data[1];
    let array2 = rubishData.result.data[2];
    let array3 = rubishData.result.data[3];
    let array4 = rubishData.result.data[4];
    let array = array1.concat(array2, array3, array4);
    // 获取一个随机题目数组，并赋值给question
    this.setData({
      question: utils.randomArray(array, 10)
    });
    console.log(this.data.question);
  },

  //点击上一题
  preSteps() {
    this.setData({
      num: this.data.num === 1 ? 1 : this.data.num - 1
    });
  },

  //点击下一题
  async nextSteps() {
    let max = this.data.question.length;
    //在最后一题进行统计
    if (this.data.num >= max) {
      let question = this.data.question;
      let answer = this.data.answer;
      let cateItems = [];
      let score = 0;
      for (let i = 0; i < question.length; i++) {
        let que = {};
        que.name = question[i].n; //垃圾名称（题目）
        que.cname = c(question[i].c); //垃圾种类（正确答案）
        que.aname = c(answer[i]); //我的答案
        que.color = "red";
        if (que.cname == que.aname) {
          que.color = "green";
          score += 10;
        }
        cateItems.push(que);
      }
      console.log(cateItems);
      wx.setStorageSync("cateItems", cateItems);
      wx.setStorageSync("score", score);

      const logined = wx.getStorageSync("logined");
      const openId = wx.getStorageSync("openId");
      if (logined) {
        try {
          const user = db.collection("user");
          const res = await user
            .where({
              _openid: openId
            })
            .get();
          const userId = res.data[0]._id;
          user.doc(userId).update({
            data: {
              examHistory: _.unshift({
                cateItems,
                score,
                name: cateItems[0].name + "..." + cateItems.pop().name,
                date: Date.now()
              })
            }
          });
        } catch (error) {
          console.log(error);
        }
      }
      wx.navigateTo({
        url: "../result/result"
      });
    }
    this.setData({
      num: this.data.num < 10 ? this.data.num + 1 : 10
    });
  },

  radioChange(e) {
    console.log(e)
    let index = e.target.dataset.index; //第index+1题
    let value = e.detail.value; //选中的答案
    let answer = this.data.answer; //
    answer[index] = value; //选中的答案存入answer数组
    this.setData({
      answer: answer
    });
  }
});
