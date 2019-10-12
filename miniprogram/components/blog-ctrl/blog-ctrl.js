// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
let db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog:Object,
    blogid:String
  },

  options: {
    styleIsolation: 'apply-shared'
  },

  /**
   * 组件的初始数据
   */
  data: {
    modalShow:false,
    loginShow:false,
    content:'',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      wx.getSetting({
        success:((res)=>{
          if(res.authSetting['scope.userInfo']){
            wx.getUserInfo({
              success:(res)=>{
                this.loginUserInfoSuccess({
                  detail:res.userInfo
                })
              }
            })
          }else{
            this.setData({
              loginShow:true
            })
          }
        })
      })
    },

    loginUserInfoSuccess(event){
      console.log("event", event)
      userInfo = event.detail
      this.setData({
        loginShow: false
      },()=>{
        this.setData({
          modalShow: true
        })
      })
    },

    loginUserInfoFail(){
      wx.showModal({
        title: '未授权不能评论',
      })
    },

    onInput(event){
      this.setData({
        content:event.detail.value
      })
    },
    
    onSend(event){
      // 推送小程序模版
      let formId = event.detail.formId
      console.log('formId', event)
      // 插入云数据库
      let content = this.data.content
      console.log('content', content)
      if(content.trim()==''){
        wx.showModal({
          title: '内容不能为空',
          content: '',
        })
        return
      }
      wx.showLoading({
        title: '加载中',
        mask:true,
      })
      db.collection('blog-comment').add({
        data:{
          content,
          createTime:db.serverDate(),
          blogId:this.properties.blogid,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
        }
      }).then((res)=>{
        // 推送模版，调用云函数
        wx.cloud.callFunction({
          name: 'sendMessage',
          data: {
            content,
            nickName: userInfo.nickName,
            formId,
            blogId: this.properties.blogid,
          }
        }).then((res) => {
          console.log('sendMessage', res)
        })
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        //清除信息
        this.setData({
          content:'',
          modalShow:false
        })

        this.triggerEvent('refleshComment')

      })

    }
  }
})
