<template>
  <el-dialog :visible.sync="isShow" title="部门权限">
    <el-form
      ref="form"
      :rules="rules"
      :model="powerForm"
      label-width="100px"
      size="mini"
    >
      <el-form-item label="可查看页面" prop="sort">
        <el-tree
          ref="powerTree"
          :data="menus"
          :props="menuProp"
          check-strictly
          empty-text="加载中.."
          show-checkbox
          node-key="muCode"
          :expand-on-click-node="false"
          :default-expand-all="true"
        />
      </el-form-item>
      <el-form-item prop="sort">
        <el-button type="danger" @click="isShow = false">取 消</el-button>
        <el-button type="primary" @click="submit">更新权限</el-button>
        <el-button type="primary" @click="chooseAll">全选</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { tree } from '@/utils'
export default {
  data() {
    return {
      isShow: false,
      powerForm: {},
      menus: null,
      menuProp: {
        label: 'muName',
        children: 'children'
      },
      roCode: null,
      totalCodes: []
    }
  },
  methods: {
    async submit() {
      await this.$axios.post('/System/UpdatePowerInAdmin', {
        roCode: this.roCode,
        muCode: this.$refs.powerTree.getCheckedKeys().join(',')
      })
      this.$message.success('更新权限成功!')
      this.isShow = false
      if (this.roCode === this.$store.state.user.roCode) {
        // 更新自己
        this.$store.dispatch('user/getPower')
      }
    },
    setValue(roCode) {
      this.roCode = roCode
      this.isShow = true
      this.getMenus()
    },
    chooseAll() {
      this.$refs.powerTree.setCheckedKeys(this.totalCode)
    },
    async getMenus() {
      const promises = [
        this.$axios.post('/System/GetMenusListInAdmin'),
        this.$axios.post('/System/GetPowerInAdmin', {
          roCode: this.roCode
        })
      ]
      const [menus, powerData] = await Promise.all(promises)
      console.log(menus, powerData)
      this.totalCode = menus.data.map(menu => menu.muCode)
      this.menus = tree(menus.data, 'muCode', 'pmuCode')
      const powerCodes = powerData.data ? powerData.data.muCode.split(',') : []
      this.$refs.powerTree.setCheckedKeys(powerCodes)
    }
  }
}
</script>
