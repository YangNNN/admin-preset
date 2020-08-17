import { dateFormat } from '@/utils'
export default {
  data() {
    return {
      searchModel: {}, // 搜索模型
      searchForm: {}, // 搜索表单数据
      isSearchExpand: false, // 搜索框是否展开
      table: {
        isLoading: false, // 是否正在加载
        ajaxData: {}, // 请求参数
        data: [], // 表格当前数据
        currentPage: 1, // 当前页码
        pageSize: 30, // 每页条数
        pageTotal: 0 // 总页数
      }
    }
  },
  mounted() {
    this.appendCheckEnter()
  },
  methods: {
    // 添加
    appendCheckEnter() {
      window.$_bindCb && document.body.removeEventListener('keyup', window.$_bindCb)
      const _this = this
      const checkEnter = function() {
        let timer = null
        return function(e) {
          if (timer) {
            clearTimeout(timer)
          }
          timer = setTimeout(() => {
            // 开启搜索
            if (_this.isSearchExpand && e.keyCode === 13) {
              _this.handleSearch()
            }
            timer = null
          }, 200)
        }
      }
      window.$_bindCb = checkEnter()
      document.body.addEventListener('keyup', window.$_bindCb)
    },
    // 搜索事件
    handleSearch() {
      const ajaxData = {}
      for (const k in this.searchForm) {
        let value = this.searchForm[k]
        const type = Object.prototype.toString.call(value)
        value = type !== '[object Date]'
          ? type === '[object String]'
            ? (value + '').trim()
            : value
          : dateFormat(value, 'yyyy-MM-dd hh:mm:ss')
        ajaxData[k] = value
      }
      this.table.ajaxData = ajaxData
      this.currentPage = 1
      this.refreshTableData()
    },
    // 重置搜索
    handleResetSearch() {
      this.table.ajaxData = {}
      this.searchForm = Object.assign({}, this.searchModel || {})
      this.handleSearch()
    },
    resetModel(obj) {
      this.searchModel = Object.assign({}, obj)
      this.searchForm = Object.assign({}, this.searchModel || {})
    },
    // 打开筛选
    handleOpenSearch() {
      this.isSearchExpand = !this.isSearchExpand
    },
    // 分页数量改变
    handleTableSizeChange(val) {
      this.table.currentPage = 1
      this.table.pageSize = val
      this.refreshTableData()
    },
    // 页码点击事件
    handleTableCurrentChange(val) {
      this.getTableData(val)
    }
  }
}
