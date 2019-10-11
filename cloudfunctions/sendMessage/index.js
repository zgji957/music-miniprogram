// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
// 评价模版信息推送
exports.main = async (event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()
  const result = await cloud.openapi.templateMessage.send({
    touser: OPENID,
    page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data: {
      keyword1: {
        value: event.content
      },
      keyword2: {
        value: event.nickName
      }
    },
    templateId: "wabPU1rgGxGeHHdDVMShlxV0f5PiajGrHSKRTNrbVkA",
    formId: event.formId
  })
  return result
}