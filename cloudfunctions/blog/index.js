// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')

const db = cloud.database()
const blogCollection = db.collection('blog')
const blogCommentCollection = db.collection('blog-comment')

const MAX_LIMIT = 10

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event })

  // blog list
  app.router('list', async (ctx, next) => {
    const keyword = event.keyword
    let obj = {}
    if (keyword.trim() != '') {
      obj = {
        content: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      }
    }

    let blogList = await blogCollection.where(obj).skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => {
        return res.data
      })

    ctx.body = blogList
  })

  // blog detail
  app.router('detail', async (ctx, next) => {
    const { blogId } = event
    // blog详情
    const detail = await blogCollection.where({
      _id: blogId
    }).get().then((res) => {
      return res.data
    })
    // 通过blog详情的id，查询相关评论
    const total = (await blogCommentCollection.count()).total
    let commentList = {
      data: []
    }
    if (total > 0) {
      const searchTimes = Math.ceil(total / MAX_LIMIT)
      let promiseList = []
      for (let i = 0; i < searchTimes; i++) {
        let promise = blogCommentCollection
          .skip(MAX_LIMIT * i)
          .limit(MAX_LIMIT)
          .where({
            blogId,
          })
          .orderBy('createTime', 'desc')
          .get()
        promiseList.push(promise)
      }
      if (promiseList.length) {
        commentList = (await Promise.all(promiseList)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data)
          }
        })
      }
    }

    ctx.body = {
      blogDetail: detail,
      commentList,
    }
  })

  // 我的发布
  const WXcontext = cloud.getWXContext()
  app.router('getBlogDetailOpenid', async (ctx, next) => {
    ctx.body = await blogCollection.where({
      _openid: WXcontext.OPENID
    }).skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => {
        return res.data
      })
  })

  return app.serve()
}