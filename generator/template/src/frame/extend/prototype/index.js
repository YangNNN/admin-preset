import { jsonClone } from '@/utils'
export const install = function(Vue) {
  Vue.prototype.cloneObj = function(o) {
    return jsonClone(o)
  }
  Vue.prototype.getNows = function() {
    const now = new Date()
    return [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]
  }
}
