// pages/blog/blog.js
let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow:false,
    blogList:[]
  },

  // 发布
  onPublish(){
    // 判断是否授权
    wx.getSetting({
      success:(res)=>{
        console.log('auth',res)
        if(res.authSetting['scope.userInfo']){
          wx.getUserInfo({
            success:(res)=>{
              console.log(res)
              this.loginUserInfoSuccess({
                detail: res.userInfo
              })
            }
          })
        }else{
          this.setData({
            modalShow:true 
          })
        }
      }
    })
  },

  // 获取登录信息成功
  loginUserInfoSuccess(event){
    console.log('loginUserInfoSuccess',event)
    const detail = event.detail
    wx.navigateTo({
      url:`../blog-edit/blog-edit?nickname=${detail.nickName}&avatarUrl=${detail.avatarUrl}`
    })
  },

  // 获取登录信息失败
  loginUserInfoFail(){
    wx.showModal({
      title: '未授权',
      content: '',
    })
  },

  // 获取blog列表
  _getBlogList(start = 0){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'blog',
      data:{
        $url:'list',
        start,
        count:10,
        keyword,
      }
    }).then((res)=>{
      console.log('res',res)
      this.setData({
        blogList:this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },

  // 跳转到评论页
  gocomment(event){
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogid='+event.target.dataset.blogid,
    })
  },

  // 搜索
  onSearch(event){
    this.setData({
      blogList:[]
    })
    keyword = event.detail.keyword
    this._getBlogList()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getBlogList()
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
    this.setData({
      blogList:[]
    })
    this._getBlogList(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    const blog = event.target.dataset.blog
    return {
      title: blog.content,
      path:'/pages/blog-comment/blog-comment?blogId='+blog._id
    }
  }
})