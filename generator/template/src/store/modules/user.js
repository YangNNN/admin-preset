import config from '@/config'
import { resetRouter } from '@/router'
import store from '@/store'
import { tree } from '@/utils'
import $axios from '@/utils/ajax'
import { getToken, getUserInfo, removeToken, removeUserInfo, setToken, setUserInfo } from '@/utils/auth'
import { invokeSignalr } from '@/utils/signalr'
const state = {
  token: getToken(),
  userInfo: null, // 用户信息
  name: null, // 账户名称
  roCode: null, // 角色code
  powerCodes: null, // 权限code列表
  totalMenus: null, // 全部菜单
  permissionMenus: null // 允许的菜单
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_USERINFO: (state, userInfo) => {
    state.userInfo = userInfo
  },
  SET_RO_CODE: (state, rocode) => {
    state.roCode = rocode
  },
  SET_POWER_CODES: (state, powerCodes) => {
    state.powerCodes = powerCodes
  },
  SET_TOTAL_MENU: (state, totalMenus) => {
    state.totalMenus = totalMenus
  },
  SET_PERMISSION_MENU: (state, permissionMenus) => {
    state.permissionMenus = permissionMenus
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { account, password } = userInfo
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await $axios.post('/System/Login', {
          account: account.trim(),
          password: password
        })
        commit('SET_TOKEN', data.token)
        commit('SET_RO_CODE', data.roCode)
        setToken(data.token)
        setUserInfo(data)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  },

  checkLogin({ commit, state }) {
    return new Promise((resolve, reject) => {
      let userInfo = getUserInfo()
      if (state.token && userInfo) {
        // 存在token和用户信息
        commit('SET_NAME', userInfo.auName)
        commit('SET_RO_CODE', userInfo.roCode)
        commit('SET_USERINFO', userInfo)
        resolve(userInfo)
        // 使用消息推送
        if (config.useSignalr) {
          invokeSignalr({
            options: {
              onmessage: (title, message) => {
                store.dispatch('notice/showNotice', {
                  title,
                  options: {
                    body: message || '',
                    silent: true,
                    sound: '/mp3/sound.mp3'
                  }
                })
              }
            },
            data: userInfo.id + ''
          })
        }
      } else {
        removeToken()
        removeUserInfo()
        reject('no token')
      }
    })
  },

  getPower({ commit, state }) {
    return new Promise((resolve, reject) => {
      function resolveData(menus, powers) {
        const powerCodes = powers.muCode.split(',')
        // 加入首页
        if (config.pushHome) {
          menus.unshift(config.homePage)
          powerCodes.unshift(config.homePage.muCode)
        }
        // 测试页面
        if (!config.isProduction && config.testPage) {
          menus.push(config.testPage)
          powerCodes.push(config.testPage.muCode)
        }
        let permissionMenus = menus.filter(menu => {
          return powerCodes.includes(menu.muCode)
        })
        permissionMenus = tree(permissionMenus, 'muCode', 'pmuCode', 'sort', 1)
        commit('SET_POWER_CODES', powerCodes)
        commit('SET_TOTAL_MENU', menus)
        commit('SET_PERMISSION_MENU', permissionMenus)
        resolve(powers)
      }
      const staticMenus = config.staticMenus
      if (staticMenus) {
        resolveData(staticMenus.menus, staticMenus.powers)
      } else {
        if (!state.token || !state.roCode) {
          reject()
        } else {
          Promise.all([
            $axios.post('/System/GetMenusListInAdmin'),
            $axios.post('/System/GetPowerInAdmin', {
              roCode: state.roCode
            })
          ]).then(res => {
            const [menus, powers] = res
            resolveData(menus.data, powers.data)
          }).catch(error => {
            reject(error)
          })
        }
      }
    })
  },

  // user logout
  logout({ commit, dispatch }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_RO_CODE', '')
      commit('SET_POWER_CODES', null)
      commit('SET_TOTAL_MENU', null)
      commit('SET_PERMISSION_MENU', null)
      removeToken()
      removeUserInfo()
      resetRouter()
      dispatch('tagsView/delAllViews', null, { root: true })
      resolve()
    })
  },

  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
