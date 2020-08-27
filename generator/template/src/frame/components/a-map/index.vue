<template>
  <div v-if="value && value.length" class="amap-wrap" :style="{height: height}">
    <el-amap
      class="amap-box"
      :vid="vid"
      :zoom="zoom"
      :events="events"
      :center="value"
    >
      <el-amap-marker
        vid="marker"
        :position="value"
        :label="label"
      />
    </el-amap>
  </div>
</template>

<script>
export default {
  props: {
    height: {
      type: String,
      default: '400px'
    },
    value: {
      type: Array,
      default: () => [116.3905334500, 39.9139844700]
    },
    zoom: {
      type: Number,
      default: 12
    }
  },
  data() {
    return {
      vid: Math.random().toString().slice(2),
      label: {
        content: '当前所在',
        offset: [-15, -24]
      },
      events: {
        'click': (e) => {
          const lng = e.lnglat.lng
          const lat = e.lnglat.lat
          this.$emit('input', [lng, lat])
          this.$emit('change', [lng, lat])
        }
      }
    }
  }
}
</script>

<style>
.amap-wrap {
  width: 100%;
}
</style>
