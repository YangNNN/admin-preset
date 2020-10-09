/**
 * @file 全局注册PageModel组件并设置默认参数
 * @author yangshangman
 */

import PageModelComponent from '@/frame/components/page-model'
import PageManager from '@/frame/components/page-model/instance/manager'
import { VueConstructor } from 'vue'
import CellTemplate from './components/cell-template.vue'
import FormItemTemplate from './components/form-item-template.vue'

interface installOptions {
  config: any
}

/**
 * 注册组件
 */
export const install = function(Vue: VueConstructor, options: installOptions = { config: {} } ) {

  Vue.component('table-cell-template', CellTemplate)

  Vue.component('form-item-template', FormItemTemplate)

  Vue.component('page-model', PageModelComponent)
  
  PageManager.setDefaultConfig(options.config || {})

}