<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import theme from '@/frame/layout/components/ThemePicker/utils/theme'
import { mapState } from 'vuex'
export default {
  name: 'App',
  computed: {
    ...mapState({
      theme: state => state.settings.theme
    })
  },
  beforeMount() {
    console.log(this.theme)
    theme.updateTheme(this.theme)
  }
}
</script>
