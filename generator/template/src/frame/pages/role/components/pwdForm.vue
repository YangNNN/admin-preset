<template>
  <el-dialog title="修改密码" :visible.sync="isShow" width="40%">
    <el-form ref="form" :rules="rules" size="mini" :model="roleForm" label-width="80px">
      <el-form-item label="新密码" prop="password">
        <el-input v-model="roleForm.password" :type="passwordType" />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-form-item prop="sort">
        <el-button type="info" @click="isShow = false">取 消</el-button>
        <el-button type="primary" @click="submit">更新密码</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import {
  deepClone
} from '@/utils'
export default {
  data() {
    return {
      isShow: false,
      passwordType: 'password',
      roleForm: {},
      rules: {
        'password': [
          { required: true, message: '请输入新密码' },
          { min: 6, message: '密码不能小于6位', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    showPwd() {
      this.passwordType = this.passwordType === 'password'
        ? 'text'
        : 'password'
    },
    submit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return
        }
        const roleForm = deepClone(this.roleForm)
        await this.$confirm(`是否确定更新密码？`, '提示', {
          type: 'success'
        })
        await this.$axios.post('/System/UpdatePasswordInAdmin', roleForm)
        this.$message.success(`更新成功`)
        this.isShow = false
        this.$emit('success')
      })
    },
    resetValue() {
      this.roleForm = {}
      this.isShow = true
    },
    setValue(role) {
      this.roleForm = {
        auCode: role.auCode,
        password: ''
      }
      this.isShow = true
    }
  }
}
</script>

<style lang="scss" scoped>
.show-pwd {
  position: absolute;
  right: 10px;
}
</style>
