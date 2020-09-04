/**
 * @file 模板组件类
 * @author yangshangman
 */

import systemConfig from '@/config';
import { debounce, isFunction, objectMerge } from '@/utils';
import { getPageDefaultConfig } from './model';
import ReflectRelation from './reflect';

/**
 * PageModel类声明
 */
interface PageManagerInterface {
  context: any; // 组件实例
  containerRef: Document; // 组件根节点
  useConfig: any; // 转化后使用的config
  table: table; // 列表数据及分页数据
  hasSearch: boolean; // 是否存在搜索
  isSearchExpand: boolean; // 搜索展开收起
  hasForm: boolean; // 是否存在内部表单
  isUseTabs: boolean; // 内部表单是否使用tabs形式展示

  hasScroll: boolean; // 是否存在滚动(横向超出滚动)
  sortParams: object; // 表格升降序数据
  unwatchScroll: Function | null; // 解除监听滚动函数
  scrollLeft: number; // // 横向滚动距离
  wrapWidth: string; // 表格父元素的宽度

  unwatchConfig: Function | null; // 解除监听config函数
  reflectionWatches: watches | null; // 包含 解除监听反射的 数组
  $refs: any; // 组件实例内部组件引用
  [propName: string]: any; // 其它属性
}

/**
 * 列表数据及分页数据
 */
interface table {
  isLoading: boolean, // 是否正在加载
  data: Array<any>, // 表格当前数据
  currentPage: number, // 当前页码
  pageSize: number, // 每页条数
  pageTotal: number, // 总页数
  sizes: Array<number>
}

interface watches extends Array<Function> {
  reflect?: any
}

export default class PageManager implements PageManagerInterface {
  context: any;
  containerRef!: Document;
  useConfig: any;
  table!: table;
  hasSearch!: boolean;
  isSearchExpand!: boolean;
  hasForm!: boolean;
  isUseTabs!: boolean;
  
  hasScroll!: boolean;
  sortParams!: object;
  scrollLeft!: number;
  unwatchScroll!: Function | null;
  wrapWidth!: string;
  
  unwatchConfig!: Function;
  reflectionWatches!: watches | null;
  $refs!: any;
  [propName: string]: any;
  static defaultConfig: any;
  constructor(context: any) {
    this.context = context
    this.useConfig = {}
    this.hasSearch = false
    this.isSearchExpand = false
    this.hasScroll = false
    this.hasForm = false
    this.isUseTabs = false
    this.scrollLeft = 0;
    this.wrapWidth = 'auto'
    this.initModel()
  }
  
  static setDefaultConfig(config: any) {
    this.defaultConfig = objectMerge(getPageDefaultConfig(), config)
  }

  // 初始化模型配置数据
  initModel() {
    this.setModelConfig()
    this.setModelProperty()
  }

  /**
   * 将config转化useConfig
   */
  setModelConfig() {
    const context = this.context
    const config = objectMerge(PageManager.defaultConfig, context.config)
    let elsCount = 0
    let elWidthChildrenCount = 0
    function filterEls(els: Array<any>, context: any) {
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
    
    this.setValue('useConfig', config)
    this.setValue('table', {
      isLoading: false, // 是否正在加载
      data: [], // 表格当前数据
      currentPage: 1, // 当前页码
      pageSize: config.table.pageSize, // 每页条数
      pageTotal: 0, // 总页数
      sizes: config.table.sizes
    })
  }

  /**
   * 解析useConifg设置模型属性
   */
  setModelProperty() {
    const useConfig = this.useConfig
    // 主页是否存在搜索
    this.hasSearch = !!(useConfig.searchForm?.els?.length)
    // 表格是否存在横向滚动
    this.hasScroll = useConfig.overflowScroll
    // 滚动距离
    this.setScrollLeft(this.scrollLeft || 0)
    this.hasForm = useConfig.hasForm
    // 表单页面是否使用tab
    if (useConfig.hasForm !== false) {
      const formEls = useConfig.form?.els
      this.isUseTabs = !!(formEls && formEls[0] && formEls[0].els)
    }
  }

  // 挂载后调用
  initPage() {
    this.containerRef = (this.$refs = this.context.$refs).pageModelContainer
    this.getData()
    this.initSearchSetting()
    this.initTableSetting()
    this.initWatch()
  }

  // 初始化搜索
  initSearchSetting() {
    this.isSearchExpand = this.useConfig.searchForm?.isopen
    this.$refs.psearch.init()
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
    const data = await context.$axios[useConfig.getMethod](url, requestData)
    table.currentPage = requestData.pageIndex
    table.pageTotal = data.total

    let tableData = data.data
    isFunction(useConfig.getDataCallback) && useConfig.getDataCallback.call(context, tableData)
    table.data = tableData
    context.$emit('getData', tableData)
    table.isLoading = false
  }

  getTableReqParams() {
    return {
      ...this.$refs.psearch.combineReqData(),
      ...this.sortParams,
      ...this.useConfig.otherParams
    }
  }

  // 初始化监听
  initWatch() {
    const context = this.context
    const useConfig = this.useConfig
    // 配置变化 => 重获取页面
    this.unwatchConfig && this.unwatchConfig()
    if (useConfig.isWatch) {
      this.unwatchConfig = context.$watch('useConfig', () => {
        this.initModel()
        this.search()
      }, {
        deep: true
      })
    }
    // 是否横向超出滚动
    this.unwatchScroll && this.unwatchScroll()
    if (this.hasScroll) {
      this.removeScrollListener()
      this.addScrollListener()
      this.unwatchScroll = context.$watch('table.data', {
        handler() {
          this.$nextTick(() => {
            this.manager.setTableWrapWidth()
          })
        },
        deep: true,
        immediate: true
      })
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
    if (!this.unwatchScroll) {
      this.containerRef.addEventListener('scroll', this.listenScrollFn = this.handleTableScroll.bind(this))
      window.addEventListener('resize', this.listenResizeFn = debounce(this.setTableWrapWidth.bind(this), 200))
    }
  }
  // 移除滚动事件
  removeScrollListener() {
    if (this.unwatchScroll) {
      this.unwatchScroll = null
      this.containerRef.removeEventListener('scroll', this.listenScrollFn)
      window.removeEventListener('resize', this.listenResizeFn)
    }
  }
  // 表格滚动设置左侧偏移距离
  handleTableScroll(e: any) {
    this.setScrollLeft(e?.target?.scrollLeft)
  }

  setScrollLeft(scrollLeft: number) {
    this.scrollLeft = scrollLeft
  }

  // 设置宽度
  setTableWrapWidth() {
    console.log('x')
    this.wrapWidth = 'auto'
    setTimeout(() => {
      this.wrapWidth = getComputedStyle(this.$refs.ptable.$el.querySelector('table')).width
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
    this.context.$set(this, key, value)
  }

}