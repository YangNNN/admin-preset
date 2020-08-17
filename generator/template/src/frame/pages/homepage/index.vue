<template>
  <div>
    loading
  </div>
</template>

<script>
import config from '@/config'
import { findDataFromTree } from '@/utils'
import store from '@/store'
function findAvailableMenu(menus) {
  let menu = null
  for (let i = 0; i < menus.length; i++) {
    if (!menus[i].hidden) {
      if (!menus[i].children) {
        menu = menus[i]
      } else {
        menu = findAvailableMenu(menus[i].children)
      }
      if (menu && menu.muUrl) {
        break
      }
    }
  }
  return menu
}
export default {
  beforeRouteEnter(to, from, next) {
    const permissionMenus = store.state.user.permissionMenus
    if (!permissionMenus) {
      next('/login')
      return
    }
    let menu = null
    if (config.homePage) {
      const menus = findDataFromTree(permissionMenus, 'muUrl', config.homePage.muUrl)
      if (menus && menus[0]) {
        menu = menus.slice(-1)[0]
      } else {
        menu = findAvailableMenu(permissionMenus)
      }
    } else {
      menu = findAvailableMenu(permissionMenus)
    }
    if (!menu) {
      next('/404')
    } else {
      next(menu.muUrl)
    }
  }
}
</script>
