import { getToken } from '@/utils/auth' // get token from cookie
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import pathToRegexp from 'path-to-regexp'
import router from './router'
import store from './store'
NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/401', '/404', '/auth-redirect', '/homepage']

function checkValid(menus: any, path: string) {
  let isVlaid = false
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i]
    if (menu.muUrl) {
      if (pathToRegexp(menu.muUrl).test(path) || pathToRegexp(`/redirect${menu.muUrl}`).test(path)) {
        isVlaid = true
        break
      }
    } else {
      if (menu.children) {
        if (checkValid(menu.children, path)) {
          isVlaid = true
          break
        }
      }
    }
  }
  return isVlaid
}

function powerValid(path: string, next: Function) {
  if (~whiteList.indexOf(path)) {
    next()
  } else {
    const permissionMenus = store.getters.permissionMenus
    if (checkValid(permissionMenus, path)) {
      next()
    } else {
      const totalMenus = store.getters.totalMenus
      const isFound = totalMenus.find((menu: { muUrl: string }) => menu.muUrl === path)
      next(isFound ? '/401' : '/404')
    }
  }
  NProgress.done()
}

router.beforeEach(async(to: any, from: any, next: Function) => {
  // start progress bar
  NProgress.start()
  // determine whether the user has logged in
  const hasToken = getToken()
  if (hasToken) {
    try {
      await store.dispatch('user/checkLogin')
      const menus = store.getters.permissionMenus
      if (menus && menus.length > 0) {
        powerValid(to.path, next)
      } else {
        // 获取菜单和菜单权限
        try {
          await store.dispatch('user/getPower')
          powerValid(to.path, next)
        } catch (error) {
          // 获取菜单失败
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    } catch (error) {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  } else {
    /* has no token*/
    if (~whiteList.indexOf(to.path)) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
