<template>
  <!-- 操作栏 -->
  <el-table-column
    label="操作"
    :width="operate.width"
    :min-width="operate['min-width']"
  >
    <template v-slot="{row, $index}">
      <el-button
        v-for="(item, index) in normalTableBtns"
        v-show="wrapFc(item.isShow, context, row, 'call', true)"
        :key="index"
        :disabled="wrapFc(item.isDisabled, context, row, 'call', false)"
        :class="{'btn-copy': item.isCopy}"
        :type="item.type"
        :size="item.size"
        :style="{marginLeft: item.clear ? '0' : '10px'}"
        v-bind="item.props || {}"
        :icon="wrapIconClass(item.icon)"
        @click="patchEvent(row, $index, item)"
      >
        {{ wrapFc(item.text, context, row, 'call') }}
      </el-button>
      <el-dropdown v-for="(item, index) in moreBtns" :key="index" @command="handleCommand(row, $index, $event)">
        <el-button
          v-show="wrapFc(item.isShow, context, row, 'call', true)"
          :disabled="wrapFc(item.isDisabled, context, row, 'call', false)"
          :class="{'btn-copy': item.isCopy}"
          :type="item.type"
          :size="item.size"
          :style="{marginLeft: item.clear ? '0' : '10px'}"
          v-bind="item.props || {}"
          :icon="wrapIconClass(item.icon)"
          @click="patchEvent(row, $index, item)"
        >
          {{ wrapFc(item.text, context, row, 'call') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(iitem, mIndex) in item.els"
            :key="mIndex"
            :command="JSON.stringify(iitem)"
          >
            {{ wrapFc(iitem.text, context, row, 'call') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>
  </el-table-column>
</template>

<script>
const Clipboard = require('clipboard')
import { wrapFc, wrapIconClass } from '../utils'
export default {
  props: {
    operate: {
      type: Object,
      default: () => ({})
    }
  },
  inject: {
    context: {}
  },
  computed: {
    normalTableBtns() {
      return this.operate.els.filter(el => !el.isMore)
    },
    moreBtns() {
      return this.operate.els.filter(el => el.isMore)
    }
  },
  methods: {
    wrapIconClass,
    wrapFc,
    handleCommand(row, index, jsonItem) {
      this.patchEvent(row, index, JSON.parse(jsonItem))
    },
    patchEvent(row, index, item) {
      if (item.event) {
        this.$emit('costom', row, index, item.event)
      } else if (item.isDel) {
        this.$emit('del', row, index)
      } else if (item.isEdit) {
        this.$emit('edit', row, index)
      } else if (item.isCopy) {
        this.onCopy(
          typeof item.copyText === 'function'
            ? item.copyText.call(this.context, row)
            : item.copyText
        )
      }
    },
    onCopy(text) {
      const clipboard = new Clipboard('.btn-copy', {
        text() {
          return text
        }
      })
      clipboard.on('success', () => {
        this.$message.success('复制成功!')
        clipboard.destroy()
      })
    }
  }
}
</script>
