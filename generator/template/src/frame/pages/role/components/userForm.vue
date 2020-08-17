<template>
  <el-dialog :visible.sync="isShow">
    <el-form ref="form" :rules="rules" :model="userForm" label-width="80px">
      <el-form-item label="用户名称" prop="auName">
        <el-input v-model="userForm.auName" />
      </el-form-item>
      <el-form-item label="头像" prop="auDesc">
        <ImgUpload v-model="userForm.auDesc" />
      </el-form-item>
      <el-form-item label="用户账号" prop="account">
        <el-input v-model="userForm.account" />
      </el-form-item>
      <el-form-item v-if="!userForm.id" label="用户密码" prop="password">
        <el-input v-model="userForm.password" type="password" />
      </el-form-item>
      <el-form-item label="用户职务" prop="auPost">
        <el-input v-model="userForm.auPost" />
      </el-form-item>
      <el-form-item label="用户手机" prop="auMobile">
        <el-input v-model="userForm.auMobile" />
      </el-form-item>
      <el-form-item prop="sort">
        <el-button type="info" @click="isShow = false">取 消</el-button>
        <el-button type="primary" @click="submit">{{ userForm.id ? '更新用户' : '新增用户' }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import {
  deepClone
} from '@/utils'
export default {
  props: {
    roCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShow: false,
      userForm: {},
      rules: {
        'auName': [
          { required: true, message: '请输入用户名' }
        ],
        'account': [
          { required: true, message: '请输入账号' }
        ]
      }
    }
  },
  methods: {
    submit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return
        }
        const userForm = deepClone(this.userForm)
        if (!userForm.id && !userForm.password) {
          this.$message.warning('请设置用户密码')
          return false
        }
        let keyWord = ''
        let api = null
        if (userForm.id) {
          keyWord = '更新'
          api = '/System/UpdateUserInAdmin'
        } else {
          keyWord = '新增'
          api = '/System/AddUserInAdmin'
        }
        await this.$confirm(`是否确定${keyWord}用户？`, '提示', {
          type: 'success'
        })
        userForm.roCode = this.roCode
        await this.$axios.post(api, userForm)
        this.$message.success(`${keyWord}用户成功`)
        this.isShow = false
        this.$emit('success')
      })
    },
    resetValue() {
      this.userForm = {}
      this.isShow = true
    },
    setValue(user) {
      this.userForm = deepClone(user)
      this.isShow = true
    }
  }
}
</script>
