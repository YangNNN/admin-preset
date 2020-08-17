<template>
  <div
    ref="uploadContainer"
    class="upload-container"
  >
    <input ref="fileUpload" class="file-upload" :accept="accept ? accept : `${mode}/*`" :multiple="mult" type="file" @change="onFilesChange">
    <div
      v-for="(src, index) in srcList"
      :key="src"
      title="点击上传"
      :class="['upload-item', _mode, isBtn ? 'btn-type' : '', src ? 'has-value' : '', isSlot ? 'slot' : '']"
      :style="style"
      @click="onClickItem(index)"
      @drop.stop.prevent="ondrop(index, $event)"
    >
      <!-- 加载中 -->
      <loading :progress="progresses[index]" :mode="mode" @cancelUpload="cancelUpload(index)" />
      <!-- 上传点击区域 -->
      <template v-if="!isBtn">
        <template v-if="src">
          <!-- 图片 -->
          <div v-if="_mode === 'image' || (_mode === 'any' && isImage(src))" class="image-wrap">
            <div class="upload-img" :style="{'backgroundImage': 'url(' + src + ')'}" />
          </div>
          <!-- 音频 -->
          <div v-if="_mode === 'audio' || (_mode === 'any' && isAudio(src))" class="audio-wrap">
            <audio controls :src="src" />
          </div>
          <!-- 视频上传按钮 -->
          <div v-if="_mode === 'video' || (_mode === 'any' && isVideo(src))" class="video-wrap">
            <video controls :src="src" />
          </div>
        </template>
        <template v-else>
          <slot name="custom">
            <i class="el-icon-plus uploader-icon" />
          </slot>
        </template>
        <div v-if="src" class="del-wrap" @click.stop="onDel(index)">
          <i class="el-icon-delete" style="color: #fff;" />
        </div>
      </template>
      <template v-else @click="onClickItem(0)">
        <slot />
      </template>
    </div>
  </div>
</template>

<script>
const axios = window.axios
const CancelToken = axios.CancelToken
import config from '@/config'
import loading from './components/loading'
import { deepClone, guid } from '@/utils'
import { uploadFile as qiniuUploadFile } from '@/utils/qiniu-upload'
import { setFilesName, getFileInfoFromUrl } from './utils/filename'

