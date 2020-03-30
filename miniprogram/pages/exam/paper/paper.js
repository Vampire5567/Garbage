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
   nextSteps() {
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
        const userId = wx.getStorageSync('userId');
        const dateStamp = Date.now()
        const examDetail = {
          cateItems,
          score,
          name: cateItems[0].name + "..." + cateItems.pop().name,
          date: dateStamp
        }
        this.updateToUser(userId,examDetail);
        if(score === 10){
          this.updateToFullscore(openId,dateStamp);
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
  // 答题满分时记录到满分数据库中
  // 第一次新增记录,多次则更新记录
  async updateToFullscore(openId,dateStamp){
       try {
         const fullScoreTop = db.collection('fullScoreTop');
         const res = await fullScoreTop.where({
            _openid: openId
         }).get();
          
         const fullScoreTopData = res.data[0];
         if(fullScoreTopData){
          const updateRes = await fullScoreTop.doc(fullScoreTopData._id).update({
            data:{
              count: _.inc(1),
              dateStampArr:_.push(dateStamp)
           }
          })
          updateRes && updateRes.stats.updated !== 1 && console.log(updateRes.errMsg)
         }else{
          fullScoreTop.add({
            data:{
              count: 1,
              dateStampArr:[dateStamp]
            }
          })
         }
       } catch (error) {
          console.log(error);
       }
  },
  // 答题记录到添加到用户数据库中
  async updateToUser(userId,examDetail){
    try {
      const user = db.collection("user");
      console.log(userId)
      const updateRes = await  user.doc(userId).update({
        data: {
          examHistory: _.unshift(examDetail)
        }
      });
      updateRes && updateRes.stats.updated !== 1 && console.log(updateRes.errMsg)
    } catch (error) {
      console.log(error);
    }
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
