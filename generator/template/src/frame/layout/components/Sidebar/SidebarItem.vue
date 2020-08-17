<template>
  <div v-if="!item.hidden" class="menu-wrapper">
    <template v-if="!item.children">
      <app-link :to="resolvePath(item.muUrl || '')">
        <el-menu-item :index="item.muUrl" :class="{'submenu-title-noDropdown':!isNest}">
          <item :icon="item.muIcon || item.muIcon" :title="item.muName" />
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else ref="subMenu" :index="`${item.id}`" popper-append-to-body>
      <template slot="title">
        <item :icon="item.muIcon" :title="item.muName" />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.muUrl"
        :is-nest="true"
        :item="child"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    }
  },
  data() {
    this.onlyOneChild = null
    return {}
  },
  methods: {
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      return path.resolve(routePath)
    }
  }
}
</script>
