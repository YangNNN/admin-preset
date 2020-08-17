<template>
  <div :class="{fullscreen:fullscreen}" class="tinymce-container" :style="{width:containerWidth}">
    <textarea :id="tinymceId" class="tinymce-textarea" />
    <div class="editor-custom-btn-container">
      <ImgUpload
        mode="any"
        is-btn
        :value="uploadContent"
        :is-abs="true"
        :qiniu="qiniu"
        mult
        @upload="onUploadContent"
      >
        <el-button size="mini" type="primary" icon="el-icon-upload">上传</el-button>
      </ImgUpload>
    </div>
  </div>
</template>

<script>
/**
 * docs:
 * https://panjiachen.github.io/vue-element-admin-site/feature/component/rich-editor.html#tinymce
 */
import plugins from './plugins'
import toolbar from './toolbar'
import { dynamicLoadScript, createCDNSources } from '@/utils'

export default {
  name: 'Tinymce',
  props: {
    id: {
      type: String,
      default: function() {
        return 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')
      }
    },
    value: {
      type: String,
      default: ''
    },
    toolbar: {
      type: Array,
      required: false,
      default() {
        return []
      }
    },
    menubar: {
      type: String,
      default: 'file edit insert view format table'
    },
    height: {
      type: [Number, String],
      required: false,
      default: 500
    },
    width: {
      type: [Number, String],
      required: false,
      default: 'auto'
    },
    qiniu: {
      type: Boolean,
      default: null
    }
  },
  data() {
    return {
      hasInputChange: false,
      clearTimer: null,
      hasInit: false,
      tinymceId: this.id,
      fullscreen: false,
      languageTypeList: {
        'zh': 'zh_CN',
        'en': 'en',
        'es': 'es_MX',
        'ja': 'ja'
      },
      uploadContent: ''
    }
  },
  computed: {
    containerWidth() {
      const width = this.width
      if (/^[\d]+(\.[\d]+)?$/.test(width)) { // matches `100`, `'100'`
        return `${width}px`
      }
      return width
    }
  },
  watch: {
    value: {
      handler(val) {
        if ((!this.hasInputChange && this.hasInit)) {
          this.$nextTick(() =>
            window.tinymce.get(this.tinymceId).setContent(val || ''))
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.init()
  },
  activated() {
    if (window.tinymce) {
      this.initTinymce()
    }
  },
  deactivated() {
    this.destroyTinymce()
  },
  destroyed() {
    this.destroyTinymce()
  },
  methods: {
    init() {
      if (window.isTinymceIniting) {
        // 存在inidex说明有其他编辑器正在初始化
        setTimeout(() => {
          this.init()
        }, 200)
        return
      }
      window.isTinymceIniting = true
      if (!window.tinymce) {
        dynamicLoadScript(createCDNSources('tinymce', '5.2.1'), 'tinymce', (err) => {
          if (err) {
            this.$message.error(err.message)
            return
          }
          this.initTinymce()
        })
      } else {
        this.initTinymce()
      }
    },
    initTinymce() {
      const _this = this
      window.tinymce.init({
        selector: `#${this.tinymceId}`,
        br_in_pre: false,
        convert_urls: false,
        remove_script_host: false,
        language: this.languageTypeList['zh'],
        language_url: require('./zh_CN.js'),
        height: this.height,
        body_class: 'panel-body',
        object_resizing: false,
        toolbar: this.toolbar.length > 0 ? this.toolbar : toolbar,
        fontsize_formats: '10px 12px 14px 16px 18px 20px 24px 28px 32px 36px 48px',
        menubar: this.menubar,
        plugins: plugins,
        end_container_on_empty_block: true,
        powerpaste_word_import: 'clean',
        code_dialog_height: 450,
        code_dialog_width: 1000,
        advlist_bullet_styles: 'square',
        advlist_number_styles: 'default',
        imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
        default_link_target: '_blank',
        forced_root_block: '',
        link_title: false,
        nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
        init_instance_callback: editor => {
          if (_this.value) {
            editor.setContent(_this.value)
          }
          _this.hasInit = true
          window.isTinymceIniting = false
          editor.on('NodeChange Change KeyUp SetContent', () => {
            _this.hasInputChange = true
            if (_this.clearTimer) {
              clearTimeout(_this.clearTimer)
            }
            _this.clearTimer = setTimeout(() => {
              _this.hasInputChange = false
            }, 1000)
            _this.$emit('input', editor.getContent())
          })
        },
        setup(editor) {
          editor.on('FullscreenStateChanged', (e) => {
            _this.fullscreen = e.state
          })
        }
      })
    },
    destroyTinymce() {
      const tinymce = window.tinymce.get(this.tinymceId)
      if (this.fullscreen) {
        tinymce.execCommand('mceFullScreen')
      }

      if (tinymce) {
        tinymce.destroy()
      }
    },
    setContent(value) {
      window.tinymce.get(this.tinymceId).setContent(value)
    },
    getContent() {
      window.tinymce.get(this.tinymceId).getContent()
    },
    onUploadContent(files) {
      const _this = this
      const tagFn = {
        'image': function(src) {
          return `<img class="wscnph" src="${src}" />`
        },
        'video': function(src) {
          return `
            <p>
               <span class="mce-preview-object mce-object-video" contenteditable="false" data-mce-object="video" data-mce-p-allowfullscreen="allowfullscreen" data-mce-p-frameborder="no" data-mce-p-scrolling="no" data-mce-p-src=${src} data-mce-html="%20">
                 <video src=${src} width="100%" controls></video>
               </span>
            </p>
          `
        }
      }
      files.forEach(file => {
        let fn = null
        if (file.type) {
          fn = tagFn[file.type.split('/')[0]]
        } else {
          const videoSuffixs = ['ogv', 'avi', 'mp4', 'm4v', 'mpeg', 'wmv', 'mov', 'ogm', 'webm', 'asx', 'mpg']
          if (~videoSuffixs.indexOf(file.src.split('.').slice(-1)[0])) {
            fn = tagFn['video']
          } else {
            fn = tagFn['image']
          }
        }
        window.tinymce.get(_this.tinymceId).insertContent(
          fn && fn(file.src)
        )
      })
    }
  }
}
</script>

<style scoped>
.tinymce-container {
  position: relative;
  line-height: normal;
}
.tinymce-container>>>.mce-fullscreen {
  z-index: 10000;
}
.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}
.editor-custom-btn-container {
  position: absolute;
  right: 4px;
  top: 4px;
  z-index: 2;
}
.fullscreen .editor-custom-btn-container {
  z-index: 10000;
  position: fixed;
}
.editor-upload-btn {
  display: inline-block;
}
</style>
