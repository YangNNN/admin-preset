import * as filters from './keys'

export const install = function(Vue) {
  Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
  })
}
