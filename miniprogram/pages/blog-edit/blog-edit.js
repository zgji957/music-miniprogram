// pages/blog-edit/blog-edit.js
const MAX_IMAGE_NUM = 6
const db = wx.cloud.database()
let content = ''
let userInfo = {}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    wordsNum:0,
    footerBottom: 0,
    images:[],
    isShowSelectPhoto:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('block-edit-options',options)
    console.log('images', this.data.images)
    userInfo = options
  },

  onInput(event){
    let wordsNum = event.detail.value.length
    this.setData({
      wordsNum,
    })
    content = event.detail.value
  },

  onFocus(event){
    this.setData({
      footerBottom:event.detail.height
    })
  },

  onBlur(event){
    this.setData({
      footerBottom:0
    })
  },

  onChooseImage(event){
    let count = MAX_IMAGE_NUM - this.data.images.length
    wx.chooseImage({
      count,
      sizeType:['original','compressd'],
      sourceType:['album','camera'],
      success: (res)=> {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        count = MAX_IMAGE_NUM - this.data.images.length
        this.setData({
          isShowSelectPhoto: count <=0 ? false : true
        })
        
      },
    })
  },

  onDeleteImage(event){
    console.log('delete',event)
    const index = event.target.dataset.index
    this.data.images.splice(index, 1)
    this.setData({
      images:this.data.images
    })
    const count = MAX_IMAGE_NUM - this.data.images.length
    if (this.data.images.length < MAX_IMAGE_NUM){
      this.setData({
        isShowSelectPhoto:true
      })
    }
  },

  onPreviewImage(event){
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgurl
    })
  },

  // 发布
  send(){

    if(content.trim()===''){
      wx.showModal({
        title: '内容不能空',
      })
      return
    }

    // 上传图片
    console.log('this.data.images', this.data.images)
    let promiseArr = []
    let fileIds = []
    
    wx.showLoading({
      title: '发布中',
      mask:true
    })

    for(let i=0,len=this.data.images.length;i<len;i++){
      let p = new Promise((resolve,reject)=>{
        let suffix = this.data.images[i].match(/\.\w+$/)[0]

        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 10000000 + '' + suffix,
          filePath: this.data.images[i],
          success: (res) => {
            console.log('success', res)
            fileIds = fileIds.concat(res.fileID)
            resolve(res.fileID)
          },
          fail: (res) => {
            console.log('fail', res)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }

    // 上传数据到云数据库
    Promise.all(promiseArr).then((res)=>{
      db.collection('blog').add({
        data:{
          content,
          img:fileIds,
          ...userInfo,
          createTime:db.serverDate()
        }
      }).then((res)=>{
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        wx.navigateBack()
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        prevPage.onPullDownRefresh()
      })
    }).catch((err)=>{
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
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
  onShareAppMessage: function () {

  }
})