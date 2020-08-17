<template>
  <el-dialog :visible.sync="isShow">
    <el-form class="menu-form" label-width="100px">
      <el-form-item label="上级菜单" prop="muCode">
        <el-cascader
          v-model="pmuCodes"
          :options="menus"
          :props="props"
          @change="onChange"
        />
      </el-form-item>
      <el-form-item label="菜单名称" prop="muName">
        <el-input v-model="formData.muName" size="small" />
      </el-form-item>
      <el-form-item label="菜单图标" prop="muIcon">
        <el-row>
          <el-col v-for="icon in iconList" :key="icon" :span="4">
            <div
              class="svg-box"
              :class="{'selected': formData.muIcon === icon}"
              @click="onSetIcon(icon)"
            >
              <svg-icon :icon-class="icon" />
            </div>
          </el-col>
          <el-col :span="4">
            <div
              class="svg-box"
              :class="{'selected': formData.muIcon === ''}"
              @click="onSetIcon('')"
            >
              <span>空</span>
            </div>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="菜单排序" prop="sort">
        <el-input-number v-model.number="formData.sort" size="small" />
      </el-form-item>
      <el-form-item label="是否叶子节点" prop="isChild">
        <el-switch v-model="formData.isChild" on-text="" off-text="" />
      </el-form-item>
      <el-form-item v-show="formData.isChild" label="菜单URL" prop="muUrl">
        <el-input v-model="formData.muUrl" size="small" />
      </el-form-item>
      <el-form-item>
        <div class="pop-center-btn-wrap">
          <el-button type="success" @click="submit">
            {{ formData.id ? '修改菜单' : '添加菜单' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { keys } from '@/frame/icons'
import { deepClone } from '@/utils'
export default {
  props: {
    menus: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      isShow: false,
      formData: {},
      iconList: keys.map(item => item.slice(2, -4)),
      props: {
        label: 'muName',
        value: 'muCode',
        checkStrictly: true
      },
      pmuCodes: []
    }
  },
  methods: {
    onChange(e) {
      this.$set(this.formData, 'pmuCode', e[e.length - 1])
    },
    onSetIcon(icon) {
      this.$set(this.formData, 'muIcon', icon)
    },
    resetValue(pmuCode) {
      this.isShow = true
      this.formData = {}
      if (pmuCode) {
        this.pmuCodes = [pmuCode]
        this.formData.pmuCode = pmuCode
      } else {
        this.pmuCodes = []
      }
    },
    setValue(formData) {
      this.isShow = true
      this.formData = deepClone(formData)
      this.formData.isChild = !!this.formData.isChild
      this.setpmuCodes()
    },
    setpmuCodes() {
      const pmuCode = this.formData.pmuCode
      if (!pmuCode) {
        this.pmuCodes = []
        return false
      }
      const pmuCodes = []
      const menus = this.menus
      function search(data, deep) {
        let isFind = false
        for (let i = 0; i < data.length; i++) {
          const menu = data[i]
          if (menu.muCode === pmuCode) {
            isFind = true
            pmuCodes[deep] = menu.muCode
            break
          } else {
            if (menu.children && menu.children.length > 0) {
              if (search(menu.children, deep + 1)) {
                isFind = true
                pmuCodes[deep] = menu.muCode
                break
              }
            }
          }
        }
        return isFind
      }
      search(menus, 0)
      this.pmuCodes = pmuCodes
    },
    async submit() {
      const formData = deepClone(this.formData)
      formData.isChild = formData.isChild ? 1 : 0
      if (formData.id) {
        await this.$axios.post('/System/UpdateMenusInAdmin', formData)
        this.$message.success('更新菜单成功!')
      } else {
        await this.$axios.post('/System/AddMenusInAdmin', formData)
        this.$message.success('新增菜单成功!')
      }
      this.isShow = false
      this.$emit('refresh')
      this.$store.dispatch('user/getPower')
    }
  }
}
</script>

<style lang="scss">
.svg-box {
  display: inline-block;
  padding: 0 4px;
  cursor: pointer;
  &.selected {
    background-color: #eee;
  }
}
</style>
