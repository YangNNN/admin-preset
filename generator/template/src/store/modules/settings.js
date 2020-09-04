import defaultSettings from '@/settings'
import { isDef } from '@/utils'
import Cookie from 'js-cookie'
const { showSettings, tagsView, fixedHeader, sidebarLogo, theme } = defaultSettings

const cookieSetting = {
  theme: Cookie.get('theme'),
  tagsView: Cookie.get('tagsView'),
  fixedHeader: Cookie.get('fixedHeader'),
  sidebarLogo: Cookie.get('sidebarLogo')
}

function isTrue(val) {
  return val === 'true'
}

const state = {
  theme: isDef(cookieSetting.theme) ? cookieSetting.theme : theme,
  showSettings: showSettings,
  tagsView: isDef(cookieSetting.tagsView) ? isTrue(cookieSetting.tagsView) : tagsView,
  fixedHeader: isDef(cookieSetting.fixedHeader) ? isTrue(cookieSetting.fixedHeader) : fixedHeader,
  sidebarLogo: isDef(cookieSetting.sidebarLogo) ? isTrue(cookieSetting.sidebarLogo) : sidebarLogo
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      Cookie.set(key, value)
      state[key] = value
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

