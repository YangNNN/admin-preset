/**
 * @file 返回默认模板数据和默认使用方法
 * @author yangshangman
 */

 /**
  * 导出默认配置
  */
export const getPageDefaultConfig = () => {
  return {
    init: true,
    size: 'default',

    getMethod: 'get',
    addMethod: 'post',
    updMethod: 'put',
    delMethod: 'delete',

    searchForm: {
      isopen: true,
      labelWidth: '100px',
      els: []
    },
    table: {
      elementLoadingText: '加载中',
      pagination: true,
      sizes: [10, 15, 20, 30, 50, 70, 100],
      pageSize: 10,
      'sort-orders': ['ascending', 'descending', null],
      els: []
    },
    hasForm: true
  }
}
