/**
 * @file 搜索管理
 * @author yangshangman
 */

import { combineReqData, getType, jsonClone } from '@/utils';
import { configInterface, FormItemInterface, PageManagerInterface, SearchInterface } from '../interface';
import ManagerAccepter from '../manager-accepter';

export default class Search extends ManagerAccepter implements SearchInterface {
  hasSearch: boolean = false; // 是否存在搜索
  hasInnerExpand: boolean = false; // 是否存在内部展开
  isInnerSearchExpand: boolean = false; // 是否内部展开更多搜索
  labelWidth?: string | number = ''; // label宽度
  size?: string = ''; // 尺寸
  showEls?: number = 0; // 未展开显示数量
  showSearchEls?: FormItemInterface[] = []; // 当前显示的表单数据

  configSearchForm: configInterface['searchForm'] = { els: [] }; // 传入的searchForm配置

  searchModel: { [prop: string]: any; } = {}; // 搜索初始值 reset
  searchForm: { [prop: string]: any; } = {}; // 搜索待提交表单数据
  
  exportUrl?: string = ''; // 导出url
  exportParams?: { [ prop: string ]: any } // 导出参数

  constructor(pagemodel: PageManagerInterface) {
    super(pagemodel)
    this.init()
  }

  init() {
    this.setConfigSearchform()
    this.initFormData()
    this.initFormSearchStatus()
  }
  
  updateConfig() {
    this.setConfigSearchform()
    this.initFormSearchStatus()
  }

  /**
   * 从useConfig中取出新的配置表单
   */
  setConfigSearchform() {
    const { searchForm: configSearchForm, exportUrl, exportParams } = this.pagemodel.useConfig
    this.exportUrl = exportUrl
    this.exportParams = exportParams
    if (!configSearchForm) return
    this.configSearchForm = configSearchForm
  }


  /**
   * 初始化表单数据 searchForm、searchModel
   */
  initFormData() {
    let configSearchForm = this.configSearchForm
    if (configSearchForm?.init?.data) {
      this.searchModel = jsonClone(configSearchForm.init.data)
      this.searchForm = jsonClone(this.searchModel)
    } else {
      this.searchModel = {}
      this.searchForm = {}
    }
  }

  /**
   * 设置表单的状态
   */
  initFormSearchStatus() {
    let configSearchForm = this.configSearchForm
    if (!configSearchForm) return

    let { showEls, els, labelWidth } = configSearchForm

    // 设置表单组件的位置
    els.forEach(el => {
      el.col = el.col || { lg: 8 }
    })
    
    // 设置元素显示数量
    this.showEls = showEls

    // 是否存在搜索
    this.hasSearch = !!(configSearchForm?.els?.length)

    // 是否需要内部隐藏
    this.hasInnerExpand = showEls ? showEls < (els || []).length : false

    // 是否内部隐藏
    this.isInnerSearchExpand = this.isInnerSearchExpand

    // 表单labelwidth
    this.labelWidth = labelWidth

    // 表单尺寸
    this.size = configSearchForm.size || this.pagemodel.useConfig.size

    // 设置表单可见成员
    this.setOpendElements()
  }

  /**
   * 显示表单的items
   */
  setOpendElements() {
    const els = this.configSearchForm?.els || []
    this.showSearchEls = this.hasInnerExpand && !this.isInnerSearchExpand
    ? els.slice(0, this.showEls)
    : els
  }

  /**
   * 收集表单请求数据
   */
  getReqData() {
    const data = combineReqData(this.searchForm)
    const configSearchForm = this.configSearchForm
    if (getType(configSearchForm?.beforeSubmit) === 'function') {
      return configSearchForm?.beforeSubmit.call(this, data)
    } else {
      return data
    }
  }

  /**
   * 调用setValue方法会通知这里
   * @param key 更改的key
   * @param value 更改的值
   */
  valueChange(key: string, value: any) {
    if (key === 'isInnerSearchExpand') {
      this.setOpendElements()
    }
  }

}