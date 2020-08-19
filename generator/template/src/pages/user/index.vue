<template>
  <div style="height: 100%">
    <PageModel 
      :config="config"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      config: {
        url: '/User',
        getUrl: '/User',
        addUrl: '/User',
        updUrl: '/User',
        delUrl: '/User',
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
  }
}
</script>