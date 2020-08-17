<template>
  <el-dialog :visible.sync="isShow">
    <el-form ref="form" :rules="rules" :model="roleForm" label-width="80px">
      <el-form-item label="部门名称" prop="roName">
        <el-input v-model="roleForm.roName" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model.number="roleForm.sort" />
      </el-form-item>
      <el-form-item prop="sort">
        <el-button type="info" @click="isShow = false">取 消</el-button>
        <el-button type="primary" @click="submit">{{ roleForm.id ? '更新部门' : '新增部门' }}</el-button>
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
      roleForm: {},
      rules: {
        'roName': [
          { required: true, message: '请输入部门名称' }
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
        const roleForm = deepClone(this.roleForm)
        let keyWord = ''
        let api = null
        if (roleForm.id) {
          keyWord = '更新'
          api = '/System/UpdateRolesInAdmin'
        } else {
          keyWord = '新增'
          api = '/System/AddRolesInAdmin'
        }
        await this.$confirm(`是否确定${keyWord}部门？`, '提示', {
          type: 'success'
        })
        await this.$axios.post(api, roleForm)
        this.$message.success(`${keyWord}部门成功`)
        this.isShow = false
        this.$emit('success')
      })
    },
    resetValue() {
      this.roleForm = {}
      this.isShow = true
    },
    setValue(role) {
      this.roleForm = deepClone(role)
      this.isShow = true
    }
  }
}
</script>
