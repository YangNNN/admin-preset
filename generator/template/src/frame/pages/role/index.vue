<template>
  <div class="role-container">
    <div class="left-bar">
      <div class="add-father">
        <svg-icon icon-class="component" />
        <span class="btn-add-fa" @click="addRole">新增部门</span>
      </div>
      <roles
        :roles="roles"
        :current.sync="current"
        @del="delRole"
        @edit="editRole"
      />
    </div>
    <div class="right-bar">
      <div class="add-child">
        <span class="title">员工列表</span>
        <div class="btn-add-child" @click="addUser">新增员工</div>
      </div>
      <employee
        ref="employee"
        :ro-code="currole.roCode"
        @edit="setUser"
        @upd-pwd="updPwd"
      />
    </div>
    <roleForm ref="roleForm" @success="getRoles" />
    <pwdForm ref="pwdForm" />
    <userForm ref="userForm" :ro-code="currole.roCode" @success="onRefreshUser" />
  </div>
</template>

<script>
import roles from './components/roles'
import employee from './components/employee'
import pwdForm from './components/pwdForm'
import roleForm from './components/roleForm'
import userForm from './components/userForm'
export default {
  name: 'Role',
  components: {
    roles, employee, roleForm, userForm, pwdForm
  },
  data() {
    return {
      roles: [],
      current: 0
    }
  },
  computed: {
    currole() {
      return this.roles[this.current] || {}
    }
  },
  created() {
    this.getRoles()
  },
  methods: {
    async getRoles() {
      const { data: roles } = await this.$axios.post('/System/GetRolesListInAdmin', {
        queryAll: 1
      })
      this.roles = roles
    },
    addRole() {
      this.$refs.roleForm.resetValue()
    },
    async delRole(role, index) {
      await this.$confirm('确定删除该部门，该操作不可恢复？', '提示', {
        type: 'warning'
      })
      await this.$axios.post('/System/DelRolesInAdmin', {
        roCode: role.roCode
      })
      this.$message.success('删除部门成功!')
      this.getRoles()
      if (index === this.current) {
        this.current = index === 0
          ? 0
          : index - 1
      }
    },
    editRole(role, index) {
      this.$refs.roleForm.setValue(role)
    },
    addUser() {
      this.$refs.userForm.resetValue()
    },
    updPwd(user) {
      this.$refs.pwdForm.setValue(user)
    },
    setUser(user) {
      this.$refs.userForm.setValue(user)
    },
    onRefreshUser() {
      this.$refs.employee.getUsers()
    }
  }
}
</script>

<style lang='scss' scoped>
@import '@/styles/variables.scss';
.role-container {
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
