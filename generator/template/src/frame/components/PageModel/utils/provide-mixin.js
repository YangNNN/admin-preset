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