<template>
  <div ref="pageModelContainer" class="page-model-container">
    <div v-show="!isShowForm" class="main-content">
      <div :style="[hasScroll ? transformScroll : '' ]">
        <!-- 头部插槽 -->
        <slot name="top" />
        <!-- 头部 -->
        <phead
          :is-search-expand.sync="isSearchExpand"
          :has-search="hasSearch"
          :use-config="useConfig"
          @add="onAdd"
          @custom="emitEvent(null, null, $event)"
        />
        <!-- 筛选 -->
        <search
          ref="search"
          :is-search-expand="isSearchExpand"
          :has-search="hasSearch"
          :use-config="useConfig"
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
        :style="[(hasScroll && wrapWidth) ? {width: wrapWidth} : '']"
      >
        <ptable
          ref="ptable"
          :table="table"
          :context="context"
          :use-config="useConfig"
          :is-show-form="isShowForm"
          @edit="onEdit"
          @delete="onDel"
          @custom="emitEvent"
          @table-event="handleTableEvent"
        />
        <!-- 表格底部插槽 -->
        <slot name="bottom" />
        <div v-if="useConfig.table.pagination" class="pagination-wrap">
          <el-pagination
            background
            :current-page="table.currentPage"
            :page-sizes="table.sizes"
            :page-size="table.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="table.pageTotal"
            @size-change="onTableSizeChange"
            @current-change="onTableCurrentChange"
          />
        </div>
      </div>
    </div>
    <!-- 表单 -->
    <PopShowForm
      v-if="useConfig.hasForm"
      ref="popShowForm"
      :has-top-close="false"
      :is-use-tabs="isUseTabs"
      @close="closeForm"
    >
      <PageForm
        ref="pageForm"
        :static-data="staticData"
        :use-config="useConfig"
        :is-use-tabs="isUseTabs"
        @success="onSuccess"
        @close="closeForm"
      />
    </PopShowForm>
    <exportForm ref="exportForm" @confirm="onExport" />
  </div>
</template>

