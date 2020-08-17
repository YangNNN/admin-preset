<template>
  <div class="long-input-wrap">
    <el-input
      :value="value"
      class="el-long-input"
      type="textarea"
      :rows="1"
      :placeholder="placeholder"
      @input="onInput"
    />
    <span v-if="contentLength" class="content-length">{{ contentLength }}words</span>
  </div>
</template>

<script>
export default {
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: null,
    placeholder: {
      type: String,
      default: ''
    }
  },
  computed: {
    contentLength() {
      return typeof this.value === 'string'
        ? this.value.length
        : 0
    }
  },
  methods: {
    onInput(val) {
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="scss">
.long-input-wrap {
  .el-long-input {
    textarea {
      padding-right: 40px;
      resize: none;
      border: none;
      border-radius: 0;
      border-bottom: 1px solid #bfcbd9;
    }
  }
  .content-length {
    position: absolute;
    right: 0;
    color: #666;
    font-size: 14px;
  }
}
</style>
