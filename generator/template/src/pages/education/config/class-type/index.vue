<template>
  <page-model :config="config" />
</template>

<script>
export default {
  data() {
    return {
      config: {
        size: 'small',
        addButton: {
          text: '新增班级类型'
        },
        url: '/api/EducationManage/ClassType',
        delKey: 'id',
        searchForm: {
          els: []
        },
        table: {
          operate: {
            labelWidth: '120px',
            els: [
              {
                text: '编辑',
                type: 'text',
                isEdit: true
              },
              {
                text: '删除',
                type: 'text',
                isDel: true
              }
            ]
          },
          els: [
            {
              label: '班级类型名称',
              prop: 'classTypeName'
            }
          ]
        },
        form: {
          labelWidth: '120px',
          els: [
            {
              eType: 'el-input',
              prop: 'classTypeName',
              label: '班级类型名称'
            }
          ]
        }
      }
    }
  }
}
</script>