<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :active-text-color="variables.menuActiveText"
        :unique-opened="false"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in permissionMenus" :key="route.muUrl" :item="route" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'
import { routes } from '@/router'
import pathToRegexp from 'path-to-regexp'

// 一维路由
function flatRoutes(routes) {
  let ret = []
  routes.forEach(route => {
    if (route.children) {
      ret = ret.concat(flatRoutes(route.children))
    }
    ret.push(route)
  })
  return ret
}

// 两个路径是否匹配
function isMatch(paths1, paths2) {
  if (!paths1 || !paths2) {
    return false
  }
  return pathToRegexp(paths1).test(paths2)
}

// 如果路由设置隐藏 向菜单添加hidden属性
function addHiddenToMenu(menus, routes) {
  menus.forEach(menu => {
    const info = routes.find(route => isMatch(menu.muUrl, route.path))
    menu.hidden = info ? info.hidden : false
    menu.children && addHiddenToMenu(menu.children, routes)
  })
  return menus
}

export default {
  components: { SidebarItem, Logo },
  data() {
    return {
      flatedRoutes: null
    }
  },
  computed: {
    ...mapGetters([
      'permissionMenus',
      'sidebar'
    ]),
    activeMenu() {
      const route = this.$route
      const { meta, matched } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return matched[1].path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  watch: {
    permissionMenus: {
      handler() {
        if (this.permissionMenus) {
          if (!this.flatedRoutes) {
            this.flatedRoutes = flatRoutes(routes)
          }
          const flatedRoutes = this.flatedRoutes
          return addHiddenToMenu(this.permissionMenus, flatedRoutes)
        } else {
          return []
        }
      },
      deep: true,
      immediate: true
    }
  }
}
</script>
