/**
 * @file 模板管理者
 * @author yangshangman
 */

import systemConfig from '@/config';
import { objectMerge } from '@/utils';
import cloneDeep from 'lodash/fp/cloneDeep';
import { getPageDefaultConfig } from '../../utils/model';
import Form from '../form';
import Head from '../head';
import { configInterface, FormInstance, HeadInterface, PageManagerInterface, SearchInterface, TableInstance, Watches } from '../interface';
import ReflectRelation from '../reflect';
import Search from '../search';
import Table from '../table';

export default class PageManager implements PageManagerInterface {

  context: any;
  useConfig: configInterface;
  containerRef!: HTMLDivElement;
  headManager: HeadInterface;
  searchManager: SearchInterface;
  tableManager: TableInstance;
  formManager: FormInstance;
  managers: Array<HeadInterface | SearchInterface | TableInstance | FormInstance> = [];
  reflectionWatches: Watches | null = null;
  $refs!: any;
  [propName: string]: any;
  init: boolean = false;
  static defaultConfig: any;

  constructor(context: any) {
    // 保存当前环境
    this.context = context

    this.useConfig = cloneDeep(context.useConfig)

    // 实例化下级管理器 并且 保存，下级管理器初始化的时候会调用自身的init
    this.managers.push(
      this.headManager = new Head(this), 
      this.searchManager = new Search(this), 
      this.tableManager = new Table(this), 
      this.formManager = new Form(this)
    )

    this.init = true

  }
  
  /**
   * 暴露静态方法
   * @param config 默认配置
   */
  static setDefaultConfig(config: any) {
    this.defaultConfig = objectMerge(getPageDefaultConfig(), config)
  }

  /**
   * 页面挂载后调用初始化
   * 要将dom元素绑定到实例中
   */
  initPage() {
    // 保存组件的根节点
    this.containerRef = (this.$refs = this.context.$refs).pageModelContainer

    // 开始获取数据 
    this.getData()

    // 初始化watche
    this.initWatch()

    // 触发下级管理器的页面初始化
    this.managers.forEach(instance => {
      instance.initPage()
    })

  }

  /**
   * 获取列表数据
   */
  getData() {
    const useConfig = this.useConfig
    // 是否需要等待参数到位
    if (useConfig.waitParams && !useConfig.otherParams) {
      // 额外参数未准备好
      setTimeout(() => {
        this.getData()
      }, 20)
    } else {
      // 执行搜索
      useConfig.getUrl && this.search()
    }
  }

  /**
   * 通知tableManager去获取数据
   * 提交搜索事件
   */
  search() {

    // 执行tableManager的搜索
    this.tableManager.search()

    // 提交一个内部开始搜索事件
    this.context.emitEvent(null, null, '_search')
  }
  
  /**
   * 初始化监听函数
   * 1、监听config变化，重新生成useConcig
   * 2、监听是否启用reflect
   */
  initWatch() {
    const context = this.context
    const useConfig = this.useConfig

    // 如果有观察映射，先解除观察
    if (this.reflectionWatches) {
      this.reflectionWatches.forEach(unwatch => unwatch())
      this.reflectionWatches = null
    }
    // 是否映射
    if (useConfig.reflect) {
      // 获取到映射源数据
      const reflections = context.reflections

      // 实例化映射
      const reflect = new ReflectRelation()

      // 收集映射关系，查找config中key为_reflect的对象
      // 将该对象中key为_reflect 的值作为key创建映射关系的路径
      // exp. { searchForm: { els: [ { eType: 'el-select', optionsData: { _reflect: 'members' } } ] } }
      // 解析 => { members: [ [ 'searchForm', 'els', 0, 'optionsData' ] ] }
      reflect.collectRelations(useConfig)

      // 对每个进行观察
      this.reflectionWatches = Object.keys(reflections).map(key => {
        return context.$watch(`reflections.${key}`, {
          handler(list: any) {
            (reflect.getRelations(key) || []).forEach(keys => {

              // 拿到拥有_reflect的对象
              let data = keys.reduce((data, key) => {
                return data[key]
              }, useConfig)

              // 更改值
              data[keys.reflectChangeKey] = list

            })
          },
          deep: true,
          immediate: true
        })
      })

      this.reflectionWatches.reflect = reflect

    }

  }

  /**
   * 重新更新useConfig
   * 1、manager自身重新init
   * 2、调用manager下的其它manager的updateConfig方法
   */
  updateConfig(config: configInterface) {

    this.useConfig = cloneDeep(config)

    // 调用下级管理器的更新配置
    this.managers.forEach(instance => {
      instance.updateConfig()
    })

  }

  /**
   * 导出
   * @param mode 导出模式 0导出当前页 1导出所有
   */
  export(mode: 0 | 1) {
    let url = this.useConfig.exportUrl
    if (!url) return
    const tableManager = this.tableManager

    url = systemConfig.baseUrl + url + '?'
    const sizeParams = mode === 0 ? {
      pageIndex: tableManager.table.currentPage,
      pageSize: tableManager.table.pageSize
    } : {
      queryAll: 1
    }

    // 合并参数
    const exportData = Object.assign(
      tableManager.getTableReqParams(),
      this.searchManager.exportParams,
      sizeParams
    )

    // 拼接url
    for (const k in exportData) {
      const value = exportData[k]
      if (value != null) {
        url += `${k}=${encodeURIComponent(value)}&`
      }
    }

    // get访问url下载
    location.href = url.substr(0, url.length - 1)
  }

  /**
   * 设置manager的值
   */
  setValue(key: string, value: any) {
    this.context.$set(this, key, value)
  }

}