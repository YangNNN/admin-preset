/**
 * @file 提供获取组件管理类实例的混入方法
 * @author yangshangman
 */

interface ProvideMixin {
  inject: Array<string>,
  computed: {
    manager: (this: any) => any,
    useConfig: (this: any) => any,
    context: (this: any) => any
  }
}

const provideMixin: ProvideMixin = {
  inject: ['provideData'],
  computed: {
    manager() {
      return this.provideData.manager
    },
    useConfig() {
      return this.manager.useConfig
    },
    context() {
      return this.manager.context
    }
  }
}

export default provideMixin