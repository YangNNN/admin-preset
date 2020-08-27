export const getPageDefaultModel = function() {
  return {
    init: true,
    size: 'default',
    searchForm: {
      isopen: true,
      labelWidth: '100px',
      els: []
    },
    table: {
      pagination: true,
      sizes: [10, 15, 20, 30, 50, 70, 100],
      pageSize: 10,
      'sort-orders': ['ascending', 'descending', null],
      els: []
    },
    hasForm: true
  }
}
