<template>
  <div class="upload-file-wrap">
    <ImgUpload
      :value="value"
      mode="any"
      is-btn
      @upload="onInput"
    >
      <el-button size="mini" type="primary" icon="el-icon-upload">上传资料</el-button>
    </ImgUpload>
    <div v-if="value" class="data-url-wrap flex-c-center">
      <a class="data-url" target="_blank" :href="value">{{ value }}</a>
      <i class="el-icon-close" @click="clear" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: null
  },
  data() {
    return {}
  },
  methods: {
    onInput(e) {
      this.$emit('input', e[0]?.src)
      this.$emit('upload-success', e)
    },
    async clear() {
      await this.$confirm('是否删除该文件？', '提示', {
        type: 'warning'
      })
      this.$emit('input', '')
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-file-wrap {
  padding-top: 6px;
}
.data-url-wrap {
  padding: 5px;
  border-radius: 4px;
  transition: background-color .3s;
  &:hover {
    background-color: #f5f5fe;
  }
  .data-url {
    color: #666;
    margin-right: 8px;
  }
  i {
    cursor: pointer;
  }
}
</style>
