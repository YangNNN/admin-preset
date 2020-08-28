/**
 * @file 提供获取组件管理类实例的混入方法
 * @author yangshangman
 */

interface ProvideMixin {
  inject: Array<string>,
  computed: {
    pagemodel: (this: any) => any,
    useConfig: (this: any) => any,
    context: (this: any) => any
  }
}

const provideMixin: ProvideMixin = {
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

export default provideMixin