const app = getApp();
import s  from '../../../mainInfo'

/**
 * @method getOtherResult
 * @description 获取其他相似结果
 * @param {Array} searchResult 
 * @param {String} existedName 
 * @param {Number} otherNum 
 * @returns Array
 */
const getOtherResult = (searchResult, existedName, otherNum) => {
  let existedNameIndex
  let otherList = []
  const filterList = searchResult.filter((item, index) => {
    if (item.name === existedName) {
      existedNameIndex = index
      return false
    }
    return true
  });
  const len = filterList.length;
  if (len <= otherNum) return filterList
  if (len >= otherNum + existedNameIndex) {
    otherList = filterList.slice(existedNameIndex, existedNameIndex + otherNum);
  } else {
    otherList = filterList.slice(len - otherNum, len)
  }
  return otherList
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    categary: {},
    city:'',
    resultList:[],
    map: ["", 2, 3, 0, 1],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    

    const { city, index, name } = options;
    const category = s.cats[s.cities[city].cats[this.data.map[index]]];
    
    const { searchResult } = app.globalData;
    console.log(searchResult);
    
    const resultList= getOtherResult(searchResult,name,10)
    this.setData({
      name,
      category,
      resultList,
      city
    })


  },
  redirectOther(e){
    const index = e.currentTarget.dataset['index'];
    const {name,sortId} = this.data.resultList[index]
    wx.redirectTo({
      url: `/pages/ai/searchResult/searchResult?name=${name}&index=${sortId}&city=${this.data.city}`
    })
  }
  
})