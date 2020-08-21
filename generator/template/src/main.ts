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
