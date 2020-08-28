const fs = require('fs')
const path = require('path')
const IO_DESCS = {
  encoding: 'utf-8'
}

function resolvePath(srcPath, filePath) {
  return path.resolve(srcPath, filePath)
}

function removeFiles(srcPath, filePaths) {
  filePaths.forEach((filePath) => {
    const fullPath = resolvePath(srcPath, filePath)
    try {
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        const data = fs.readdirSync(fullPath)
        if (data.length) {
          removeFiles(srcPath, data.map(o => filePath + '/' + o))
        }
        fs.rmdirSync(fullPath)
      } else {
        fs.unlinkSync(fullPath)
      }
    } catch (error) {
      console.log(`remove file => ${fullPath}:`, error)
    }
  })
}


module.exports = api => {

  // 新增模板文件
  api.render('./template')

  api.extendPackage({
    dependencies: {
      "colorthief": "^2.3.2",
      "core-js": "^3.6.5",
      "nprogress": "^0.2.0",
      "path-to-regexp": "^3.2.0",
      "screenfull": "^5.0.2",
      "vue-amap": "^0.5.10",
      "element-ui": "^2.13.2"
    },
    "devDependencies": {
      "svg-sprite-loader": "^5.0.0",
      "svgo-loader": "^2.2.1"
    }
  });

}

module.exports.hooks = (api) => {
  api.afterInvoke(() => {
    
    // 移除一些文件
    const srcPath = path.join(api.resolve(api.entryFile), '..')
    removeFiles(srcPath, ['views', 'components', 'router/index.js', 'store/index.js'])

    // 修改一些文件 添加申明
    const { EOL } = require('os')
    const shimsVueDTsFilePath = resolvePath(srcPath, 'shims-vue.d.ts')
    const shimsVueDTsFileContent = fs.readFileSync(shimsVueDTsFilePath, IO_DESCS)
    const lines = shimsVueDTsFileContent.split(/\r?\n/g)
    try {
      const declares = [
        `declare module 'nprogress'`,
        `declare module 'element-ui'`,
        `declare module 'js-cookie'`,
        `declare module 'vue-amap'`,
        `declare module 'axios'`,
        `declare module 'Qs'`,
        `declare module '@/router/*.ts'`,
        `declare module '@/router/modules/*.js'`,
        `declare module '@/store/*.js'`,
        `declare module '@/utils/*'`,
        `declare module '@/frame/*'`,
        `declare module '@/styles/*'`
        `declare module '@/config/*'`
      ]
      declares.forEach(declare => {
        lines.push(`${EOL} ${declare}`)
      })
      fs.writeFileSync(shimsVueDTsFilePath, lines.join(EOL), IO_DESCS)
    } catch (error) {
      console.log(error)      
    }

    // 重写main.ts
    const mainContent = `
import { install as extend } from "@/frame/extend/index.js";
import "@/frame/icons"; // icon
import "@/styles/element-variables.scss";
import "@/styles/index.scss"; // global css
import $axios from "@/utils/ajax";
import Element from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import Cookies from "js-cookie";
import Vue from "vue";
import VueAMap from "vue-amap";
import App from "./App.vue";
import "./permission"; // permission control
import router from "./router";
import store from "./store";
import "./utils/error-log"; // error log

Vue.prototype.$axios = $axios;

Vue.use(VueAMap);

VueAMap.initAMapApiLoader({
  key: "xxxxxx", // 高德地图key
  plugin: [
    "AMap.Geolocation", // 定位控件，用来获取和展示用户主机所在的经纬度位置
  ],
  v: "1.4.4",
});

extend(Vue);

Vue.use(Element, {
  size: Cookies.get("size") || "medium", // set element-ui default size
});

Vue.config.productionTip = false;

new Vue({
  el: "#app",
  router,
  store,
  render: (h) => h(App),
});
    `
    fs.writeFileSync(api.resolve(api.entryFile), mainContent, IO_DESCS)

  })
}