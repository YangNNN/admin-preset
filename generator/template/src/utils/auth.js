/**
 * @file 存储cookie和用户信息的文件
 * @author yangshangman
 */

import Cookies from 'js-cookie'

const TOKEN_KEY = 'Admin-Token'

const USERINFO_KEY = 'User-Info'

const MODE = 'JWT'

const authTokens = {
  JWT: function(token) {
    return 'BEARER ' + token
  }
}

export const setAuthToken = function(token) {
  return authTokens[MODE](token)
}

export function getToken() {
  return Cookies.get(TOKEN_KEY)
}

export function setToken(token) {
  return Cookies.set(TOKEN_KEY, token)
}

export function removeToken() {
  return Cookies.remove(TOKEN_KEY)
}

export function setUserInfo(userInfo) {
  return localStorage.setItem(USERINFO_KEY, JSON.stringify(userInfo))
}

export function getUserInfo() {
  let info = localStorage.getItem(USERINFO_KEY)
  try {
    info = JSON.parse(info)
  } catch (error) {
    info = null
  }
  return info
}

export function removeUserInfo() {
  localStorage.removeItem(USERINFO_KEY)
}