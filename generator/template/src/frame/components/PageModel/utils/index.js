import { getType } from '@/utils'

export const wrapFc = function(fc, context = null, data, useFn = 'call', returnValue = null) {
  if (fc && getType(fc) === 'function') {
    return fc[useFn](context, data)
  } else {
    return fc !== undefined ? fc : returnValue
  }
}

export const wrapIconClass = function(icon) {
  if (!icon) return ''
  return icon.indexOf('el-icon') === 0 ? icon : 'el-icon-' + icon
}
