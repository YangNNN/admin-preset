<template>
  <div style="height: 100%">
    <page-model 
      :config="config"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      config: {
        isWatch: true,
        size: 'mini',
        url: '/Project/Type',
        delUrl: '/Project/Type/:id',
        delKey: 'id',
        otherParams: {
          projectId: null
        },
        searchForm: {
          labelWidth: '120px',
          els: [
            {
              eType: 'el-input',
              label: '用户昵称',
              prop: 'projectName'
            }
          ]
        },
        table: {
          operate: {
            width: '200px',
            els: [
              {
                text: '编辑',
                isEdit: true
              },
              {
                text: '删除',
                isDel: true
              }
            ]
          },
          els: [
            {
              prop: 'projectName',
              label: '名称',
              renderFn(row) {
                return (
                  <div>{ row.projectName }</div>
                )
              }
            },
            {
              width: '200px',
              prop: 'projectName',
              label: '名称',
              renderFn(row) {
                return (
                  <div>{ row.projectName }</div>
                )
              }
            },
            {
              width: '200px',
              prop: 'projectName',
              label: '名称',
              renderFn(row) {
                return (
                  <div>{ row.projectName }</div>
                )
              }
            }
          ]
        },
        form: {
          labelWidth: '120px',
          els: [
            {
              eType: 'el-input',
              prop: 'projectName',
              label: '名称'
            }
          ]
        }
      }
    }
  },
  watch: {
    '$route.query': {
      handler(query) {
        if (query.projectId) {
          setTimeout(() => {
            this.config.otherParams.projectId = query.projectId
          }, 1000);
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
  }
}
</script>