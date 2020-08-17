<template>
  <el-cascader
    :value="innerValue"
    :options="options"
    :props="cascaderProps"
    @change="handleChange"
  />
</template>

<script>
import citys from '@/assets/city'
import { getType, findDataFromTree } from '@/utils'
export default {
  props: {
    value: {
      type: Array || String,
      default: null
    },
    level: {
      type: Number,
      default: 3
    },
    cascaderProps: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      innerValue: []
    }
  },
  computed: {
    options() {
      if (this.level === 3) {
        return citys
      } else if (this.level === 2) {
        return citys.map(province => {
          if (province.children) {
            province.children.forEach(city => {
              delete city.children
              return city
            })
          }
          return province
        })
      } else {
        return citys.map(province => {
          delete province.children
          return province
        })
      }
    }
  },
  watch: {
    value: {
      handler(value) {
        if (getType(value) === 'array') {
          this.innerValue = value
        } else {
          const citys = findDataFromTree(this.options, 'value', value)
          this.innerValue = citys.map(city => city.value)
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleChange(e) {
      const citys = findDataFromTree(this.options, 'value', e.slice(-1)[0])
      this.$emit('input', citys.map(city => city.value))
      this.$emit('change', citys)
    }
  }
}
</script>
