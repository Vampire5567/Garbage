const rq = require('request-promise')
// 
/**
 * 获取百度ai AccessToken
 * Access Token的获取一般都是Https请求，涉及到跨域问题一般的解决办法就是在后台写方法进行Http请求，将获取到的结果传递到前台页面。
 */
exports.main = async(event, context) => {
  let apiKey = '0bfafcba0d63469c929320f36b6589ef',
    grantType = 'client_credentials',
    secretKey = '62a7ed94ae87419db2eafb4fbdc27097',
    url = `https://aip.baidubce.com/oauth/2.0/token`

  return new Promise(async(resolve, reject) => {
    try {
      let data = await rq({
        method: 'POST',
        url,
        form: {
          "grant_type": grantType,
          "client_secret": secretKey,
          "client_id": apiKey
        },
        json: true
      })
      resolve({
        code: 0,
        data,
        info: '操作成功！'
      })
    } catch (error) {
      console.log(error)
      if (!error.code) reject(error)
      resolve(error)
    }
  })
}