const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  /**
   * @description 请求地址
   */
  baseUrl: isProduction ? 'http://pro.xxx.com' : 'http://zhifuadmin.juzhentech.com',

  useSignalr: false,
  signalrApi: '',
  /**
   * @description 是否生产环境 通常和图片上传请求地址相关
   */
  isProduction: isProduction,

  /**
   * @var {name} 项目名称
   */
  project: {
    name: '项目后台'
  },

  /**
   * 七牛云相关参数配置
   * @param {Boolean} open 是否开启
   * @param {String} region 空间名称
   * @param {String} tokenUrl 七牛云token后台请求地址
   * @param {String} uploadUrl 七牛云上传接口地址
   * @param {String} fileUrl 七牛云文件域名地址
   */
  qiniu: {
    open: false,
    region: '',
    tokenUrl: '/api/xxx/GetToken',
    uploadUrl: 'https://upload.qiniup.com/',
    fileUrl: 'http://img.xxx.com/'
  },
  /**
   * @description 是否将homePage加入菜单
   */
  pushHome: false,

  /**
   * @description 定义homePage后，将默认先转转到首页muUrl定义的页面
   */
  homePage: {
    muUrl: '/test',
    muName: '实时数据',
    id: 99999999,
    isChild: 1,
    muCode: '99999999999999',
    muDesc: null,
    muIcon: 'dashboard',
    muType: 1,
    pmuCode: null,
    sort: 9999998
  }
}
