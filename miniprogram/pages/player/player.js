// pages/player/player.js
let musiclist = []
// 当前歌曲在列表中的索引
let nowplayingIndex = 0
// 音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()

const app =getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl:null,
    isPlaying:false,
    isShowLyric:false,
    lyric:'',
    isSame:false, // 是否是用一首歌
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

    if (musicId === app.getPlayingMusicId()){
      this.setData({
        isSame:true
      })
    }else{
      this.setData({
        isSame:false
      })
    }

    if(!this.data.isSame){
      backgroundAudioManager.stop()
    }
    const musicDetail = musiclist[nowplayingIndex]
    console.log('musicDetail', musicDetail)

    wx.setNavigationBarTitle({
      title: musicDetail.name,
    })

    this.setData({
      picUrl:musicDetail.al.picUrl
    })
    
    app.setPlayingMusicId(musicId)

    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'musicUrl'
      }
    }).then((res)=>{
      console.log('musicUrl:',res)
      const result = res.result
      if (!result.data[0].url){
        wx.showToast({
          title: '不能播放歌曲'
        })
      }
      if (!this.data.isSame) {
        this._saveHistory()
        backgroundAudioManager.title = musicDetail.name
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.coverImgUrl = musicDetail.al.picUrl
        backgroundAudioManager.singer = musicDetail.ar[0].name
      }
    
      this.setData({
        isPlaying:true
      })

      // 获取歌词
      wx.cloud.callFunction({
        name:'music',
        data:{
          musicId,
          $url:'lyric'
        }
      }).then((res)=>{
        console.log('lyricc', res)
        let lyric = '暂无歌词'
        const lrc = res.result.lrc
        if(lrc){
          lyric = lrc.lyric 
        }
        this.setData({
          lyric,
        })
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

  onChangeLyricShow(){
    this.setData({
      isShowLyric:!this.data.isShowLyric
    })
  },

  musicTimeUpdate(event){
    let curTime = event.detail.currentTime
    this.selectComponent('.lyric').update(curTime)
  },

  onMusicPlay(){
    this.setData({
      isPlaying:true
    })
  },

  onMusicPause(){
    this.setData({
      isPlaying:false
    })
  },

  // 保存历史
  _saveHistory(){
    const openid = app.globalData.openid
    const music = musiclist[nowplayingIndex]
    let musicHistory = wx.getStorageSync(openid)
    let isHave = false;
    for(let i=0;i<musicHistory.length;i++){
      if(musicHistory[i].id===music.id){
        isHave = true;
        break;
      }
    }
    if (!isHave){
      musicHistory.unshift(music)
    }
    wx.setStorageSync(openid, musicHistory)
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