<template>
  <div style="height: 100%">
    <page-model 
      :config="config"
      @check="onCheck"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      config: {
        getUrl: '/Project',
        delKey: 'id',
        searchForm: {
          labelWidth: '120px',
          els: [
            {
              eType: 'el-input',
              label: '用户昵称',
              prop: 'userName'
            },
            {
              eType: 'el-input',
              label: '联系电话',
              prop: 'userMobile'
            },
            {
              eType: 'el-input',
              label: '微信号',
              prop: 'wxAccount'
            }
          ]
        },
        table: {
          operate: {
            els: [
              {
                text: '删除',
                isDel: true
              },
              {
                text: '查看s',
                event: 'check'
              }
            ]
          },
          els: [
            {
              prop: 'userName',
              label: '用户名称'
            }
          ]
        },
        hasForm: false
      }
    }
  },
  methods: {
    onCheck(row) {
      this.$router.push('/page/workManage?projectId=' + row.projectId)
    }
  }
}
</script>