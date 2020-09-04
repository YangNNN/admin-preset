import { getToken } from '@/utils/auth' // get token from cookie
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import pathToRegexp from 'path-to-regexp'
import router from './router'
import store from './store'
NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList: string[] = ['/login', '/401', '/404', '/auth-redirect', '/homepage']

const inWhiteList = (path: string) => ~whiteList.indexOf(path)

function findTargetMenu(allowedMenus: any[], path: string) {
  let isvalid = false
  for (let i = 0; i < allowedMenus.length; i++) {
    const menu = allowedMenus[i]
    if (menu.muUrl) {
      if (pathToRegexp(menu.muUrl).test(path) || pathToRegexp(`/redirect${menu.muUrl}`).test(path)) {
        isvalid = true
        break
      }
    } else {
      if (menu.children && findTargetMenu(menu.children, path)) {
        isvalid = true
        break
      }
    }
  }
  return isvalid
}

function validatePower(allowedMenus: any[], to: any, next: Function) {
  const { path, query } = to
  if (inWhiteList(path)) {
    if (path === '/login') {
      next(query.redirect || '/homepage')
    } else {
      next()
    }
    NProgress.done()
    return
  }
  if (findTargetMenu(allowedMenus, path)) {
    next()
  } else {
    const totalMenus: any[] = store.getters.totalMenus
    const isFound = totalMenus.find((menu) => menu.muUrl === path)
    next(isFound ? '/401' : '/404')
  }
  NProgress.done()
}

router.beforeEach(async(to: any, from: any, next: Function) => {

  NProgress.start()
  
  const hasToken = getToken()
  if (!hasToken) {
    if (inWhiteList(to.path)) {
      // 白名单 进入!
      next()
    } else {
      // 没有登录信息
      next(`/login?redirect=${to.path}`)
    }
    NProgress.done()
    return
  }

  try {
    await store.dispatch('user/checkLogin')
    const allowedMenus = store.getters.allowedMenus
    if (allowedMenus && allowedMenus.length > 0) {
      validatePower(allowedMenus, to, next)
    } else {
      // 获取菜单和菜单权限
      try {
        await store.dispatch('user/getPower')
        validatePower(store.getters.allowedMenus, to, next)
      } catch (error) {
        // 获取菜单失败
        await store.dispatch('user/resetToken')
        // Message.error(error || 'Has Error')
        console.warn('validerror::', error)
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  } catch (error) {
    next(`/login?redirect=${to.path}`)
    NProgress.done()
  }

})

router.afterEach(() => {
  NProgress.done()
})
