/**
 * @file 管理内部类 基类
 * @author yangshangman
 */

import { PageManagerInterface } from '../interface';

export default class ManagerAccepter {

  pagemodel: PageManagerInterface;
  isInit: boolean = false;
  [prop: string]: any;

  constructor(pagemodel: PageManagerInterface) {
    this.pagemodel = pagemodel
    this.isInit = true
  }

  setValue(key: any, value: any) {
    this[key] = value
    this.valueChange && this.valueChange(key, value)
  }

  /**
   * 页面挂载后的初始化
   */
  initPage() {}

  /**
   * 更新配置
   */
  updateConfig() {}
  
}
