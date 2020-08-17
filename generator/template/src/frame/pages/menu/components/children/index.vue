<template>
  <div class="table-wrap">
    <el-table :data="menus">
      <el-table-column prop="muName" label="名称" />
      <el-table-column label="图标">
        <template v-slot="{row, $index}">
          <svg-icon :icon-class="row.muIcon" />
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" />
      <el-table-column label="操作">
        <template v-slot="{row, $index}">
          <div class="btn" @click="editMenu(row, $index)">编辑</div>
          <div class="btn" @click="delMenu(row, $index)">删除</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    menus: {
      type: Array,
      default: () => ([])
    }
  },
  methods: {
    delMenu(menu, index) {
      this.$emit('del', menu, index, true)
    },
    editMenu(menu, index) {
      this.$emit('edit', menu, index)
    }
  }
}
</script>

<style lang="scss" scoped>
.table-wrap {
  padding: 20px 40px;
  .btn {
    color: #606266;
    cursor: pointer;
    display: inline-block;
    font-size: 14px;
    &+.btn {
      margin-left: 10px;
    }
  }
}
</style>
