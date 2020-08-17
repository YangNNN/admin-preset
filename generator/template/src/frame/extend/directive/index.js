import waves from './waves'
import clipboard from './clipboard'
import dragDialog from './el-drag-dialog'
import permission from './permission'

export const install = function(Vue) {
  Vue.use(waves)
  Vue.use(clipboard)
  Vue.use(dragDialog)
  Vue.use(permission)
}
