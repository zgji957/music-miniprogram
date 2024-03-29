// pages/blog-comment/blog-comment.js
import formatTime from '../../utils/formatTime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogId:'',
    blog:{},
    commentList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { blogid:blogId} = options
    console.log('options', options)
    this.setData({
      blogId,
    })
    this.getBlogDetailAndComment()
  },

  // 获取blog详情和评论列表
  getBlogDetailAndComment(){
    const blogId = this.data.blogId
    console.log('blogId', blogId)
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'blog',
      data:{
        blogId,
        $url:"detail"
      }
    }).then((res)=>{
      console.log('getBlogDetailAndComment', res)
      wx.hideLoading()
      let commentList = res.result.commentList.data;
      for (let i = 0; i < commentList.length;i++){
        commentList[i].createTime = formatTime(new Date(commentList[i].createTime))
      }
      this.setData({
        blog:res.result.blogDetail[0],
        commentList,
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    const blog = event.target.dataset.blog
    return {
      title: blog.content,
      path: '/pages/blog-comment/blog-comment?blogId=' + blog._id
    }
  }
})