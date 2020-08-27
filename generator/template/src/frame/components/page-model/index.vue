<template>
  <div ref="pageModelContainer" class="pagemodel-container">
    <div v-show="!isShowForm" class="main-content">
      <div :style="[pagemodel.transformScroll]">
        <!-- 头部插槽 -->
        <slot name="top" />
        <!-- 头部 -->
        <phead
          @add="onAdd"
          @custom="emitEvent(null, null, $event)"
        />
        <!-- 筛选 -->
        <psearch
          ref="psearch"
          :static-data="staticData"
          @search="search"
          @export="showExport"
        />
        <!-- 中间插槽 -->
        <slot name="middle" />
      </div>
      <!-- 表格数据 -->
      <div
        class="table-wrap"
        :style="{ width: pagemodel.wrapWidth }"
      >
        <ptable
          ref="ptable"
          :is-show-form="isShowForm"
          @edit="onEdit"
          @delete="onDel"
          @custom="emitEvent"
          @table-event="handleTableEvent"
        />
        <!-- 表格底部插槽 -->
        <slot name="bottom" />
      </div>
      <div v-if="pagemodel.useConfig.table.pagination" class="pagination-wrap" :style="[pagemodel.transformScroll]">
        <el-pagination
          background
          :current-page="pagemodel.table.currentPage"
          :page-sizes="pagemodel.table.sizes"
          :page-size="pagemodel.table.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagemodel.table.pageTotal"
          @size-change="onTableSizeChange"
          @current-change="onTableCurrentChange"
        />
      </div>
    </div>
    <!-- 表单 -->
    <pop-show-form
      v-if="pagemodel.hasForm"
      ref="popShowForm"
      :has-top-close="false"
      :is-use-tabs="pagemodel.isUseTabs"
      @close="closeForm"
    >
      <page-form
        ref="pageForm"
        :static-data="staticData"
        @success="onSuccess"
        @close="closeForm"
      />
    </pop-show-form>
    <exportForm ref="exportForm" @confirm="onExport" />
  </div>
</template>

<script>
import PageForm from './page-form/index.vue'
import PopShowForm from './pop-show-form/index.vue'
import { phead, psearch, ptable, exportForm } from './components'
import systemConfig from '@/config'
import PageModel from './utils/pagemodel'
import { mapState } from 'vuex'

