<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => ([])
    },
    sperate: {
      type: String,
      default: '-'
    },
    els: {
      type: Array,
      default: () => ([])
    },
    shortcuts: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      currentIndex: -1
    }
  },
  computed: {
    renderEls() {
      const els = this.els
      const length = els.length
      const _els = []
      for (let i = 0; i < length; i++) {
        _els.push(els[i])
        if (i < length - 1) {
          _els.push({
            eType: 'span'
          })
        }
      }
      return _els
    }
  },
  methods: {
    onchange(index, e) {
      const value = this.value
      this.$set(value, index, e)
      this.$emit('input', value)
      this.currentIndex = -1
    },
    getRealIndex(index) {
      return index - Math.floor(index / 2)
    },
    shortcutClick(cut, index) {
      cut.onClick.call(this, cut)
      this.currentIndex = index
    }
  },
  render(h) {
    const els = this.renderEls
    const shortcuts = this.shortcuts
    return (
      <div class='link-input'>
        {
          els.map((el, index) => {
            const realIndex = this.getRealIndex(index)
            if (el.eType === 'span') {
              return <span class='sperate'>{ this.sperate }</span>
            } else {
              return <div class='link-item'>
                <formTemplate options={el} value={this.value[realIndex]} change={this.onchange.bind(this, realIndex)}></formTemplate>
              </div>
            }
          })
        }
        {
          shortcuts.map((cut, index) => {
            return <span class={['short-cut', this.currentIndex === index ? 'active' : '']} onclick={this.shortcutClick.bind(this, cut, index)}>{cut.text}</span>
          })
        }
      </div>
    )
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.link-input {
  display: flex;
  .sperate {
    margin: 0 10px;
  }
  .short-cut {
    display: inline-block;
    vertical-align: middle;
    padding: 0 10px;
    line-height: 36px;
    height: 36px;
    font-size: 16px;
    border-radius: 4px;
    color: #999;
    margin-left: 10px;
    border: 1px solid;
    box-sizing: border-box;
    cursor: pointer;
    white-space: nowrap;
    &.active {
      color: $theme;
    }
  }
}
</style>
