/**
 * @file 在请求之前对参数进行处理
 * @description 导出的rules中的每个成员请都实现一个 excute函数，并且函数返回一个options
 * @author yangshangman
 * @returns { Array } [ { excute: function(options) { ... return options... } } ]
 */

import { options } from './ajax'
import { combineReqData } from './index'

export interface Excute {
  (options: options): options;
}

export interface Rules extends Array<Rule> {}

export interface Rule {
  excute: Excute;
  [ prop: string ]: any;
}

const rules: Rules = [
  // 全局处理参数
  {
    excute: function(options) {

      if (options.method === 'GET') {
        options.params = Object.assign({ unitId: 20 }, options.params)
        options.params = combineReqData(options.params || {})
      } else {
        options.data = Object.assign({ unitId: 20 }, options.data)
        options.data = combineReqData(options.data || {})
      }
      
      return options
    }
  }
]

export default rules