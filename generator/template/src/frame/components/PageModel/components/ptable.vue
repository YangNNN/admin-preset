<template>
  <el-table
    ref="el-table"
    v-loading="table.isLoading"
    class="model-el-table"
    :class="{sticky: isSticky}"
    :style="{paddingTop: isSticky ? stickyElRect.height + 'px' : null}"
    :data="showTableData"
    :header-cell-style="headerCellStyle"
    :size="useConfigTable.size || useConfig.size"
    :border="useConfigTable.border || false"
    :element-loading-text="useConfigTable.elementLoadingText || '加载中'"
    :span-method="spanMethod"
    @selection-change="onSelectionChange"
    @sort-change="onSortChange"
  >
    <el-table-column
      v-if="useConfigTable.hasSelect"
      type="selection"
      width="55"
      :selectable="wrapFc(useConfigTable.selectable, context, context, 'bind', null)"
      :reserve-selection="useConfigTable.reserveSelection"
    />

    <!-- 操作栏 -->
    <operate
      v-if="useConfigTable.operate && useConfigTable.operate.isLeft"
      :context="context"
      :operate="useConfigTable.operate"
      @costom="onCostomEvent"
      @del="onDel"
      @edit="onEdit"
    />

    <!-- 表格列表 -->
    <column
      v-for="(column, index) in useConfigTable._els"
      :key="index"
      :column="column"
    />
    <!-- 操作栏 -->
    <operate
      v-if="useConfigTable.operate && !useConfigTable.operate.isLeft"
      :context="context"
      :operate="useConfigTable.operate"
      @costom="onCostomEvent"
      @del="onDel"
      @edit="onEdit"
    />

  </el-table>
</template>

<script>
import { getType } from '@/utils'
import { wrapFc } from '../utils'
import column from './column'
import operate from './operate'
import { mapState } from 'vuex'
export default {
  components: {
    column, operate
  },
  props: {
    table: {
      type: Object,
      default: () => ({})
    },
    context: {
      type: Object,
      default: () => ({})
    },
    useConfig: {
      type: Object,
      default: () => ({})
    },
    isShowForm: {
      type: Boolean,
      default: false
    }
  },
  provide() {
    return {
      context: this.context
    }
  },
  data() {
    return {
      scrollEl: null, // 监听的滚动元素
      stickyEl: null, // 吸顶的元素（表头）
      stickyElRect: {}, // 吸顶元素的未知信息
      stickyBodyEl: null, // 吸顶元素的父元素
      isListening: false // 是否正在监听滚动
    }
  },
  computed: {
    useConfigTable() {
      return this.useConfig.table || {}
    },
    isSticky() {
      return this.useConfig.stickyHeader
    },
    showTableData() {
      const repeatTimes = this.repeatTimes
      if (repeatTimes) {
        const data = []
        this.table.data.forEach(item => {
          Array.apply(null, {
            length: repeatTimes
          }).forEach(_ => {
            data.push(item)
          })
        })
        return data
      } else {
        return this.table.data
      }
    },
    headerRowStyle() {
      return this.useConfigTable.headerRowStyle
        ? this.useConfigTable.headerRowStyle
        : {
          fontWeight: 500
        }
    },
    headerCellStyle() {
      return this.useConfigTable.headerCellStyle
        ? this.useConfigTable.headerCellStyle
        : {
          color: '#333',
          backgroundColor: 'rgb(247, 248, 250)'
        }
    },
    navHeight() {
      let height = 0
      if (this.needTagsView) {
        height += 34
      }
      return height + 50
    },
    repeatTimes() {
      const useConfigTable = this.useConfigTable
      if (useConfigTable.spanMethod) {
        return useConfigTable.repeat
      } else if (useConfigTable.simpleSpanMethod) {
        return this.getSimpleSpanModel().length
      }
      return false
    },
    spanMethod() {
      const useConfigTable = this.useConfigTable
      if (useConfigTable.spanMethod) {
        // 原生的spanMethod
        return useConfigTable.spanMethod
      } else if (useConfigTable.simpleSpanMethod) {
        // 简单合并
        const spanModel = this.getSimpleSpanModel()
        return function({ row, column, rowIndex, columnIndex }) {
          const modelData = spanModel[rowIndex % spanModel.length]
          if (getType(modelData) !== 'array') {
            // 整行填充
            if (columnIndex !== modelData) {
              return {
                colspan: 0,
                rowspan: 1
              }
            } else {
              const operate = useConfigTable.operate
              const hasOperate = operate && operate.els.length > 0
              return {
                colspan: useConfigTable.rowElCount + (hasOperate ? 1 : 0),
                rowspan: 1
              }
            }
          } else {
            // 数组内容填充
            const colspan = modelData[columnIndex]
            if (colspan != null) {
              return {
                colspan,
                rowspan: 1
              }
            } else {
              return false
            }
          }
        }
      }
      return null
    },
    ...mapState({
      needTagsView: state => state.settings.tagsView
    })
  },
  destroyed() {
    this.removeStickyScrollEvent()
  },
  methods: {
    wrapFc,
    init() {
      if (this.isSticky) {
        this.initSticky()
      }
    },
    // 初始化吸顶
    initSticky() {
      // nextTick等待表格的表头渲染出高度
      this.$nextTick(() => {
        // 移除事件
        this.removeStickyScrollEvent()
        // 滚动元素
        this.scrollEl = this.$parent.$el
        // 吸顶元素
        this.stickyEl = this.scrollEl.querySelector('.el-table__header-wrapper')
        // 获取吸顶元素信息
        this.stickyElRect = this.stickyEl.getBoundingClientRect()
        // 获取定位参考元素
        this.stickyBodyEl = this.scrollEl.querySelector('.el-table__body-wrapper')
        // 监听事件
        this.addStickyScrollEvent()
      })
    },
    // 监听吸顶的滚动事件
    addStickyScrollEvent() {
      !this.isListening && this.scrollEl.addEventListener('scroll', this.handleScroll)
      this.isListening = true
    },
    // 移除吸顶的滚动事件
    removeStickyScrollEvent() {
      this.isListening && this.scrollEl.removeEventListener('scroll', this.handleScroll)
      this.isListening = false
    },
    handleScroll(e) {
      if (this.isShowForm) {
        return false
      }
      const rectInfo = this.stickyBodyEl.getBoundingClientRect()
      // 距离遮挡住的距离 距页面顶部距离 - 吸顶元素高度 - 导航栏高度
      const scrollOverTop = rectInfo.top - this.stickyElRect.height - this.navHeight
      let top = 0
      if (scrollOverTop <= 0) {
        top = -scrollOverTop
      }
      this.stickyEl.style.top = top + 'px'
    },
    getSimpleSpanModel() {
      const useConfigTable = this.useConfigTable
      return getType(useConfigTable.simpleSpanMethod) === 'function'
        ? useConfigTable.simpleSpanMethod()
        : useConfigTable.simpleSpanMethod
    },
    onCostomEvent(row, index, event) {
      this.$emit('custom', row, index, event)
    },
    onDel(row, index) {
      this.$emit('delete', row, index)
    },
    onEdit(row, index) {
      this.$emit('edit', row, index)
    },
    onSelectionChange(...rest) {
      this.$emit('table-event', 'selection-change', rest)
    },
    onSortChange(...rest) {
      this.$emit('table-event', 'sort-change', rest)
    }
  }
}
</script>

<style lang='scss'>
.model-el-table {
  &.sticky {
    position: relative;
    .el-table__header-wrapper {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      z-index: 2;
    }
  }
}
</style>
