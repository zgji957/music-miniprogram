// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    modalShow:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGetUserInfo(event){
      console.log('userinfo',event)
      const userInfo = event.detail.userInfo
      if(userInfo){
        this.setData({
          modalShow:false
        })
        this.triggerEvent('loginUserInfoSuccess',userInfo)

      }else{
        this.triggerEvent('loginUserInfoFail')
      }
    }
  }
})
