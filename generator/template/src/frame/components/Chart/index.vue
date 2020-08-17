<template>
  <div class="chart" :style="{height: _height}" />
</template>

<script>
import { dynamicLoadScript, createCDNSources } from '@/utils'
import mixin from './mixin'
export default {
  mixins: [mixin],
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    height: {
      type: Number || String,
      default: null
    }
  },
  data() {
    return {
      chart: null,
      isLoad: false
    }
  },
  computed: {
    _height() {
      return typeof this.height === 'number'
        ? `${this.height}px`
        : this.height
    }
  },
  watch: {
    options: {
      handler(options) {
        this.initChart(options)
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart(this.options)
    })
  },
  methods: {
    initChart(options) {
      dynamicLoadScript(createCDNSources('echarts', '4.7.0'), 'echarts', (err) => {
        if (err) {
          this.$message.error(err.message)
          return
        }
        let chart = this.chart
        if (!chart) {
          const el = this.$el
          if (!el) {
            return
          }
          chart = this.chart = window.echarts.init(el)
        }
        if (!chart) {
          return
        }
        chart.setOption(options)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.chart {
  min-height: 200px;
  height: 100%;
}
</style>
