function resolveBaseComponent(path) {
  return () => import('@/frame/components/' + path + '/index.vue')
}

const baseRegisters = [
  'PageModel', // 页面模板
  'ImgUpload', // 图片上传组件
  'FileUpload', // 文件上传组件
  'Editor', // 编辑器组件
  'SvgIcon', // svg
  'MdInput', // mdinput
  'LongInput', // 长输入框
  'LinkInput', // 链接输入框
  'AMap', // 地图
  'CityPicker', // 城市选择组件
  'Images' // 图片显示组件
]

export const install = function(Vue) {
  /**
   * 表格内容包裹组件
   */
  Vue.component('tableTemplate', {
    props: {
      html: { // 简单标签渲染
        type: String,
        default: ''
      },
      render: {
        type: Function,
        default: null
      },
      renderFn: {
        type: Function,
        default: null
      },
      click: {
        type: Function,
        default: null
      }
    },
    render: function(h) {
      if (this.renderFn) {
        return this.renderFn(h)
      }
      const renderData = {}
      let children = []
      // html渲染
      if (this.html) {
        renderData.domProps = {
          innerHTML: this.html
        }
      }
      // 存在点击事件
      if (this.click) {
        renderData.on = {
          click: this.click
        }
      }
      if (this.render && this.render.length) {
        children = this.render.map(item => {
          return h(
            item.eType,
            {
              props: item.props || {}
            },
            item.text
          )
        })
      }
      return h(
        'div',
        renderData,
        children
      )
    }
  })

  /**
   * 表单内容包裹组件
   */
  Vue.component('formTemplate', {
    props: {
      // eslint-disable-next-line vue/require-default-prop
      value: null,
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
          children = list.map(function(item) {
            return h(
              ctype, {
                props: {
                  label: item[optionsData.value]
                }
              },
              [
                item[optionsData.label]
              ]
            )
          })
        } else {
          children = list.map(function(item) {
            return h(
              ctype, {
                props: {
                  value: item[optionsData.value],
                  label: item[optionsData.label]
                }
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
            input: function(value) {
              this.$emit('input', value)
              this.change && this.change(value)
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
    render: function(h) {
      if (this.renderFn) {
        return this.renderFn(h)
      }
      return this.switchRender(h)
    }
  })
  // 其他全局组件
  baseRegisters.forEach(name => {
    Vue.component(name, resolveBaseComponent(name))
  })
}
