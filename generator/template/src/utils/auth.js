import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

const UserInfoKey = 'User-Info'

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
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setUserInfo(userInfo) {
  return localStorage.setItem(UserInfoKey, JSON.stringify(userInfo))
}

export function getUserInfo() {
  let info = localStorage.getItem(UserInfoKey)
  try {
    info = JSON.parse(info)
  } catch (error) {
    info = null
  }
  return info
}

export function removeUserInfo() {
  localStorage.removeItem(UserInfoKey)
}