export default {
  components: {
    loading
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    url: { // 上传api地址
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: () => ({})
    },
    name: { // 文件字段名
      type: String,
      default: 'file'
    },
    // 上传模式 image video file any
    mode: {
      type: String,
      default: 'Image'
    },
    accept: {
      type: String,
      default: ''
    },
    // 多图
    mult: {
      type: Boolean,
      default: false
    },
    // 绝对路径
    isAbs: {
      type: Boolean,
      default: true
    },
    // 是否json格式
    isJson: {
      type: Boolean,
      default: false
    },
    // 是否七牛上传
    qiniu: {
      type: Boolean,
      default: null
    },
    // 容器宽度
    width: {
      type: Number,
      default: null
    },
    // 容器高度
    height: {
      type: Number,
      default: null
    },
    // 是否拖拽上传
    drag: {
      type: Boolean,
      default: false
    },
    // 是否显示成按钮
    isBtn: {
      type: Boolean,
      default: false
    },
    // 是否携带比率
    ratio: {
      type: Boolean,
      default: true
    },
    // 是否携带背景色
    bg: {
      type: Boolean,
      default: true
    },
    onUploadProgress: {
      type: Function,
      default: function() {}
    }
  },
  data() {
    return {
      curIndex: null, // 当前点击的索引值
      uploadFileDom: null, // input元素节点
      progresses: [], // 上传进度信息列表
      guids: [] // 唯一标识列表，对应位置
    }
  },
  computed: {
    head() {
      return config.isProduction ? location.origin : config.baseUrl
    },
    action() {
      return this.head + (this.url || '/api/Upload/File')
    },
    srcList() {
      try {
        const srcList = this.value
          ? this.mult
            ? this.isJson
              ? JSON.parse(this.value).concat('')
              : this.getSplitSrcs(this.value)
            : [this.value]
          : ['']
        return srcList
      } catch (error) {
        return ['']
      }
    },
    isqiniu() {
      return this.qiniu !== null ? this.qiniu : config.qiniu.open
    },
    otherData() {
      return {
        path: `/UploadFile/${this.mode}`,
        ...this.data
      }
    },
    _mode() {
      return this.mode.toLowerCase()
    },
    isAny() {
      return this._mode === 'any'
    },
    style() {
      if (this.width) {
        return {
          width: `${this.width}px`,
          height: `${this.height}px`,
          lineHeight: `${this.height}px`
        }
      } else {
        return {}
      }
    },
    isSlot() {
      return this.$slots.custom
    }
  },
  mounted() {
    if (this.drag) {
      this.initDrag()
    }
  },
  methods: {
    /**
     * 触发打开上传窗口
     */
    triggleUpload() {
      let uploadFileDom = this.uploadFileDom
      if (!uploadFileDom) {
        this.uploadFileDom = uploadFileDom = this.$refs.fileUpload
      }
      uploadFileDom.click()
    },
    /**
     * 清除文件
     */
    clearFile() {
      if (this.uploadFileDom) {
        this.uploadFileDom.value = ''
      }
    },
    initDrag() {
      const container = this.$refs.uploadContainer
      function prevent(e) {
        e.stopPropagation()
        e.preventDefault()
      }
      container.addEventListener('dragleave', prevent)
      container.addEventListener('dragenter', prevent)
      container.addEventListener('dragover', prevent)
    },
    /**
     * drop
     */
    ondrop(index, event) {
      if (!this.drag) {
        return
      }
      this.curIndex = index
      this.onFilesChange({
        target: {
          files: event.dataTransfer.files
        }
      })
    },
    /**
     * @param {index} 点击索引
     */
    onClickItem(index) {
      this.curIndex = index
      this.triggleUpload()
    },
    /**
     * @param {e} 上传事件对象
     */
    async onFilesChange(e) {
      const files = e.target.files
      const validFiles = await this.beforeUpload(files)
      if (validFiles) {
        if (validFiles.length > 0) {
          this.insertSrc(this.curIndex, validFiles.map(file => file.base64Src))
          this.isqiniu ? this.qiniuUpload(validFiles) : this.doUpload(validFiles)
        } else {
          this.$message.warning('没有正确的文件需要上传')
        }
      }
      this.clearFile()
    },
    /**
     * 对文件类型进行校验
     * @param {files} 上传文件列表
     */
    beforeUpload(files) {
      return new Promise(async(resolve) => {
        files = await setFilesName(files)
        let validFiles = []
        const reg = new RegExp(this._mode)
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          if (!reg.test(file.type) && !this.isAny) {
            try {
              await this.$confirm(`${file.name}文件类型不正确，是否跳过继续上传？`, '提示', {
                confirmButtonText: '跳过',
                cancelButtonText: '取消上传',
                type: 'warning'
              })
              continue
            } catch (error) {
              validFiles = false
              break
            }
          } else {
            // gid
            const gid = file.gid = guid()
            this.guids[this.curIndex + i] = gid
            // cancelToken
            file.source = CancelToken.source()
            validFiles.push(file)
          }
        }
        resolve(validFiles)
      })
    },
    /**
     * 正常表单上传文件
     * @param {files} 上传文件列表
     */
    async doUpload(files) {
      const promises = files.map((file, index) => {
        const action = this.action
        const formData = new FormData()
        formData.append(this.name, file)
        formData.append('filename', file.newname)
        const otherData = this.otherData
        for (const k in otherData) {
          formData.append(k, otherData[k])
        }
        const promise = axios({
          url: action,
          method: 'post',
          data: formData,
          cancelToken: file.source.token,
          onUploadProgress: this.setProgress.bind(this, file.gid, file.source)
        })
        promise.gid = file.gid
        return promise
      })
      let successResults = await this.postPromises(promises)
      if (successResults.length) {
        successResults = successResults.map(result => {
          return {
            file: result.config.data.get(this.name),
            data: result.data.data
          }
        })
        this.uploadDone(successResults)
      }
    },
    /**
     * 七牛云表单上传
     * @param {files} 上传文件列表
     */
    async qiniuUpload(files) {
      const promises = files.map((file, index) => {
        const promise = qiniuUploadFile(file, this.setProgress.bind(this, file.gid, file.source))
        promise.gid = file.gid
        return promise
      })
      let successResults = await this.postPromises(promises)
      if (successResults.length) {
        successResults = successResults.map(result => {
          return {
            file: result.data.file,
            data: result.data.url
          }
        })
        this.uploadDone(successResults)
      }
    },
    postPromises(promises) {
      return new Promise(resolve => {
        const results = []
        let count = 0
        function complete() {
          if (count !== promises.length) {
            return
          }
          const successResults = results
            .filter(result => {
              return result.data.result
            })
          resolve(successResults)
        }
        promises.forEach(async(promise, index) => {
          try {
            results[index] = await promise
          } catch (error) {
            // 出错删除
            const index = this.getGuidIndex(promise.gid)
            this.deleteUpload(index)
          } finally {
            count++
            complete()
          }
        })
      })
    },
    /**
     * 上传结束
     * @param { successResults } 成功上传的文件
     * @param { [key]file } 文件本身
     * @param { [key]data } 上传文件地址
     */
    uploadDone(successResults) {
      const self = this
      const head = this.head
      function appendHead(src, result) {
        if (self.isAbs && !self.isqiniu) {
          src = head + src
        }
        return src
      }
      if (!this.isBtn) {
        const srctexts = successResults.map(result => {
          return appendHead(result.data, result)
        })
        const startIndex = this.getGuidIndex(successResults[0].file.gid)
        this.insertSrc(startIndex, srctexts, srctexts.length)
      } else {
        const srcs = successResults.map(result => {
          return {
            src: appendHead(result.data, result),
            type: result.file.type
          }
        })
        this.$emit('upload', srcs)
      }
    },
    async onDel(index) {
      await this.$confirm('确定要删除该文件吗？', '提示', {
        type: 'warning'
      })
      this.deleteUpload(index, 1)
    },
    insertSrc(insertIndex, insertList = [], deleteCount = 1) {
      const srcList = deepClone(this.srcList)
      srcList.splice(insertIndex, deleteCount, ...insertList)
      this.doEmitData(srcList)
    },
    deleteSrc(deleteIndex, deleteCount) {
      const srcList = deepClone(this.srcList)
      srcList.splice(deleteIndex, deleteCount)
      this.doEmitData(srcList)
    },
    doEmitData(srcList) {
      srcList = srcList.filter(src => src)
      const emitData = this.isJson
        ? JSON.stringify(srcList)
        : srcList.join(',')
      this.$emit('input', emitData)
    },
    deleteUpload(index) {
      this.deleteSrc(index, 1)
      this.progresses.splice(index, 1)
      this.guids.splice(index, 1)
    },
    getSplitSrcs(value) {
      const srcs = []
      const array = value.split(',')
      let isMatchBase64 = false
      for (let i = 0; i < array.length; i++) {
        const item = array[i]
        if (isMatchBase64) {
          srcs.push(array[i - 1] + ',' + item)
          isMatchBase64 = false
        } else {
          if (/^data:.+base64$/.test(item)) {
            isMatchBase64 = true
          } else {
            srcs.push(item)
            isMatchBase64 = false
          }
        }
      }
      return srcs.concat('')
    },
    // 设置对应上传进度条数据
    setProgress(gid, source, progressEvent) {
      const loaded = progressEvent.loaded
      const total = progressEvent.total
      const index = this.getGuidIndex(gid)
      const progressInfo = {
        progressEvent,
        loaded,
        total,
        percent: (loaded / total * 100).toFixed(2),
        isComplete: loaded === total
      }
      this.onUploadProgress && this.onUploadProgress(index, progressInfo)
      this.$set(this.progresses, index, {
        gid,
        source,
        ...progressInfo
      })
    },
    // 通过guid确定坐标位置
    getGuidIndex(gid) {
      return this.guids.findIndex(id => id === gid)
    },
    // 取消上传
    cancelUpload(index) {
      this.progresses[index].source.cancel('cancel')
    },
    isAudio(url) {
      const info = getFileInfoFromUrl(url)
      return info.t === 'audio'
    },
    isImage(url) {
      const info = getFileInfoFromUrl(url)
      return info.t === 'image'
    },
    isVideo(url) {
      const info = getFileInfoFromUrl(url)
      return info.t === 'video'
    }
  }
}
</script>

