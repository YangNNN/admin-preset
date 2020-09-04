import * as extendVue from '@/frame/extend/index.js'
import * as PageModel from '@/frame/extend/plugin/page-model'
import '@/frame/icons' // icon
import '@/styles/index.scss' // global css
import $axios from '@/utils/ajax'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Cookies from 'js-cookie'
import Vue from 'vue'
import VueAMap from 'vue-amap'
import App from './App.vue'
import './permission' // permission control
import router from './router'
import store from './store'
import './utils/error-log' // error log
Vue.use(PageModel)
Vue.use(VueAMap)
Vue.use(extendVue)
Vue.use(Element, {
  size: Cookies.get('size') || 'medium'
})

Vue.prototype.$axios = $axios

VueAMap.initAMapApiLoader({
  key: 'xxxxxx', // 高德地图key
  plugin: [
    'AMap.Geolocation', // 定位控件，用来获取和展示用户主机所在的经纬度位置
  ],
  v: '1.4.4',
})


Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
})
