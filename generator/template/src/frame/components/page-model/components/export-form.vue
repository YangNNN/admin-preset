<template>
  <el-dialog :visible.sync="isShow" title="导出数据" width="600px">
    <div class="button-wrap">
      <el-button size="default" @click="exportData(0)">导出当前页</el-button>
      <el-button size="default" @click="exportData(1)">导出全部</el-button>
    </div>
    <div class="tips">
      <i class="el-icon-info" />
      导出数据基于当前页面的筛选参数,以上选项在此基础上进行扩展
    </div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      isShow: false
    }
  },
  methods: {
    show() {
      this.isShow = true
    },
    exportData(mode) {
      this.$emit('confirm', mode)
      this.isShow = false
    }
  }
}
</script>

<style lang="scss">
.button-wrap {
  text-align: center;;
  padding: 10px 0;
}
.tips {
  font-size: 12px;
  color: #999;
  padding-top: 10px;
}
</style>
