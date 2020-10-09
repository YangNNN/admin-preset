/**
 * @file 表格管理
 * @author yangshangman
 */
import { debounce, getType, isFunction } from '@/utils'
import { wrapFc } from '../../utils'
import { configInterface, OperateInstance, PageManagerInterface, TableEls, TableInstance } from '../interface'
import ManagerAccepter from '../manager-accepter'
import Operate from '../operate'

/**
 * 吸顶滚动回调函数
 * @param this TableInstance
 */
function handleScrollVertical(this: TableInstance) {

  // 元素未初始化 或者 显示表单的时候不执行
  if (!this.stickyEl || !this.stickyBodyEl || this.context.isShowForm) return

  // 获取辅助定位元素的位置信息
  const rectInfo = this.stickyBodyEl.getBoundingClientRect()

  // 距离遮挡住的距离 距页面顶部距离 - 吸顶元素高度 - 导航栏高度
  const scrollOverTop = rectInfo.top - this.stickyElHeight - this.context.navHeight
  
  // 设置目标元素top位置
  let top = 0
  if (scrollOverTop <= 0) {
    top = -scrollOverTop
  }
  this.stickyEl.style.top = top + 'px'
  
}

/**
 * 表格滚动事件
 * @param this TableInstance
 * @param e 滚动事件
 */
function handleScrollHorizontal(this: TableInstance, e: any) {
  this.setScrollLeft(e?.target?.scrollLeft)
}


/**
 * 表格管理器
 */
export default class Table extends ManagerAccepter implements TableInstance {

  context: any // table组件实例
  operateManager?: OperateInstance // 操作栏实例
  configTable: configInterface['table'] = {} // useConfig中的table配置
  
  size?: string = '' // 尺寸
  border: boolean = false // 边框
  elementLoadingText: string = '' // 加载中文字
  hasSelect: boolean = false // 是否有selection
  selectable?: Function // Function(row, index)Function 的返回值用来决定这一行的 CheckBox 是否可以勾选

  table = { // 列表数据
    isLoading: false, // 是否正在加载
    data: [], // 表格当前数据
    currentPage: 1, // 当前页码
    pageSize: 15, // 每页条数
    pageTotal: 0, // 总页数
    sizes: [] // 页数列表
  }

  rowElCount: number = 0 // 当前展示的元素数量

  columns: TableEls = [] // 当前列表元素

  hasScroll: boolean = false // 是否横向滚动
  scrollHandler: any = null // 滚动回调
  resizeHandler: any = null // resize回调
  scrollLeft: number = 0 // 滚动值
  wrapWidth: string = 'auto' // 表格父元素宽度

  isSticky: boolean = false // 表头是否吸顶
  tableScrollHandler: any = null // container滚动回调
  stickyEl: HTMLDivElement | null = null // 吸顶的表头 => el-table__header-wrapper
  stickyElHeight = 0 // 吸顶元素高度
  stickyBodyEl: HTMLDivElement | null = null // 表格元素

  sortParams: { [prop: string]: any } = {} // 表格升降序数据

  hasOperate: boolean = false // 表格是否存在操作栏

  repeatTimes: number = 0 // 表格数据重复渲染次数 => 用于合并单元格
  spanMethod: Function | null = null // 单元格合并策略

  headerCellStyle: object = {} // 单元格样式

  constructor(pagemodel: PageManagerInterface) {
    // 继承父类
    super(pagemodel)
    // 继承完后初始化
    this.init()
  }
  stickyElRect: any
  
  /**
   * 实例初始化
   */
  init() {
    this.setConfigTable()
    this.initColumns()
    this.initTable()
    this.initStyle()
    this.initOperate()
    this.initSpanMethod()
    this.initOtherStatus()
  }

  /**
   * 配置有更新
   */
  updateConfig() {
    this.setConfigTable()
    this.initColumns()
    this.initTable()
    this.initStyle()
    this.initOperate()
    this.initSpanMethod()
    this.initOtherStatus()
  }

  /**
   * 从useConfig中取出表格配置
   */
  setConfigTable() {
    this.configTable = this.pagemodel.useConfig.table
  }

