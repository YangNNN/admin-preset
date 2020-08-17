<template>
  <div v-if="hasTopBar || hasSearch" class="model-head">
    <div v-if="hasTopBar" class="topbar-btns">
      <el-button
        v-if="useConfig.addUrl"
        :size="useConfig.size"
        :type="(addButton && addButton.type) || 'primary'"
        :icon="wrapIconClass(addButton && addButton.icon)"
        v-bind="addButton || {}"
        @click="onAdd"
      >
        {{ addButtonText }}
      </el-button>
      <template v-if="topBar && topBar.els">
        <el-button
          v-for="(btn, index) in topBar.els"
          :key="index"
          :size="btn.size"
          :type="btn.type"
          :icon="wrapIconClass(btn.icon)"
          v-bind="btn.props"
          @click="onClickTopBtn(btn.event)"
        >
          {{ btn.text }}
        </el-button>
      </template>
    </div>
    <div v-if="hasSearch" class="toggle-expand" @click="onToggleExpand">
      <span>{{ isSearchExpand ? '收起' : '展开' }}</span>
      <i :class="[isSearchExpand ? 'el-icon-caret-top' : 'el-icon-caret-bottom']" />
    </div>
  </div>
</template>

<script>
import { wrapIconClass } from '../utils'
import { getType } from '@/utils'
export default {
  props: {
    isSearchExpand: {
      type: Boolean,
      default: false
    },
    hasSearch: {
      type: Boolean,
      default: false
    },
    useConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  computed: {
    topBar() {
      return this.useConfig.topBar
    },
    hasTopBar() {
      return this.useConfig.addUrl ||
        (this.topBar &&
        this.topBar.els &&
        this.topBar.els.length > 0)
    },
    addButton() {
      return this.useConfig.addButton
    },
    addButtonText() {
      if (!this.addButton) {
        const name = this.useConfig.name
        return '新增' + (name ? getType(name) === 'string' ? name : name.title : '')
      }
      return this.addButton.text || '新增'
    }
  },
  methods: {
    wrapIconClass,
    onToggleExpand() {
      this.$emit('update:isSearchExpand', !this.isSearchExpand)
    },
    onClickTopBtn(event) {
      this.$emit('custom', event)
    },
    onAdd() {
      this.$emit('add')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.model-head {
  display: flex;
  align-items: center;
  padding-top: 10px;
  height: 40px;
  position: relative;
  .toggle-expand {
    position: absolute;
    right: 10px;
    top: 25px;
    color: $theme;
    font-size: 14px;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
