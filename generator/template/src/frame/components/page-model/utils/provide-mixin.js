/**
 * @file 提供获取组件管理类实例的混入方法
 * @author yangshangman
 */

export default {
  inject: ['provideData'],
  computed: {
    pagemodel() {
      return this.provideData.pagemodel
    },
    useConfig() {
      return this.pagemodel.useConfig
    },
    context() {
      return this.pagemodel.context
    }
  }
}