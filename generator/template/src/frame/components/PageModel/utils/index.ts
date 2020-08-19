import { getType } from '@/utils/index.js'

export const wrapFc = function(fc: any, context = null, data?: object, useFn = 'call', returnValue = null) {
  if (fc && getType(fc) === 'function') {
    return fc[useFn](context, data)
  } else {
    return fc !== undefined ? fc : returnValue
  }
}

export const wrapIconClass = function(icon: string) {
  if (!icon) return ''
  return icon.indexOf('el-icon') === 0 ? icon : 'el-icon-' + icon
}