<script>
import PageForm from './PageForm/index.vue'
import PopShowForm from './PopShowForm/index.vue'
import { phead, search, ptable, exportForm } from './components'
import { objectMerge, getType } from '@/utils'
import MODEL from './pageModelData'
import systemConfig from '@/config'
import ReflectRelation from './utils/reflect'
export default {
  name: 'PageModel',
  components: {
    PageForm, PopShowForm, phead, search, ptable, exportForm
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
      isSearchExpand: true, // 显示搜索
      isShowForm: false, // 显示表单
      context: this, // 实例
      sortParams: {}, // 排序参数
      table: {
        isLoading: false, // 是否正在加载
        data: [], // 表格当前数据
        currentPage: 1, // 当前页码
        pageSize: 15, // 每页条数
        pageTotal: 0, // 总页数
        sizes: [10, 15, 20, 30, 40, 50, 75, 100, 200]
      },
      wrapWidth: 0, // 表格实际宽度
      scrollLeft: 0, // 左侧滚动距离
      routeName: null, // 页面name
      unwatchConfig: null, // config监听函数
      unwatchScroll: null, // 滚动监听
      reflectionWatches: null, // 映射watches
      isListeningScroll: false, // 是否正在监听滚动
      isListeningResize: false // 是否正在监听resize
    }
  },
  computed: {
    useConfig() {
      const config = objectMerge(this.cloneObj(MODEL), this.config)
      let elsCount = 0
      let elWidthChildrenCount = 0
      function filterEl(els, ctx) {
        const ret = []
        for (let i = 0; i < els.length; i++) {
          const el = els[i]
          const isShow = el.isShow == null ? true : el.isShow.call(ctx)
          if (isShow) {
            if (el.children) {
              el.children = filterEl(el.children)
              elWidthChildrenCount++
            }
            ret.push(el)
            elsCount++
          }
        }
        return ret
      }
      config.table._els = filterEl(config.table.els, this)
      config.table.rowElCount = elsCount - elWidthChildrenCount
      config.getUrl = config.getUrl || config.url
      config.addUrl = config.addUrl || config.url
      config.updUrl = config.updUrl || config.url
      config.delUrl = config.delUrl || config.url
      return config
    },
    hasSearch() {
      return !!(this.useConfig.searchForm &&
        this.useConfig.searchForm.els &&
        this.useConfig.searchForm.els.length)
    },
    hasScroll() {
      return this.useConfig.overflowScroll
    },
    transformScroll() {
      return {
        transform: `translateX(${this.scrollLeft}px)`
      }
    },
    isUseTabs() {
      const formEls = this.useConfig.form.els
      return !!(formEls && formEls[0] && formEls[0].els)
    }
  },
  created() {
    this.routeName = this.$route.name
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
      scrollTop: this.$refs.pageModelContainer.scrollTop
    })
  },
  activated() {
    this.$refs.pageModelContainer.scrollTo(
      0,
      this.$store.state.page.scrollTop[this.routeName] || 0
    )
  },
  methods: {
    // 初始化页面
    init() {
      this.initSearchSetting()
      this.initTableSetting()
      this.getData()
      this.initWatch()
    },
    // 初始化搜索
    initSearchSetting() {
      this.isSearchExpand = this.useConfig.searchForm?.isopen
      this.$refs.search.init()
    },
    // 初始化表格
    initTableSetting() {
      const table = this.useConfig.table
      table?.pageSize && (this.table.pageSize = table.pageSize)
      table?.sizes && (this.table.sizes = table.sizes)
      this.$refs.ptable.init()
    },
    // 获取列表数据
    getData() {
      const useConfig = this.useConfig
      if (useConfig.waitParams && !useConfig.otherParams) {
        setTimeout(() => {
          this.getData()
        }, 20)
      } else {
        useConfig.getUrl && this.search()
      }
    },
    // 初始化监听
    initWatch() {
      // 配置变化 => 重获取页面
      const useConfig = this.useConfig
      if (useConfig.isWatch) {
        this.unwatchConfig && this.unwatchConfig()
        this.unwatchConfig = this.$watch('useConfig', function(val) {
          this.search()
        }, {
          deep: true
        })
      }
      // 是否滚动
      if (this.hasScroll) {
        this.unwatchScroll && this.unwatchScroll()
        this.unwatchScroll = this.$watch('table.data', {
          handler(val) {
            this.$nextTick(() => {
              this.setTableWidth()
            })
          },
          deep: true
        })
        // 监听滚动
        this.removeScroll()
        this.addScroll()
        // 监听resize
        this.removeResize()
        this.addResize()
      }
      // 是否映射
      if (useConfig.reflect) {
        const reflections = this.reflections
        const reflect = new ReflectRelation()
        reflect.collectRelations(useConfig)
        if (this.reflectionWatches) {
          this.reflectionWatches.forEach(unwatch => {
            unwatch()
          })
          this.reflectionWatches.reflect.destroyed()
          this.reflectionWatches = null
        }
        this.reflectionWatches = Object.keys(reflections).map(key => {
          return this.$watch(`reflections.${key}`, {
            handler(val) {
              reflect.getRelations(key).forEach(keys => {
                let data = useConfig
                keys.forEach(k => {
                  data = data[k]
                })
                data[keys.reflectChangeKey] = val
              })
            },
            deep: true,
            immediate: true
          })
        })
        this.reflectionWatches.reflect = reflect
      }
    },
    // 监听滚动事件
    addScroll() {
      !this.isListeningScroll &&
        this.$refs.pageModelContainer.addEventListener('scroll', this.handleTableScroll)
      this.isListeningScroll = true
    },
    // 移除滚动事件
    removeScroll() {
      this.isListeningScroll &&
        this.$refs.pageModelContainer.removeEventListener('scroll', this.handleTableScroll)
      this.isListeningScroll = false
    },
    // 表格滚动设置左侧偏移距离
    handleTableScroll(e) {
      this.scrollLeft = e.target.scrollLeft
    },
    // 监听resize
    addResize() {
      !this.isListeningResize && window.addEventListener('resize', this.handleTableResize)
      this.isListeningResize = true
    },
    // 移除resize
    removeResize() {
      this.isListeningResize && window.removeEventListener('resize', this.handleTableResize)
      this.isListeningResize = false
    },
    // 设置宽度
    handleTableResize() {
      this.wrapWidth = 'auto'
      setTimeout(() => {
        this.setTableWidth()
      }, 50)
    },
    // 重新开始执行查询 设置页数为1
    search() {
      this.table.currentPage = 1
      this.refreshTableData()
      this.emitEvent(null, null, '_search')
    },
    onTableSizeChange(val) {
      this.table.currentPage = 1
      this.table.pageSize = val
      this.refreshTableData()
    },
    // 页码点击事件
    onTableCurrentChange(val) {
      this.$refs.pageModelContainer.scrollTo(0, 0)
      this.getTableData(val)
    },
    activated() {
      this.addScroll()
      this.addResize()
    },
    deactivated() {
      this.removeScroll()
      this.removeResize()
    },
    destroyed() {
      this.removeScroll()
      this.removeResize()
      this.reflectionWatches && this.reflectionWatches.reflect.destroy()
    },
    // 设置获取到的表格的实际宽度
    setTableWidth() {
      this.wrapWidth = getComputedStyle(this.$refs.ptable.$el.querySelector('table')).width
    },
    /**
     * appendKeyInfo 识别字段
     * appendInfo 需要添加的字段
     * data 添加数据列表
    */
    appendData(appendKeyInfo = {}, appendInfo = {}, data = []) {
      const list = this.table.data.map(item => {
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
      this.table.data = data
    },
    // 触发事件
    emitEvent(row, $index, event) {
      this.$emit(event, row, $index)
    },
    // 表格事件
    handleTableEvent(e, params) {
      this.$emit(e, ...params)
      if (e === 'sort-change') {
        this.onSortChange(...params)
      }
    },
    // sort排序
    onSortChange({ column, prop, order }) {
      let data = {}
      if (order) {
        const table = this.useConfig.table
        const sortOrders = table['sort-orders']
        const valueIndex = sortOrders.findIndex(value => value === order)
        const columnData = table.els.find(item => item.label === column.label)
        data = columnData.sortValue[valueIndex]
      }
      this.sortParams = data
      this.refreshTableData()
    },
    getSearchData() {
      return this.$refs.search.combineReqData()
    },
    // 获取表格数据
    async getTableData(pageIndex) {
      const table = this.table
      table.isLoading = true

      const useConfig = this.useConfig
      const url = useConfig.getUrl
      const requestData = Object.assign({
        pageIndex: pageIndex || 1,
        pageSize: table.pageSize
      }, this.getTableReqParams())

      const data = await this.$axios.get(url, requestData)
      table.currentPage = requestData.pageIndex
      table.pageTotal = data.total

      let tableData = data.data
      if (getType(useConfig.getDataCallback) === 'function') {
        tableData = useConfig.getDataCallback.call(this, tableData)
      }
      this.$emit('getData', tableData)
      this.table.data = tableData
      table.isLoading = false
    },
    getTableReqParams() {
      return {
        ...this.getSearchData(),
        ...this.sortParams,
        ...this.useConfig.otherParams
      }
    },
    // 刷新数据
    refreshTableData() {
      return this.getTableData(this.table.currentPage)
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
      let url = this.useConfig.exportUrl
      if (url) {
        this.useConfig.exportParams || {}
        url = systemConfig.baseUrl + url + '?'
        const sizeParams = mode === 0
          ? {
            pageIndex: this.table.currentPage,
            pageSize: this.table.pageSize
          }
          : {
            queryAll: 1
          }
        const exportData = Object.assign(this.getTableReqParams() || {}, this.useConfig.exportParams || {}, sizeParams)
        for (const k in exportData) {
          const value = exportData[k]
          if (value != null) {
            url += `${k}=${encodeURIComponent(value)}&`
          }
        }
        location.href = url.substr(0, url.length - 1)
      }
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
      await this.$axios.delete(useConfig.delUrl, {
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
@import './styles/index.scss';
.page-model-container {
  height: calc(100vh - 50px);
  position: relative;
  overflow-x: auto;
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
  .page-model-container {
    height: calc(100vh - 84px);
  }
}
</style>
