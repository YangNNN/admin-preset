<template>
  <div class="menu-container">
    <div class="left-bar">
      <div class="add-father">
        <svg-icon icon-class="component" />
        <span class="btn-add-fa" @click="onAddFaMenu">新增菜单</span>
      </div>
      <father
        :menus="treeData"
        :current.sync="current"
        @del="delMenu"
        @edit="editMenu"
      />
    </div>
    <div class="right-bar">
      <div class="add-child">
        <span class="title">子菜单</span>
        <div class="btn-add-child" @click="onAddChildMenu">新增子菜单</div>
      </div>
      <children
        ref="children"
        :menus="children"
        @del="delMenu"
        @edit="editMenu"
      />
    </div>

    <menuForm
      ref="menuForm"
      :menus="treeData"
      @refresh="getTreeData"
    />

  </div>
</template>

<script>
import father from './components/father'
import children from './components/children'
import menuForm from './components/menuForm'
import { tree } from '@/utils'
export default {
  name: 'menu',
  components: {
    father,
    children,
    menuForm
  },
  data() {
    return {
      treeData: [],
      current: 0
    }
  },
  computed: {
    children() {
      return this.treeData[this.current]
        ? this.treeData[this.current].children || []
        : []
    }
  },
  created() {
    this.getTreeData()
  },
  methods: {
    onAddFaMenu() {
      this.$refs.menuForm.resetValue()
    },
    onAddChildMenu() {
      const current = this.treeData[this.current]
      this.$refs.menuForm.resetValue(current ? current.muCode : null)
    },
    editMenu(menu) {
      this.$refs.menuForm.setValue(menu)
    },
    async delMenu(menu, index, isChild) {
      await this.$confirm('确定删除该菜单？', '提示', {
        type: 'warning'
      })
      await this.$axios.post('/System/DelMenusInAdmin', {
        muCode: menu.muCode,
        token: true
      })
      this.$message.success('删除菜单成功!')
      this.$store.dispatch('user/getPower')
      this.getTreeData()
      if (!isChild && index === this.current) {
        this.current = index === 0
          ? 0
          : index - 1
      }
    },
    async getTreeData() {
      let { data } = await this.$axios.post('/System/GetMenusListInAdmin', {
        queryAll: 1
      })
      data = data.sort((a, b) => b.sort - a.sort)
      this.treeData = tree(data, 'muCode', 'pmuCode')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.menu-container {
  height: calc(100vh - 84px);
  position: relative;
  .left-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    box-sizing: border-box;
    border-right: 1px solid #EBEEF5;
    padding: 20px;
  }
  .right-bar {
    margin-left: 300px;
  }
}
.add-father {
  color: $theme;
  line-height: 20px;
  height: 20px;
  .btn-add-fa {
    margin-left: 10px;
    cursor: pointer;
  }
}
.add-child {
  display: flex;
  align-items: center;
  height: 66px;
  padding: 0 30px;
  border-bottom: 1px solid #EBEEF5;
  box-sizing: border-box;
  .title {
    flex-grow: 1;
    color: #666666;
    font-size: 18px;
    font-weight: 600;
  }
  .btn-add-child {
    background-color: $theme;
    border-radius: 4px;
    width: 94px;
    text-align: center;
    line-height: 40px;
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
  }
}
</style>
