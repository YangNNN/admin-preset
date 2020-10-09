<template>
  <div class="button-wrap">
    <el-button
      v-for="(item, index) in showBtns"
      :key="index"
      :disabled="wrapFc(item.isDisabled, context, row, 'call', false)"
      :class="{'btn-copy': item.isCopy, 'btn-clear': item.clear}"
      v-bind="item"
      @click="handleClick(item)"
    >
      {{ wrapFc(item.text, context, row, 'call') }}
    </el-button>
  </div>
</template>

<script>
import { wrapFc } from '../utils'
import provideMixin from '../utils/provide-mixin'

export default {
  mixins: [provideMixin],
  props: {
    row: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: Number,
      default: 0
    },
    btns: {
      type: Array,
      defualt: () => ([])
    }
  },
  computed: {
    showBtns() {
      return this.btns.filter(btn => {
        return wrapFc(btn.isShow, this.context, this.row, 'call', true)
      })
    }
  },
  methods: {
    wrapFc,
    handleClick(item) {
      this.$emit('click', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.button-wrap {
  display: inline-block;
}
.el-button.btn-clear {
  margin-left: 0;
}
</style>