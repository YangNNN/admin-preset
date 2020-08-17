export default {
  name: {
    title: '',
    customTitle: ''
  },
  init: true,
  size: 'default',
  getUrl: '',
  addUrl: '',
  delUrl: '',
  updUrl: '', // 更新的api地址
  exportUrl: '', // 导出的api地址
  exportParams: null, // 导出的附加参数
  searchForm: {
    isopen: true,
    labelWidth: '100px',
    els: []
  },
  table: {
    pagination: true,
    'sort-orders': ['ascending', 'descending', null],
    els: []
  },
  hasForm: true
}
