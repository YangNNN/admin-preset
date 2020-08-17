import variables from '@/styles/element-variables.scss'
import Cookie from 'js-cookie'
import defaultSettings from '@/settings'
import { isDef } from '@/utils'
const { showSettings, tagsView, fixedHeader, sidebarLogo } = defaultSettings

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
  theme: isDef(cookieSetting.theme) ? cookieSetting.theme : variables.theme,
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

