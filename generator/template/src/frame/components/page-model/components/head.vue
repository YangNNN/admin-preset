<template>
  <div v-if="headManager.hasTopBar || manager.hasSearch" class="model-head">
    <div v-if="headManager.hasTopBar" class="topbar-btns">
      <el-button
        v-for="(btn, index) in topBarEls"
        :key="index"
        :size="btn.size"
        :type="btn.type"
        :icon="btn.icon"
        v-bind="btn.props"
        @click="onClickTopBar(btn)"
      >
        {{ btn.text }}
      </el-button>
    </div>
    <div v-if="searchManager.hasSearch" class="toggle-expand" @click="onToggleExpand">
      <span>{{ headManager.isSearchExpand ? '收起' : '展开' }}</span>
      <i :class="[headManager.isSearchExpand ? 'el-icon-caret-top' : 'el-icon-caret-bottom']" />
    </div>
  </div>
</template>

<script>
import provideMixin from '../utils/provide-mixin'
import { wrapFc } from '../utils'
export default {
  mixins: [provideMixin],
  computed: {
    headManager() {
      return this.manager.headManager
    },
    searchManager() {
      return this.manager.searchManager
    },
    topBarEls() {
      return this.headManager.topBar.els
      .filter((button) => {
        return wrapFc(button.isShow, this.context, null, 'call', true)
      })
      .map((button) => {
        return {
          ...button
        }
      })
    }
  },
  methods: {
    onToggleExpand() {
      this.headManager.setValue('isSearchExpand', !this.headManager.isSearchExpand )
    },
    onClickTopBar(button) {
      button.isAdd ? this.$emit('add') : this.$emit('custom', button.event)
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
