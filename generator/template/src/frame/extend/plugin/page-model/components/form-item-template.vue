<script>
  export default {
    props: {
      value: [String, Number, Date, Boolean, Array, Object, Function, Symbol],
      options: {
        type: Object,
        default: () => {}
      },
      change: {
        type: Function,
        default: null
      },
      renderFn: { // 原生渲染函数
        type: Function,
        default: null
      },
      context: { // 执行环境
        type: Object,
        default: () => {}
      },
      disabled: { // 是否不可用（只负责传值给渲染组件，由渲染组件控制是否可用）
        type: Boolean,
        default: false
      }
    },
    methods: {
      switchRender(h) {
        switch (this.options.eType) {
          case 'el-select':
            return this.getOptionsDataTypeRender(h, 'el-option')
          case 'el-radio-group':
            return this.getOptionsDataTypeRender(h, 'el-radio')
          case 'el-checkbox-group':
            return this.getOptionsDataTypeRender(h, 'el-checkbox')
          default:
            return this.getInputTypeRender(h)
        }
      },
      getOptionsDataTypeRender(h, ctype) {
        const options = this.options
        const optionsData = options.optionsData
        optionsData.label = optionsData.label || 'label'
        optionsData.value = optionsData.value || 'value'
        const list = optionsData.list || []
        let children = []
        if (ctype === 'el-radio') {
          children = list.map(function (item, index) {
            return h(
              ctype, {
              props: {
                label: item[optionsData.value]
              },
              key: index
            },
              [
                item[optionsData.label]
              ]
            )
          })
        } else {
          children = list.map(function (item, index) {
            return h(
              ctype, {
              props: {
                value: item[optionsData.value],
                label: item[optionsData.label]
              },
              key: index
            }
            )
          })
        }
        return h(
          options.eType, {
          ...this.getBasic(h)
        },
          children
        )
      },
      // input类型
      getInputTypeRender(h) {
        return h(
          this.options.eType, {
          ...this.getBasic(h)
        }
        )
      },
      // basic
      getBasic(h) {
        const options = this.options
        const value = this.value
        // 处理props中的function
        const props = {}
        if (options.props) {
          for (const prop in options.props) {
            const propVal = options.props[prop]
            props[prop] = typeof propVal !== 'function'
              ? propVal
              : propVal.bind(this.context)
          }
        }
        // 监听函数
        const events = {}
        if (options.events) {
          for (const event in options.events) {
            events[event] = options.events[event].bind(this.context)
          }
        }
        // scopedSlots
        const scopedSlots = {}
        if (options.scopedSlots) {
          for (const scoped in options.scopedSlots) {
            scopedSlots[scoped] = options.scopedSlots[scoped].bind(this.context, h)
          }
        }
        const data = {
          style: options.style,
          attrs: {
            placeholder: (options.props || {}).placeholder,
            ...options.attrs
          },
          props: {
            value: value,
            disabled: this.disabled,
            ...props
          },
          on: {
            input: function (value) {
              this.$emit('input', value)
              let label = ''
              try {
                const optionsData = options.optionsData
                const findInfo = optionsData.list.find(item => item[optionsData.value] === value)
                label = findInfo[optionsData.label]
              } catch (error) {
                // error
              }
              this.change && this.change(value, label)
            }.bind(this),
            ...events
          },
          scopedSlots,
          ref: null
        }
        if (options.ref) {
          data.ref = options.ref
        }
        return data
      }
    },
    render: function (h) {
      if (this.renderFn) {
        return this.renderFn(h)
      }
      return this.switchRender(h)
    }
  }
</script>