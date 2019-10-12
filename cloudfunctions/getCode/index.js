// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: wxContext.OPENID,
  })

  const codeUpload = await cloud.uploadFile({
    cloudPath:'code/'+Date.now()+'-'+Math.random()+'.png',
    fileContent:result.buffer
  })

  return codeUpload.fileID
}