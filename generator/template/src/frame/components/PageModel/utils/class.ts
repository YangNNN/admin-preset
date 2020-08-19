import { getModel } from '@/frame/components/PageModel/utils/pageModelData.js';
import { getType, objectMerge } from '@/utils/index.js';

function isFunction(func: any) {
  return getType(func) === 'function'
}

interface context {}

export default class PageModel {
  context: any;
  useConfig: any;
  hasSearch!: Boolean;
  isSearchExpand!: Boolean;
  hasScroll!: Boolean;
  isUseTabs!: Boolean;
  scrollLeft!: Number;
  transformScroll!: object;
  sortParams!: object;
  unwatchConfig!: Function;
  unwatchScroll!: Function;
  constructor(context: context) {
    this.context = context
    this.generateConfig()
  }
  // 生成内部使用的配置数据
  generateConfig() {
    const context = this.context
    const config = objectMerge(getModel(), context.config)
    let elsCount = 0
    let elWidthChildrenCount = 0
    function filterEls(els: Array<any>, context: context) {
      const ret = []
      for (let i = 0; i < els.length; i++) {
        const el = els[i]
        const isShow = el.isShow === void undefined ? true : el.isShow.call(context)
        if (isShow) {
          if (el.children) {
            el.children = filterEls(el.children, context)
            elWidthChildrenCount++
          }
          ret.push(el)
          elsCount++
        }
      }
      return ret
    }
    config.table._els = filterEls(config.table.els, context)
    config.table.rowElCount = elsCount - elWidthChildrenCount
    config.getUrl = config.getUrl || config.url
    config.addUrl = config.addUrl || config.url
    config.updUrl = config.updUrl || config.url
    config.delUrl = config.delUrl || config.url
    this.useConfig = config
    this.setModelProperty()
  }
  // 设置模型属性
  setModelProperty() {
    const useConfig = this.useConfig
    // 主页是否存在搜索
    this.hasSearch = !!(useConfig.searchForm &&
      useConfig.searchForm.els &&
      useConfig.searchForm.els.length)
    // 表格是否存在横向滚动
    this.hasScroll = useConfig.overflowScroll
    // 滚动距离
    this.scrollLeft = this.scrollLeft || 0
    this.transformScroll = {
      transform: `translateX(${this.scrollLeft}px)`
    }
    // 表单页面是否使用tab
    const formEls = useConfig.form.els
    this.isUseTabs = !!(formEls && formEls[0] && formEls[0].els)
  }
  // 挂载后调用
  init() {
    this.initSearchSetting()
    this.initTableSetting()
    this.getData()
    this.initWatch()
  }
  // 初始化搜索
  initSearchSetting() {
    this.isSearchExpand = this.useConfig.searchForm?.isopen
    this.context.$refs.search.init()
  }
  // 初始化表格 设置表格页数
  initTableSetting() {
    const context = this.context
    const userConfigTable = this.useConfig.table
    const table = context.table
    userConfigTable?.pageSize && (table.pageSize = userConfigTable.pageSize)
    userConfigTable?.sizes && (table.sizes = userConfigTable.sizes)
    context.$refs.ptable.init()
  }
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
  }
  // 重新开始执行查询 设置页数为1
  search() {
    const context = this.context
    context.table.currentPage = 1
    this.refreshTableData()
    context.emitEvent(null, null, '_search')
  }
  // 刷新数据
  refreshTableData() {
    return this.getTableData(this.context.table.currentPage)
  }
  // 获取表格数据
  async getTableData(pageIndex: Number) {
    const context = this.context
    const useConfig = this.useConfig
    const table = context.table
    table.isLoading = true
    const url = useConfig.getUrl
    const requestData = Object.assign({
      pageIndex: pageIndex || 1,
      pageSize: table.pageSize
    }, this.getTableReqParams())

    const data = await context.$axios.get(url, requestData)
    table.currentPage = requestData.pageIndex
    table.pageTotal = data.total

    let tableData = data.data
    isFunction(useConfig.getDataCallback) && useConfig.getDataCallback.call(context, tableData)
    context.$emit('getData', tableData)
    table.data = tableData
    table.isLoading = false
  }
  getTableReqParams() {
    return {
      ...this.getSearchData(),
      ...this.sortParams,
      ...this.useConfig.otherParams
    }
  }
  getSearchData() {
    return this.context.$refs.search.combineReqData()
  }

  // 初始化监听
  initWatch() {
    const context = this.context
    const useConfig = this.useConfig
    // 配置变化 => 重获取页面
    this.unwatchConfig && this.unwatchConfig()
    if (useConfig.isWatch) {
      this.unwatchConfig = context.$watch('useConfig', () => {
        this.search()
      }, {
        deep: true
      })
    }
    // 是否滚动
    this.unwatchScroll && this.unwatchScroll()
    if (this.hasScroll) {
      this.unwatchScroll = context.$watch('table.data', {
        handler() {
          this.$nextTick(() => {
            this.setTableWidth()
          })
        },
        deep: true
      })
      // 监听滚动
    //   this.removeScroll()
    //   this.addScroll()
    //   // 监听resize
    //   this.removeResize()
    //   this.addResize()
    // }
    // // 是否映射
    // if (useConfig.reflect) {
    //   const reflections = this.reflections
    //   const reflect = new ReflectRelation()
    //   reflect.collectRelations(useConfig)
    //   if (this.reflectionWatches) {
    //     this.reflectionWatches.forEach(unwatch => {
    //       unwatch()
    //     })
    //     this.reflectionWatches.reflect.destroyed()
    //     this.reflectionWatches = null
    //   }
    //   this.reflectionWatches = Object.keys(reflections).map(key => {
    //     return this.$watch(`reflections.${key}`, {
    //       handler(val) {
    //         reflect.getRelations(key).forEach(keys => {
    //           let data = useConfig
    //           keys.forEach(k => {
    //             data = data[k]
    //           })
    //           data[keys.reflectChangeKey] = val
    //         })
    //       },
    //       deep: true,
    //       immediate: true
    //     })
    //   })
    //   this.reflectionWatches.reflect = reflect
    }
  }
}