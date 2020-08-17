<template>
  <el-dialog title="修改密码" :visible.sync="isShow" width="40%" append-to-body>
    <el-form ref="form" :rules="rules" size="mini" :model="formData" label-width="80px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="formData.oldPassword" :type="passwordType1" />
        <span class="show-pwd" @click="showPwd(1)">
          <svg-icon :icon-class="passwordType1 === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input v-model="formData.password" :type="passwordType2" />
        <span class="show-pwd" @click="showPwd(2)">
          <svg-icon :icon-class="passwordType2 === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-form-item prop="sort">
        <el-button type="info" @click="isShow = false">取 消</el-button>
        <el-button type="primary" @click="submit">修改密码</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      isShow: false,
      passwordType1: 'password',
      passwordType2: 'password',
      formData: {},
      rules: {
        oldPassword: [
          { required: true, message: '请输入原密码' }
        ],
        'password': [
          { required: true, message: '请输入新密码' },
          { min: 6, message: '密码不能小于6位', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    showPwd(num) {
      this[`passwordType${num}`] = this[`passwordType${num}`] === 'password'
        ? 'text'
        : 'password'
    },
    show() {
      this.isShow = true
      this.formData = {}
    },
    submit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return
        }
        await this.$confirm(`是否确定更新密码？`, '提示', {
          type: 'success'
        })
        await this.$axios.post('/System/UpdatePasswordInMember', {
          ...this.formData,
          id: this.$store.state.user.userInfo.mId
        })
        this.$message.success(`更新成功`)
        this.isShow = false
      })
    },
    resetValue() {
      this.formData = {}
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
