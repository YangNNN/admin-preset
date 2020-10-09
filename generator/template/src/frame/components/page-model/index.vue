<template>
  <div ref="pageModelContainer" class="manager-container">
    <div v-show="formManager.isDialog || !isShowForm" class="main-content">
      <div :style="[transformScroll]">
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
        :style="{ width: tableManager.wrapWidth }"
      >

        <!-- 表格列表插槽 -->
        <slot name="table">
          <ptable
            ref="ptable"
            :is-show-form="isShowForm"
            @edit="onEdit"
            @delete="onDel"
            @custom="emitEvent"
            @table-event="handleTableEvent"
          />
        </slot>

        <!-- 表格底部插槽 -->
        <slot name="bottom" />
      </div>
      <div v-if="tableManager.configTable.pagination" class="pagination-wrap" :style="[transformScroll]">
        <el-pagination
          background
          :current-page="tableManager.table.currentPage"
          :page-sizes="tableManager.table.sizes"
          :page-size="tableManager.table.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableManager.table.pageTotal"
          @size-change="onTableSizeChange"
          @current-change="onTableCurrentChange"
        />
      </div>
    </div>

    <!-- 表单 -->
    <pop-show-form
      v-if="formManager.hasForm"
      ref="popShowForm"
      :has-top-close="false"
      :is-use-tabs="formManager.isUseTabs"
      :dialog="dialog"
      @close="closeForm"
    >
      <pform
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
import PopShowForm from './pop-show-form/index.vue'
import { phead, psearch, ptable, exportForm, pform } from './components'
import systemConfig from '@/config'
import PageManager from './instance/manager'
import { objectMerge, jsonClone, getType } from '@/utils'
import { mapState } from 'vuex'

export default {
  name: 'page-model',
  components: {
    PopShowForm, phead, psearch, ptable, exportForm, pform
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
      isinit: false,
      provideData: {
        manager: {}
      },
      isShowForm: false,
      dialog: {},
      manager: {}, // 组件实例
      routeName: '' // 页面name
    }
  },
  computed: {
    useConfig() {
      // 合并默认配置
      const config = objectMerge(jsonClone(PageManager.defaultConfig), this.config)

      // 设置请求url
      config.getUrl = config.getUrl || config.url
      config.addUrl = config.addUrl || config.url
      config.updUrl = config.updUrl || config.url
      config.delUrl = config.delUrl || (config.url ? config.url + `/:${config.delKey}` : '')
      config.detailUrl = config.detailUrl || (config.url ? config.url + `/:${config.detailKey}` : '')

      console.log('useconfig computed!')

      return config
    },
    tableManager() {
      return this.manager.tableManager
    },
    formManager() {
      return this.manager.formManager
    },
    transformScroll() {
      return {
        transform: `translateX(${this.tableManager.scrollLeft}px)`
      }
    },
    ...mapState({
      scrollTop: state => state.page.scrollTop
    })
  },
  provide() {
    return {
      provideData: this.provideData
    }
  },
  watch: {
    useConfig: {
      handler(config) {
        this.manager.updateConfig && this.manager.updateConfig(config)
      },
      deep: true
    }
  },
  created() {
    this.routeName = this.$route.name
    this.provideData.manager = this.manager = new PageManager(this)
  },
  mounted() {
    if (this.useConfig.init) {
      this.init()
    }
  },
  deactivated() {
    // 存储位置信息
    this.$store.commit('page/SET_SCROLL_TOP', {
      name: this.routeName,
      scrollTop: this.manager.containerRef.scrollTop
    })
  },
  activated() {
    this.scrollTo(this.scrollTop[this.routeName] || 0)
  },
  methods: {
    // 初始化页面
    init() {
      this.manager.initPage()
      this.isinit = true
    },
    scrollTo(scrollTop) {
      this.manager.containerRef.scrollTo(0, scrollTop)
    },
    // 重新开始执行查询 设置页数为1
    search() {
      this.tableManager.search()
    },
    onTableSizeChange(val) {
      const { table } = this.tableManager
      table.currentPage = 1
      table.pageSize = val
      this.refreshTableData()
    },
    // 刷新数据
    refreshTableData() {
      return this.tableManager.refreshTableData()
    },
    // 页码点击事件
    onTableCurrentChange(val) {
      this.scrollTo(0)
      this.tableManager.getTableData(val)
    },
    activated() {
      this.tableManager.addScrollListener()
    },
    deactivated() {
      this.tableManager.removeScrollListener()
    },
    destroyed() {
      this.tableManager.removeScrollListener()
    },
    /**
     * appendKeyInfo 识别字段
     * appendInfo 需要添加的字段
     * data 添加数据列表
    */
    appendData(appendKeyInfo = {}, appendInfo = {}, data = []) {
      const list = this.tableManager.table.data.map(item => {
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
      this.tableManager.table.data = data
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
        const { configTable } = this.tableManager
        const valueIndex = configTable['sort-orders'].findIndex(value => value === order)
        const columnData = configTable.els.find(item => item.label === column.label)
        data = columnData.sortValue[valueIndex]
      }
      this.tableManager.sortParams = data
      this.refreshTableData()
    },
    showForm(data) {
      const formManager = this.formManager
      if (formManager.isDialog) {
        let dialog = formManager.dialog
        const title = getType(dialog.title) === 'function' ? dialog.title.call(this, { ...data } || {}) : dialog.title
        this.dialog = {
          isDialog: true,
          ...dialog,
          title
        }
      }
      this.$refs.popShowForm.show()
      this.isShowForm = true
      this.$nextTick(() => {
        const $pageForm = this.$refs.pageForm
        !data ? $pageForm.resetValue() : $pageForm.setValue(data)
      })
    },
    // 显示新增弹出层
    onAdd() {
      this.showForm()
    },
    // 显示修改弹出层
    onEdit(item, index) {
      this.showForm(item)
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
      this.manager.export(mode)
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
      const useConfig = this.useConfig
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
.manager-container {
  height: 100%;
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
  .manager-container {
    height: calc(100vh - 84px);
  }
}
</style>
