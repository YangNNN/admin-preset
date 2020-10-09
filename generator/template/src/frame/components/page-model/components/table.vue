<template>
  <el-table
    ref="el-table"
    v-loading="tableManager.table.isLoading"
    :size="tableManager.size"
    :header-cell-style="tableManager.headerCellStyle"
    :class="['model-el-table', {sticky: tableManager.isSticky}]"
    :style="{paddingTop: tableManager.isSticky ? tableManager.stickyElHeight + 'px' : null}"
    :data="showTableData"
    :border="tableManager.border"
    :element-loading-text="tableManager.elementLoadingText"
    :span-method="tableManager.spanMethod"
    @selection-change="onSelectionChange"
    @sort-change="onSortChange"
  >
    <el-table-column
      v-if="tableManager.hasSelect"
      type="selection"
      width="55"
      :selectable="tableManager.selectable"
    />

    <!-- 左侧操作栏 -->
    <operate
      v-if="operateManager && operateManager.isLeft"
      :operate="operateManager.operate"
      @costom="onCostomEvent"
      @del="onDel"
      @edit="onEdit"
    />

    <!-- 表格列表 -->
    <column
      v-for="(column, index) in tableManager.columns"
      :key="index"
      :column="column"
    />

    <!-- 右侧操作栏 -->
    <operate
      v-if="operateManager && !operateManager.isLeft"
      :operate="operateManager.operate"
      @costom="onCostomEvent"
      @del="onDel"
      @edit="onEdit"
    />

  </el-table>
</template>

<script>
import { getType } from '@/utils'
import provideMixin from '../utils/provide-mixin'
import column from './column'
import operate from './operate'
import { mapState } from 'vuex'
export default {
  mixins: [provideMixin],
  components: {
    column, operate
  },
  props: {
    isShowForm: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  computed: {
    tableManager() {
      return this.manager.tableManager
    },
    operateManager() {
      return this.tableManager.operateManager
    },
    showTableData() {
      const { repeatTimes, table } = this.tableManager
      if (!repeatTimes) return table.data
      return this.table.data.reduce((data, item) => {
        return data.concat(Array(repeatTimes).fill(item))
      }, [])
    },
    // sticky的时候计算高度需要用到
    navHeight() {
      let height = 0
      if (this.needTagsView) {
        height += 34
      }
      return height + 50
    },
    ...mapState({
      needTagsView: state => state.settings.tagsView
    })
  },
  created() {
    this.tableManager.setValue('context', this)
  },
  destroyed() {
    this.tableManager.removeStickyScrollEvent()
  },
  methods: {
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
