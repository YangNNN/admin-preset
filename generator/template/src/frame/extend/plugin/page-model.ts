/**
 * @file 全局注册PageModel组件并设置默认参数
 * @author yangshangman
 */

import PageModelComponent from '@/frame/components/page-model';
import PageManager from '@/frame/components/page-model/utils/page-manager';
import { VueConstructor } from 'vue';

interface installOptions {
  config: any
}

/**
 * 注册组件
 */
export const install = function(Vue: VueConstructor, options: installOptions = { config: {} } ) {
  Vue.component('page-model', PageModelComponent);
  PageManager.setDefaultConfig(options.config || {});
}