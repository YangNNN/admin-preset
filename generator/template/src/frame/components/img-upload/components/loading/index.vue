<template>
  <div
    v-show="progress && progress.loaded && !progress.isComplete"
    class="loading-mask"
    :class="['loading-mask', mode]"
    @click.stop
  >
    <div class="loading-content">
      <div class="loading-text">{{ progress.percent }}%</div>
      <div class="progress-box">
        <div class="progress-bar" :style="{ width: `${progress.percent}%` }" />
      </div>
      <div class="loading-text">上传中...请勿保存</div>
      <div class="btn-cancel" @click.stop="cancelUpload">取消上传</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    mode: {
      type: String,
      default: 'image'
    },
    progress: {
      type: Array,
      default: () => ({})
    }
  },
  methods: {
    cancelUpload() {
      this.$emit('cancelUpload')
    }
  }
}
</script>

<style lang="scss" scoped>
  // 加载区域
  .loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, .9);
    z-index: 1;
  }
  .loading-content {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    right: 0;
    line-height: 1;
    text-align: center;
    font-size: 12px;
  }
  .loading-text {
    color: #666;
    padding: 0.5em 0;
  }
  .progress-box {
    display: inline-block;
    position: relative;
    height: 10px;
    overflow: hidden;
    width: 80%;
    background-color: #8c939d;
    border-radius: 10px;
  }
  .progress-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background-color: #42b983;
    z-index: 1;
  }
  .btn-cancel {
    color: #999;
  }
</style>
