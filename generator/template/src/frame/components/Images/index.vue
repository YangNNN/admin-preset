<template>
  <div v-if="value" class="images">
    <div
      v-for="img in imgs"
      :key="img"
      :class="[ 'img-item', isClick ? 'isclick' : '', avatar ? 'avatar' : '', border ? 'border' : '' ]"
      :style="{ backgroundImage: `url(${img})`, width: `${width}px`, height: `${height}px`, backgroundColor, backgroundSize: mode }"
      @click="onClick(img)"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    backgroundColor: {
      type: String,
      default: '#eee'
    },
    mode: {
      type: String,
      default: 'contain'
    },
    avatar: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: false
    },
    json: {
      type: Boolean,
      default: false
    },
    sperate: {
      type: String,
      default: ','
    },
    isClick: {
      type: Boolean,
      default: true
    },
    width: {
      type: Number,
      default: 60
    },
    height: {
      type: Number,
      default: 60
    }
  },
  computed: {
    imgs() {
      if (this.json) {
        return JSON.parse(this.value)
      } else {
        return this.value.split(this.sperate)
      }
    }
  },
  methods: {
    onClick(img) {
      if (!this.isClick) {
        return
      }
      window.open(img)
    }
  }
}
</script>

<style lang="scss" scoped>
.images {
  font-size: 0;
  line-height: 1;
  .img-item {
    display: inline-block;
    background-position: center;
    background-repeat: no-repeat;
    box-sizing: border-box;
    &.isclick {
      cursor: pointer;
    }
    &.avatar {
      border-radius: 50%;
    }
    &.border {
      border: 1px solid #E8E8E8;
    }
    &+.img-item {
      margin-left: 10px;
    }
  }
}
</style>
