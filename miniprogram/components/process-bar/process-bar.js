// components/process-bar/process- bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let duration = 0; // 播放器总时间
let isMoving = true;

Component({
  /**
   * 组件的属性列表
   */ 
  properties: {
    isSame:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime:{
      currentTime:'00:00',
      totalTime:'00:00',
    },
    movableDis: 1,
    progress: 0
  },

  lifetimes:{
    ready(){
      if(this.properties.isSame){
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event){
      if(event.detail.source==='touch'){
        this.data.progress = event.detail.x / (movableAreaWidth-movableViewWidth) *100
        this.data.movableDis = event.detail.x
        isMoving = false
      }
    },
    onTouchEnd(event){
      const currentTimeFormat = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress:this.data.progress,
        movableDis:this.data.movableDis,
        ['showTime.currentTime']: `${currentTimeFormat.min}:${currentTimeFormat.sec}`
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },
    _getMovableDis(){
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect)=>{
        console.log('rect',rect)
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        isMoving = true
        this.triggerEvent('musicPlay')
      })

      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })

      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        this.triggerEvent('musicPause')
      })

      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })

      backgroundAudioManager.onCanplay(() => {
        setTimeout(()=>{
          this._setTime()
        },1000)
      })

      backgroundAudioManager.onTimeUpdate(() => {
        const currentTime = backgroundAudioManager.currentTime
        const duration = backgroundAudioManager.duration
        const currentTimeFormat = this._dateFormat(currentTime)
        if (!isMoving){
          return
        }
        this.setData({
          movableDis:(movableAreaWidth-movableViewWidth)*currentTime/duration,
          progress: currentTime/duration*100,
          ['showTime.currentTime']: `${currentTimeFormat.min}:${currentTimeFormat.sec}`
        })

        // 触发获取歌曲当前时间事件
        this.triggerEvent('musicTimeUpdate',{
          currentTime
        })
      })

      backgroundAudioManager.onEnded(() => {
        this.triggerEvent('musicEnd')
      })

      backgroundAudioManager.onError((res) => {
        wx.showToast({
          title: '播放错误：'+res.errCode,
        })
      })
    },

    _setTime(){
       duration = backgroundAudioManager.duration
      console.log('duration', duration)
      const durationFormat = this._dateFormat(duration)
      console.log('durationFormat',durationFormat)
      this.setData({
        ['showTime.totalTime']:`${durationFormat.min}:${durationFormat.sec}`
      })
    },

    _dateFormat(sec){
      const min = Math.floor(sec/60)
      sec = Math.floor(sec % 60)
      return {
        'min':this._parse0(min),
        'sec':this._parse0(sec),
      }
    },

    _parse0(sec){
      return sec<10 ? '0'+sec : sec
    }
  }
})
