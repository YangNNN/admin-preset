function resolveBaseComponent(path) {
  return () => import('@/frame/components/' + path + '/index.vue')
}

const baseRegisters = [
  'img-upload', // 图片上传组件
  'file-upload', // 文件上传组件
  'editor', // 编辑器组件
  'svg-icon', // svg
  'md-Input', // mdinput
  'long-input', // 长输入框
  'link-input', // 链接输入框
  'a-map', // 地图
  'city-picker', // 城市选择组件
  'images' // 图片显示组件
]

export const install = function(Vue) {
  // 其他全局组件
  baseRegisters.forEach(name => {
    Vue.component(name, resolveBaseComponent(name))
  })
}