<style lang='scss'>
.upload-container {
  .file-upload {
    position: absolute;
    visibility: hidden;
    z-index: -10;
  }
  .upload-item {
    display: inline-block;
    vertical-align: top;
    text-align: center;
    margin-right: 10px;
    margin-bottom: 10px;
    position: relative;
    background-color: #fbfdff;
    cursor: pointer;
    border: 1px dashed #c0ccda;
    border-radius: 4px;
    width: 98px;
    height: 98px;
    line-height: 98px;
    font-size: 0;
    &.slot {
      border: none;
    }
    &.image {
      width: 98px;
      height: 98px;
      line-height: 98px;
      font-size: 0;
      & > div:first-child {
        width: 100%;
        height: 100%;
      }
      &.has-value {
        border: 1px solid #c0ccda;
      }
    }
    &.video {
      width: 300px;
      height: 200px;
      line-height: 200px;
      .uploader-icon {
        font-size: 50px;
      }
    }
    &.audio {
      width: 300px;
      height: 100px;
      line-height: 100px;
      .uploader-icon {
        font-size: 50px;
      }
    }
    &.btn-type {
      width: auto;
      height: auto;
      line-height: normal;
      border: none;
    }
    .upload-img {
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
    audio {
      vertical-align: middle;
    }
    .image-wrap {
      width: 100%;
      height: 100%
    }
    .video-wrap, video {
      height: 100%;
      width: 100%;
    }
    .uploader-icon {
      font-size: 28px;
      color: #8c939d;
      text-align: center;
      vertical-align: middle;
    }
    &:hover {
      .del-wrap {
        height: 30px;
      }
    }
    .del-wrap {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background-color: rgba($color: #000000, $alpha: 0.7);
      line-height: 30px;
      height: 30px;
      height: 0px;
      overflow: hidden;
      transition: height .3s;
      text-align: center;
      cursor: pointer;
      i {
        font-size: 22px;
      }
    }
  }
}
</style>