  /**
   * 页面挂载初始化
   */
  initPage() {

    // 吸顶
    if (this.isSticky) {
      this.initSticky()
    }

    // 超出滚动
    if (this.hasScroll) {
      this.addScrollListener()
    }

  }

  /**
   * 初始化样式相关
   */
  initStyle() {
    this.headerCellStyle = this.configTable?.headerCellStyle || {
      color: '#333',
      backgroundColor: 'rgb(247, 248, 250)'
    }
  }

  /**
   * 合并单元格相关
   */
  initSpanMethod() {
    const configTable = this.configTable || {}
    
    // 设置重复次数
    let repeatTimes = 0
    if (configTable.spanMethod) {
      repeatTimes = configTable.repeat
    } else if (configTable.simpleSpanMethod) {
      return this.getSimpleSpanModel().length
    }
    this.repeatTimes = repeatTimes

    // 设置单元格合并策略
    let spanMethod = null
    if (configTable.spanMethod) {
      // 原生的spanMethod
      spanMethod = configTable.spanMethod
    } else if (configTable.simpleSpanMethod) {
      // 简单合并
      const spanModel = this.getSimpleSpanModel()
      const hasOperate = this.hasOperate
      spanMethod = function({ row, column, rowIndex, columnIndex }: {
        row: number,
        column: number,
        rowIndex: number,
        columnIndex: number
      }) {
        const modelData = spanModel[rowIndex % spanModel.length]
        if (getType(modelData) !== 'array') {
          // 整行填充
          if (columnIndex !== modelData) {
            return {
              colspan: 0,
              rowspan: 1
            }
          } else {
            return {
              colspan: configTable.rowElCount + (hasOperate ? 1 : 0),
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
    this.spanMethod = spanMethod
  }

  /**
   * 获取简单单元格合并策略
   */
  getSimpleSpanModel() {
    const useConfigTable = this.useConfigTable
    return getType(useConfigTable.simpleSpanMethod) === 'function'
      ? useConfigTable.simpleSpanMethod()
      : useConfigTable.simpleSpanMethod
  }

  /**
   * 初始化吸顶
   */
  initSticky() {
    const context = this.context // table组件实例
    // nextTick等待表格的表头渲染出高度
    context.$nextTick(() => {
      // 移除事件
      this.removeStickyScrollEvent()
      // 吸顶元素
      this.stickyEl = this.pagemodel.containerRef.querySelector('.el-table__header-wrapper')
      // 获取吸顶元素信息
      if (!this.stickyEl) return
      this.stickyElHeight = this.stickyEl.getBoundingClientRect().height
      // 获取定位参考元素
      this.stickyBodyEl = this.pagemodel.containerRef.querySelector('.el-table__body-wrapper')
      // 监听事件
      this.addStickyScrollEvent()
    })
  }
  /**
   * 监听吸顶的滚动事件
   */
  addStickyScrollEvent() {
    this.tableScrollHandler = handleScrollVertical.bind(this)
    this.pagemodel.containerRef.addEventListener('scroll', this.tableScrollHandler)
  }
  // 移除吸顶的滚动事件
  removeStickyScrollEvent() {
    this.tableScrollHandler && this.pagemodel.containerRef.removeEventListener('scroll', this.tableScrollHandler)
    this.tableScrollHandler = null
  }

  /**
   * 初始化列表的column
   */
  initColumns() {
    let { context, useConfig } = this.pagemodel
    let elsCount = 0
    let elWidthChildrenCount = 0
    function filterEls(els: TableEls, context: any) {
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

    this.columns = filterEls(useConfig?.table?.els || [], context)
    this.rowElCount = elsCount - elWidthChildrenCount

  }

  /**
   * 初始化列表的请求size和分页器sizes
   */
  initTable() {
    const configTable = this.configTable
    this.table.pageSize = configTable?.pageSize
    this.table.sizes = configTable?.sizes
    this.elementLoadingText = configTable?.elementLoadingText
  }

  initOtherStatus() {
    const { useConfig } = this.pagemodel
    const configTable = this.configTable
    this.size = configTable?.size || useConfig.size
    this.border = configTable?.border
    this.hasSelect = configTable?.hasSelect
    if (configTable?.selectable) {
      this.selectable = wrapFc(configTable.selectable, this.context, this.context, 'bind', null)
    }
    // 表格是否存在横向滚动
    this.hasScroll = useConfig.overflowScroll
    // 表头是否吸顶
    this.isSticky = this.isSticky || useConfig.stickyHeader
    if (!this.isSticky) {
      // 不存在吸顶，移除监听事件
      this.removeStickyScrollEvent()
    }
    // 滚动距离
    this.setScrollLeft(this.scrollLeft || 0)
  }

  initOperate() {
    const configTable = this.configTable

    // 是否存在操作
    this.hasOperate = !!(configTable?.operate && configTable?.operate?.els?.length)
    if (!this.hasOperate) return
    
    if (this.operateManager) {
      // 已经存在，更新配置
      this.operateManager.updateConfig()
    } else {
      // 初始化配置
      this.operateManager = new Operate(this.pagemodel, configTable)
    }
  }

  // 横向滚动相关
  addScrollListener() {
    if (!this.hasScroll) return
    if (!this.scrollHandler) {
      this.pagemodel.containerRef.addEventListener(
        'scroll', 
        this.scrollHandler = handleScrollHorizontal.bind(this)
      )
      window.addEventListener(
        'resize', 
        this.resizeHandler = debounce(this.setTableWrapWidth.bind(this), 200)
      )
    }
  }

  // 移除滚动事件
  removeScrollListener() {
    if (!this.hasScroll) return
    if (this.scrollHandler) {
      this.pagemodel.containerRef.removeEventListener('scroll', this.scrollHandler)
      this.scrollHandler = null
      window.removeEventListener('resize', this.resizeHandler)
      this.resizeHandler = null
    }
  }
  
  setScrollLeft(scrollLeft: number) {
    this.scrollLeft = scrollLeft
  }

  /**
   * 重新开始执行查询
   * 设置查询页数为1、重新刷新页面
   */
  search() {
    this.table.currentPage = 1
    this.refreshTableData()
  }

  /**
   * 刷新当前页面，页数不变化
   */
  refreshTableData() {
    return this.getTableData(this.table.currentPage)
  }

  /**
   * 获取列表数据
   * @param pageIndex 数据第几页 
   */
  async getTableData(pageIndex: Number) {
    
    const { context, useConfig } = this.pagemodel
    if (!useConfig.getMethod) return
    
    const table = this.table
    table.isLoading = true
    
    const requestData = Object.assign({
      pageIndex: pageIndex || 1,
      pageSize: table.pageSize
    }, this.getTableReqParams())
    const data = await context.$axios[useConfig.getMethod](useConfig.getUrl, requestData)
    table.currentPage = requestData.pageIndex
    table.pageTotal = data.total

    let tableData = data.data
    if (isFunction(useConfig.getDataCallback)) {
      tableData = useConfig.getDataCallback.call(context, tableData)
    }
    this.setTableData(tableData)
    context.$emit('getData', tableData)
    table.isLoading = false

  }


  /**
   * 获取列表请求参数
   * 请求表单参数、排序参数、config配置otherParams，后向前覆盖
   * 使用组件中的useConfig（较新），pagemodel中的useConfig
   */
  getTableReqParams() {
    return {
      ...this.pagemodel.searchManager.getReqData(),
      ...this.sortParams,
      ...this.pagemodel.context.useConfig.otherParams
    }
  }

  /**
   * 设置列表数据 table.data
   * @param data 请求获取的列表数据
   */
  setTableData(data: any) {
    this.table.data = data
    // 通知可优化
    if (this.hasScroll) {
      this.setTableWrapWidth()
    }
  }

  // 设置宽度
  setTableWrapWidth() {
    let { context } = this.pagemodel
    this.wrapWidth = 'auto'
    setTimeout(() => {
      this.wrapWidth = getComputedStyle(context.$refs?.ptable.$el.querySelector('table')).width
    }, 50)
  }

}