export default {
  name: 'page-model',
  components: {
    PageForm, PopShowForm, phead, psearch, ptable, exportForm
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    staticData: {
      type: Object,
      default: () => {}
    },
    // 映射数据源
    reflections: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      provideData: {
        pagemodel: {}
      },
      isShowForm: false,
      pagemodel: {}, // 组件实例
      routeName: '' // 页面name
    }
  },
  computed: {
    ...mapState({
      scrollTop: state => state.page.scrollTop
    })
  },
  provide() {
    return {
      provideData: this.provideData
    }
  },
  created() {
    this.routeName = this.$route.name
    this.provideData.pagemodel = this.pagemodel = new PageModel(this)
  },
  mounted() {
    if (this.pagemodel.useConfig.init) {
      this.init()
    }
  },
  deactivated() {
    // 存储位置信息
    this.$store.commit('page/SET_SCROLL_TOP', {
      name: this.routeName,
      scrollTop: this.pagemodel.containerRef.scrollTop
    })
  },
  activated() {
    this.scrollTo(this.scrollTop[this.routeName] || 0)
  },
  methods: {
    // 初始化页面
    init() {
      this.pagemodel.init()
    },
    scrollTo(scrollTop) {
      this.pagemodel.containerRef.scrollTo(0, scrollTop)
    },
    // 重新开始执行查询 设置页数为1
    search() {
      this.pagemodel.search()
    },
    onTableSizeChange(val) {
      const table = this.pagemodel.table
      table.currentPage = 1
      table.pageSize = val
      this.refreshTableData()
    },
    // 刷新数据
    refreshTableData() {
      return this.pagemodel.refreshTableData()
    },
    // 页码点击事件
    onTableCurrentChange(val) {
      this.scrollTo(0)
      this.pagemodel.getTableData(val)
    },
    activated() {
      this.pagemodel.addScrollListener()
    },
    deactivated() {
      this.pagemodel.removeScrollListener()
    },
    destroyed() {
      this.pagemodel.removeScrollListener()
      this.pagemodel.destroyed()
    },
    /**
     * appendKeyInfo 识别字段
     * appendInfo 需要添加的字段
     * data 添加数据列表
    */
    appendData(appendKeyInfo = {}, appendInfo = {}, data = []) {
      const list = this.pagemodel.table.data.map(item => {
        const info = data.find(iitem => item[appendKeyInfo.to] === iitem[appendKeyInfo.from])
        if (info) {
          for (const k in appendInfo) {
            item[k] = info[appendInfo[k]]
          }
        }
        return item
      })
      this.setData(list)
    },
    // 设置新数据
    setData(data) {
      this.pagemodel.table.data = data
    },
    // 触发事件
    emitEvent(row, $index, event) {
      this.$emit(event, row, $index)
    },
    // 表格事件
    handleTableEvent(e, params) {
      this.$emit(e, ...params)
      switch (e) {
        case sort-change:
          this.onSortChange(...params)
          break;
      }
    },
    // sort排序
    onSortChange({ column, prop, order }) {
      let data = {}
      if (order) {
        const table = this.pagemodel.useConfig.table
        const valueIndex = table['sort-orders'].findIndex(value => value === order)
        const columnData = table.els.find(item => item.label === column.label)
        data = columnData.sortValue[valueIndex]
      }
      this.pagemodel.sortParams = data
      this.refreshTableData()
    },
    // 显示新增弹出层
    onAdd() {
      this.$refs.popShowForm.show()
      this.isShowForm = true
      this.$nextTick(() => {
        this.$refs.pageForm.resetValue()
      })
    },
    // 显示修改弹出层
    onEdit(item, index) {
      this.$refs.popShowForm.show()
      this.isShowForm = true
      this.$nextTick(() => {
        this.$refs.pageForm.setValue(item)
      })
    },
    closeForm() {
      this.$refs.popShowForm.hide()
      this.isShowForm = false
      this.emitEvent(null, null, '_close')
    },
    showExport() {
      this.$refs.exportForm.show()
    },
    onExport(mode) {
      this.pagemodel.export(mode)
    },
    // 添加 && 修改操作
    onSuccess() {
      this.refreshTableData()
      this.closeForm()
      this.emitEvent(null, null, '_updAddSuccess')
    },
    // 删除操作
    async onDel(row) {
      await this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        type: 'warning'
      })
      const useConfig = this.pagemodel.useConfig
      const delKey = useConfig.delKey
      await this.$axios[useConfig.delMethod](useConfig.delUrl, {
        [delKey]: row[delKey]
      })
      this.$message.success('删除成功!')
      this.emitEvent(null, null, '_delSuccess')
      this.refreshTableData()
    }
  }
}
</script>

<style lang="scss">
.pagemodel-container {
  height: calc(100vh - 50px);
  position: relative;
  overflow-x: auto;
  .model-form {
    .el-input, .el-select {
      width: 100%;
    }
  }
  .main-content {
    padding: 0 30px;
    .table-wrap {
      padding-top: 15px;
      .el-table--scrollable-x .el-table__body-wrapper {
        overflow: hidden;
      }
    }
    .pagination-wrap {
      padding: 10px 20px 20px 0;
      flex-shrink: 0;
      text-align: right;
    }
  }
  .import-file {
    position: absolute;
    z-index: -1;
    left: -999px;
    top: -999px;
    opacity: 0;
  }
}
.hasTagsView {
  .pagemodel-container {
    height: calc(100vh - 84px);
  }
}
</style>
