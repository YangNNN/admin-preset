<template>
  <div class="employee-table">
    <el-table :data="users">
      <el-table-column label="用户名" prop="auName" />
      <el-table-column label="头像" prop="auDesc">
        <template v-slot="{row}">
          <div class="avatar-bg small" :style="{backgroundImage: `url(${row.auDesc})`}" />
        </template>
      </el-table-column>
      <el-table-column label="账号" prop="account" />
      <el-table-column label="职务" prop="auPost" />
      <el-table-column label="手机号" prop="auMobile" />
      <el-table-column label="操作" width="300">
        <template v-slot="{ row }">
          <el-button size="mini" type="primary" icon="el-icon-unlock" @click="updPwd(row)">改密码</el-button>
          <el-button size="mini" type="success" icon="el-icon-edit" @click="editUser(row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="delUser(row.auCode)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    roCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      users: []
    }
  },
  watch: {
    roCode: {
      handler() {
        this.getUsers()
      },
      immediate: true
    }
  },
  methods: {
    async getUsers() {
      const { data: users } = await this.$axios.post('/System/GetUserListInAdmin', {
        roCode: this.roCode,
        queryAll: 1
      })
      this.users = users
    },
    async delUser(auCode) {
      await this.$confirm('确定删除该用户，该操作不可恢复？', '提示', {
        type: 'warning'
      })
      await this.$axios.post('/System/DelUserInAdmin', {
        auCode
      })
      this.$message.success('删除用户成功!')
      this.getUsers()
    },
    editUser(user) {
      this.$emit('edit', user)
    },
    updPwd(user) {
      this.$emit('upd-pwd', user)
    }
  }
}
</script>

<style lang="scss" scoped>
.employee-table {
  padding: 20px 40px;
}
</style>
