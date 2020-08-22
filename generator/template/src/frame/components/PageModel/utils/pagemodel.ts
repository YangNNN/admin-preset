import systemConfig from '@/config';
import { getModel } from '@/frame/components/PageModel/pageModelData.js';
import { getType, objectMerge } from '@/utils/index.js';
import ReflectRelation from './reflect';

function isFunction(func: any) {
  return getType(func) === 'function'
}

interface watches extends Array<Function> {
  reflect?: any
}

interface table {
  isLoading: boolean, // 是否正在加载
  data: Array<any>, // 表格当前数据
  currentPage: number, // 当前页码
  pageSize: number, // 每页条数
  pageTotal: number, // 总页数
  sizes: Array<number>
}

interface context {}

export default class PageModel {
  context: any;
  useConfig: any;
  table!: table;
  hasSearch!: Boolean;
  isSearchExpand!: Boolean;
  hasScroll!: Boolean;
  isUseTabs!: Boolean;
  scrollLeft!: Number;
  transformScroll!: object;
  sortParams!: object;
  unwatchConfig!: Function;
  unwatchScroll!: Function;
  isListenScroll!: Boolean;
  containerRef!: Document;
  wrapWidth!: string;
  reflectionWatches!: watches | null;
  [propName: string]: any;
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
    this.table = {
      isLoading: false, // 是否正在加载
      data: [], // 表格当前数据
      currentPage: 1, // 当前页码
      pageSize: config.table.pageSize, // 每页条数
      pageTotal: 0, // 总页数
      sizes: config.table.sizes
    }
    this.setModelProperty()
  }

  // 设置模型属性
  setModelProperty() {
    const useConfig = this.useConfig
    // 主页是否存在搜索
    this.hasSearch = !!(useConfig.searchForm?.els?.length)
    // 表格是否存在横向滚动
    this.hasScroll = useConfig.overflowScroll
    // 滚动距离
    this.scrollLeft = this.scrollLeft || 0
    this.transformScroll = {
      transform: `translateX(${this.scrollLeft}px)`
    }
    // 表单页面是否使用tab
    if (useConfig.hasForm !== false) {
      const formEls = useConfig.form?.els
      this.isUseTabs = !!(formEls && formEls[0] && formEls[0].els)
    }
  }

  // 挂载后调用
  init() {
    this.containerRef = this.context.$refs.pageModelContainer
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
    const table = this.table
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
    this.table.currentPage = 1
    this.refreshTableData()
    this.context.emitEvent(null, null, '_search')
  }

  // 刷新数据
  refreshTableData() {
    return this.getTableData(this.table.currentPage)
  }

  // 获取表格数据
  async getTableData(pageIndex: Number) {
    const context = this.context
    const useConfig = this.useConfig
    const table = this.table
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
    // 是否横向超出滚动
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
      this.removeScrollListener()
      this.addScrollListener()
    }
    // 是否映射
    if (useConfig.reflect) {
      const reflections = context.reflections
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
        return context.$watch(`reflections.${key}`, {
          handler(val: any) {
            (reflect.getRelations(key) || []).forEach(keys => {
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
  }

  // 监听滚动事件
  addScrollListener() {
    if (!this.isListenScroll) {
      this.containerRef.addEventListener('scroll', this.handleTableScroll)
      window.addEventListener('resize', this.handleTableResize)
    }
  }
  // 移除滚动事件
  removeScrollListener() {
    if (this.isListenScroll) {
      this.containerRef.removeEventListener('scroll', this.handleTableScroll)
      window.removeEventListener('resize', this.handleTableResize)
    }
  }
  // 表格滚动设置左侧偏移距离
  handleTableScroll(e: any) {
    this.scrollLeft = e?.target?.scrollLeft
  }
  // 设置宽度
  handleTableResize() {
    this.wrapWidth = 'auto'
    setTimeout(() => {
      this.wrapWidth = getComputedStyle(this.context.$refs.ptable.$el.querySelector('table')).width
    }, 50)
  }
  export(mode: 0 | 1) {
    const useConfig = this.useConfig
    let url = this.useConfig.exportUrl
    if (!url) return
    url = systemConfig.baseUrl + url + '?'
    const sizeParams = mode === 0 ? {
      pageIndex: this.table.currentPage,
      pageSize: this.table.pageSize
    } : {
      queryAll: 1
    }
    const exportData = Object.assign(
      this.getTableReqParams(),
      useConfig.exportParams,
      sizeParams
    )
    for (const k in exportData) {
      const value = exportData[k]
      if (value != null) {
        url += `${k}=${encodeURIComponent(value)}&`
      }
    }
    location.href = url.substr(0, url.length - 1)
  }

  destroyed() {
    this.reflectionWatches?.reflect?.destroyed()
  }

  setValue(key: string, value: any) {
    this[key] = value
  }

}