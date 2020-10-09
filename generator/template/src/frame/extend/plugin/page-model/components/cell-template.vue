<script>
  export default {
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
    render: function (h) {
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
  }
</script>