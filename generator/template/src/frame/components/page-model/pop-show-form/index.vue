<template>
  <div v-show="popShow" class="pop-show-container" :class="{ 'use-tab': isUseTabs }">
    <Sticky v-if="hasTopClose" :z-index="10">
      <div class="sticky-bar">
        <el-button type="warning" @click="hide">关闭</el-button>
      </div>
    </Sticky>
    <div class="form-content">
      <slot />
    </div>
  </div>
</template>

<script>
import Sticky from '@/frame/components/Sticky'
export default {
  components: {
    Sticky
  },
  props: {
    hasTopClose: {
      type: Boolean,
      default: false
    },
    isUseTabs: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      popShow: false,
      hasBind: false,
      routeName: ''
    }
  },
  mounted() {
    this.routeName = this.$route.name
  },
  methods: {
    show() {
      const $parent = this.$parent
      let $page = null
      if ($parent && ($page = $parent.$refs.page)) {
        this.$store.commit('page/SET_SCROLL_TOP', {
          name: this.routeName,
          scrollTop: $page.$el.scrollTop
        })
        window.scrollTo(0, 0)
        $page.isShowForm = true
      }
      this.popShow = true
      this.bindClsoe()
    },
    hide() {
      if (this.popShow === false) {
        return
      }
      const $parent = this.$parent
      let $page = null
      this.popShow = false
      if ($parent && ($page = $parent.$refs.page)) {
        $page.isShowForm = false
        this.$nextTick(() => {
          $page.$el.scrollTo(0, this.$store.state.page.scrollTop[this.routeName] || 0)
          this.$store.commit('page/SET_SCROLL_TOP', {
            name: this.routeName,
            scrollTop: 0
          })
        })
      }
      this.$emit('close')
    },
    bindClsoe() {
      if (this.hasBind) {
        return
      }
      this.$nextTick(() => {
        const componentInstance = this.$slots.default[0].componentInstance
        if (componentInstance && componentInstance._isVue) {
          componentInstance.$on('close', () => {
            this.hide()
          })
          this.hasBind = true
        }
      })
    }
  }
}
</script>

<style lang="scss">
.pop-show-container {
  min-height: 100%;
  &.use-tab {
    height: 100%;
    .form-content {
      padding: 0 15px;
      height: 100%;
    }
  }
  .sticky-bar {
    line-height: 50px;
    background-color: #d0d0d0;
    position: relative;
    z-index: 10;
    padding-right: 15px;
    text-align: right;
  }
  .form-content {
    padding: 0 15px;
  }
}
</style>
