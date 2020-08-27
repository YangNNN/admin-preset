/**
 * @file 模板组件内部工具方法
 * @author yangshangman
 */

import { getType } from '@/utils/index.js'

/**
 * 包裹一个函数 返回新函数或者一个结果
 * @param fc 包裹函数或者值
 * @param context 待执行绑定的执行上下文
 * @param data 函数执行参数
 * @param useFn 绑定方法call、apply、bind
 * @param returnValue fc未定义时返回的值
 * @returns [Function | any] 返回新函数或者一个结果
 */
export const wrapFc = function(
    fc: any,
    context = null,
    data?: object,
    useFn = 'call',
    returnValue = null
  ) {
  if (fc && getType(fc) === 'function') {
    return fc[useFn](context, data)
  } else {
    return fc !== undefined ? fc : returnValue
  }
}

/**
 * element-ui icon处理，返回
 * @param icon element-ui icon字符串
 * @returns 返回一个完整的element-ui icon class
 */
export const wrapIconClass = function(icon: string) {
  if (!icon) return ''
  return icon.indexOf('el-icon') === 0 ? icon : 'el-icon-' + icon
}
