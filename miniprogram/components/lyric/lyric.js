// components/lyric/lyric.js
let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowLyric: {
      type: Boolean,
      value: false
    },
    lyric: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrcList:[],
    curLrcIndex:0, // 当前歌词索引 
    scrollTop:0,
  },

  observers: {
    lyric(lyc) {
      console.log('lyric:', lyc)
      if(lyc=='暂无歌词'){
        this.setData({
          lrcList:[{
            time:0,
            lrc:'暂无歌词'
          }]
        })
      }else{
        this._parseLyric(lyc)
      }
     
    }
  },

  lifetimes: {
    ready() {
      wx.getSystemInfo({
        success: function(res) {
          // lyricHeight = res.screenWidth / 750 *64
          lyricHeight = 64/Math.floor(750/res.screenWidth)
        },
      })
    }
  },
 
  /**
   * 组件的方法列表
   */
  methods: {
    // update方法接收从player.js selectComponent里面接收的当前歌曲时间
    update(curTime){
      // console.log('curTime', curTime)
      let lrcList = this.data.lrcList
      if(lrcList.length==0){
        return;
      }
      if(curTime>lrcList[lrcList.length-1].time){
        if(this.data.curLrcIndex!=-1){
          this.setData({
            curLrcIndex:-1,
            scrollTop:lrcList.length*lyricHeight
          })
        }
      }
      for(let i = 0;i<lrcList.length;i++){
        if(lrcList[i].time>=curTime){
          this.setData({
            curLrcIndex:i-1,
            scrollTop: (i - 1) * lyricHeight
          })
          break;
        }
      }
    },

    _parseLyric(lyc) {
      let line = lyc.split('\n')
      let _lrcList = []
      line.forEach((elem) => {
        console.log('elem', elem)
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if (time != null) {
          let lrc = elem.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          console.log('timeReg', timeReg)
          // 把时间转换为秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc,
            time: time2Seconds,
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})
