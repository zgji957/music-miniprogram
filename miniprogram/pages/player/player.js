// pages/player/player.js
let musiclist = []
let nowplayingIndex = 0
// 音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl:null,
    isPlaying:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options',options)
    musiclist = wx.getStorageSync('musiclist')
    nowplayingIndex = options.index
    this._loadMusicDetail(options.musicId)
  },

  _loadMusicDetail(musicId){
    backgroundAudioManager.stop()
    const musicDetail = musiclist[nowplayingIndex]
    console.log('musicDetail', musicDetail)
    wx.setNavigationBarTitle({
      title: musicDetail.name,
    })
    this.setData({
      picUrl:musicDetail.al.picUrl
    })
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'musicUrl'
      }
    }).then((res)=>{
      console.log('musicUrl:',res)
      const result = res.result
      backgroundAudioManager.title = musicDetail.name
      backgroundAudioManager.src = result.data[0].url
      backgroundAudioManager.coverImgUrl = musicDetail.al.picUrl
      backgroundAudioManager.singer = musicDetail.ar[0].name
      this.setData({
        isPlaying:true
      })
    })
  },

  togglePlaying(){
    if(this.data.isPlaying){
      backgroundAudioManager.pause()
    }else{
      backgroundAudioManager.play()
    }

    this.setData({
      isPlaying:!this.data.isPlaying
    })
  },

  prev(){
    nowplayingIndex--
    if (nowplayingIndex<0){
      nowplayingIndex = musiclist.length-1
    }
    this._loadMusicDetail(musiclist[nowplayingIndex].id)
  },

  next() {
    nowplayingIndex++
    if (nowplayingIndex > (musiclist.length-1)) {
      nowplayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowplayingIndex].id)
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