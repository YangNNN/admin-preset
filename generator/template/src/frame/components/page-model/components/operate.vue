<template>
  <!-- 操作栏 -->
  <el-table-column
    label="操作"
    :width="operate.width"
    :min-width="operate['min-width']"
  >
    <template v-slot="{row, $index}">
      <operate-button 
        :btns="normalTableBtns"
        :row="row"
        :index="$index"
        @click="patchEvent(row, $index, $event)"
      />
      <el-dropdown 
        v-for="(item, index) in moreBtns" 
        :key="index"
        :class="{ ml10: !item.clear }"
        @command="handleCommand(row, $index, $event)"
      >
        <operate-button 
          :btns="[item]"
          :row="row"
          :index="$index"
          @click="patchEvent(row, $index, $event)"
        />
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
import OperateButton from './operate-button'
const Clipboard = require('clipboard')
import provideMixin from '../utils/provide-mixin'
import { wrapFc } from '../utils'
import { getType } from '@/utils'
export default {
  mixins: [provideMixin],
  components: {
    OperateButton
  },
  props: {
    operate: {
      type: Object,
      default: () => ({})
    }
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
          getType(item.copyText) === 'function'
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

<style lang="scss">
.el-dropdown.ml10 {
  margin-left: 10px;
}
</style>