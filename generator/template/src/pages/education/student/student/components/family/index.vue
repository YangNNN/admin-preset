<template>
  <el-dialog :visible.sync="isShow" :title="title">
    <page-model ref="page" :config="config" :staticData="staticData" />
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      isShow: false,
      title: '',
      staticData: {
        studentId: null
      },
      config: {
        init: false,
        size: 'small',
        url: '/api/EducationManage/Family',
        delKey: 'id',
        addButton: {
          text: '新增学生家庭关系'
        },
        searchForm: {
          els: []
        },
        otherParams: {
          studentId: null
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
              label: '亲属关系',
              prop: 'studentRelation'
            },
            {
              label: '姓名',
              prop: 'guardianName'
            },
            {
              label: '手机号',
              prop: 'guardianMobile'
            }
          ]
        },
        form: {
          labelWidth: '120px',
          beforeSubmit(formData) {
            formData.studentId = this.staticData.studentId
            return formData
          },
          els: [
            {
              eType: 'el-input',
              prop: 'studentRelation',
              label: '亲属关系'
            },
            {
              eType: 'el-input',
              prop: 'guardianName',
              label: '姓名'
            },
            {
              eType: 'el-input',
              prop: 'guardianMobile',
              label: '手机号'
            }
          ]
        }
      }
    }
  },
  methods: {
    show(row) {
      this.title = row.studentName + '的家庭关系'
      this.isShow = true
      this.config.otherParams.studentId = row.id
      this.staticData.studentId = row.id
      this.$nextTick(() => {
        this.$refs.page.init()
      })
    }
  }
}
</script>