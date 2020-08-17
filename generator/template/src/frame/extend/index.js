import * as filters from './filters'
import * as directive from './directive'
import * as globalComponents from './global-components'
import * as prototype from './prototype'

export const install = function(Vue) {
  Vue.use(filters)
  Vue.use(directive)
  Vue.use(globalComponents)
  Vue.use(prototype)
}
