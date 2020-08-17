function palyDeskNotice(options) {
  return new Promise(resolve => {
    if (Notification.permission !== 'granted') {
      // 先判断一下用户是否已经开启了桌面提示的权限，如果没有则提醒用户开启
      window.Notification.requestPermission(function(permission) {
        if (permission === 'granted') {
          showNotice(options.title, options.options)
          resolve(true)
        } else {
          resolve(false)
        }
      })
    } else {
      showNotice(options.title, options.options)
      resolve(true)
    }
  })
}

function showNotice(title, options) {
  // 这个就是桌面弹窗
  var desknotice = new Notification(title, options)
  // 新增声音
  if (options.sound) {
    let audio = document.querySelector('#notice_audio')
    if (!audio) {
      audio = document.createElement('audio')
      document.body.appendChild(audio)
    }
    audio.src = options.sound
    audio.play()
  }
  desknotice.onclick = function() {
    // 当用户点击弹窗的时候，要定位到聊天窗口
    window.focus()
    desknotice.close()
    options.callback && options.callback()
  }
  // 页面退出时关闭提醒
  window.onbeforeunload = function() {
    desknotice.close()
  }
  // 弹窗3秒后自动消失
  setTimeout(desknotice.close.bind(desknotice), 3000)
}

const state = {
  notices: []
}

const mutations = {
  ADD_NOTICE: (state, notice) => {
    state.notices.push(notice)
  },
  REMOVE_NOTICE: (state, index) => {
    state.notices.splice(index, 1)
  },
  REMOVE_ALL_NOTICE: (state) => {
    state.notices = []
  }
}

const actions = {
  async showNotice({ commit, state }, notice) {
    function showAllNotice(notices) {
      notices.forEach(notice => {
        palyDeskNotice(notice)
      })
      commit('REMOVE_ALL_NOTICE')
    }
    commit('ADD_NOTICE', notice)
    if (Notification.permission !== 'granted') {
      const notice = state.notices.slice(0, 1)
      const isPermission = await palyDeskNotice(notice)
      if (isPermission) {
        commit('REMOVE_NOTICE', 0)
        showAllNotice(state.notices)
      } else {
        // defined
      }
    } else {
      showAllNotice(state.notices)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
