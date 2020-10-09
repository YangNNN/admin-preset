/**
 * @file 操作栏
 * @author yangshangman
 */

import { wrapIconClass } from '../../utils'
import { configInterface, configTableOperate, OperateInstance, PageManagerInterface } from '../interface'
import ManagerAccepter from '../manager-accepter'

export default class Operate extends ManagerAccepter implements OperateInstance {

  configTable: configInterface['table'] = { operate: {} }    // configTable

  isLeft?: boolean                                           // 操作栏位置是否在左侧

  operate: configTableOperate = {}                           // configTable的operate

  constructor(pagemodel: PageManagerInterface, configTable: configInterface['table']) {

    // 实现继承类的方法，设置pagemodel
    super(pagemodel)

    // 记录configTable    
    this.configTable = configTable

    // 初始化，设置状态
    this.init()
  }

  init() {
    const configTable = this.configTable
    const { size } = this.pagemodel.useConfig
    
    // 设置原操作栏配置
    let operate = configTable?.operate || {}
    if (operate?.els) {
      operate.els = operate.els.map(el => {
        el.size = el.size || size
        el.icon = wrapIconClass(el.icon)
        Object.assign(el, el.props || {})
        if (el.els) {
          el.els = el.els.map((e: any) => {
            e.size = e.size || size
            e.icon = wrapIconClass(e.icon)
            Object.assign(e, e.props || {})
            return e
          })
        }
        return el
      })
    }
    this.operate = operate

    // 设置是否左侧操作
    this.isLeft = !!configTable?.isLeft

  }

  updateConfig() {
    this.init()
  }

}
