// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();
const topScoreCo = cloud.database().collection("fullScoreTop");
const userCo = cloud.database().collection("user");
// 云函数入口函数
exports.main = async (event, context) => {
  const topRes = await topScoreCo
    .orderBy("count", "desc")
    .limit(10)
    .get();
  const topListRaw = topRes.data;
  const userPromise = [];
  topListRaw.forEach(item => {
    userPromise.push(
      userCo
        .where({
          _openid: item._openid
        })
        .get()
    );
  });
  const userPromiseRes = await Promise.all(userPromise);
  const topList = topListRaw.map((item, idx) => {
    const latelyDate = new Date(item.dateStampArr.pop());
    const lastUpdated = `${latelyDate.getFullYear()}/${
      latelyDate.getMonth() + 1 > 10
        ? latelyDate.getMonth() + 1
        : `0${latelyDate.getMonth()+1}`
    }/${
      latelyDate.getDate() + 1 > 10
        ? latelyDate.getDate() + 1
        : `0${latelyDate.getDate()+1}`
    }`;
    return {
      id: item._id,
      count: item.count,
      nickName: userPromiseRes[idx].data[0].nickName,
      avatarUrl: userPromiseRes[idx].data[0].avatarUrl,
      lastUpdated
    };
  });

  return topList;
};
