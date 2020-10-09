/**
 * @file 头部管理
 * @author yangshangman
 */

import { getType } from '@/utils';
import { wrapIconClass } from '../../utils';
import { ButtonInterface, configInterface, HeadInterface, PageManagerInterface } from '../interface';
import ManagerAccepter from '../manager-accepter';

export default class Head extends ManagerAccepter implements HeadInterface {

  hasTopBar: boolean = false;
  isSearchExpand: boolean = false;
  topBar: configInterface['topBar'] = {};

  constructor(pagemodel: PageManagerInterface) {
    super(pagemodel)
    this.init()
  }

  init() {
    this.initTopBar()
  }

  updateConfig() {
    this.initTopBar()
  }

  initTopBar() {
    const { useConfig } = this.pagemodel
    let { topBar = {}, addUrl, addButton = {}, name, size, searchForm } = useConfig

    // 处理顶部按钮
    topBar.els = topBar.els || []

    // 合并新增按钮
    addUrl && topBar.els.push(Object.assign({
      size,
      type: 'primary',
      text: '新增' + (name ? getType(name) === 'string' ? name : name.title : ''),
      isAdd: true,
    }, addButton))

    // 处理按钮样式
    topBar.els.forEach((button: ButtonInterface) => {
      button.size = button.size || size
      button.icon = wrapIconClass(button.icon)
    })

    // 设置状态
    this.isSearchExpand = this.isSearchExpand || searchForm?.isopen
    this.hasTopBar = !!topBar.els.length
    this.topBar = topBar

  }
  
}