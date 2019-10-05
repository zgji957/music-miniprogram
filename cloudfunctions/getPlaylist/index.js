// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const rp = require('request-promise')

const url = 'http://musicapi.xiecheng.live/personalized'

const playlistCollection = db.collection('playlist')

const MAX_limit = 10

// 云函数入口函数
exports.main = async (event, context) => {
  const countResult = await playlistCollection.count()

  const total = countResult.total

  const batchTimes = Math.ceil(total / MAX_limit)

  const tasks = []

  for (let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_limit).limit(MAX_limit).get()
    tasks.push(promise)
  }

  let list = {
    data: []
  }

  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
 

  // const list = await playlistCollection.get()

  const playlist = await rp(url).then((res) => {
    return JSON.parse(res).result
  })

  let newData = []

  for (let i = 0, len = playlist.length; i < len; i++) {
    let flag = false
    for (let j = 0, len = list.data.length; j < len; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = true
        break;
      }
    }
    if (!flag) {
      newData.push(playlist[i])
    }
  }

  for (let i = 0, len = newData.length; i < len; i++) {
    await playlistCollection.add({
      data: {
        ...newData[i],
        createTime: db.serverDate(),
      }
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.log('插入失败')
    })
  }

  return newData.length
} 