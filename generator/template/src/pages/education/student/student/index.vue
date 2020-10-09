<template>
  <div style="height: 100%">
    <page-model
      ref="page"
      :reflections="reflections"
      :config="config"
      @grade-change="onGradeChange"
      @grade-change2="onGradeChange2"
      @family="showFamily"
    />
    <family ref="family" />
  </div>
</template>

<script>
  import FileUpload from '@/frame/components/file-upload'
  import { StudentStatus, Sex } from 'pages/education/utils/enum'
  import { convertEnumToArray, jsonClone } from '@/utils'
  import family from './components/family'
  export default {
    components: {
      FileUpload,
      family
    },
    data() {
      return {
        reflections: {
          grades: [],
          classes: [],
          classes2: []
        },
        config: {
          reflect: true,
          overflowScroll: true,
          stickyHeader: true,
          size: 'small',
          addButton: {
            icon: 'school',
            text: '新增学生'
          },
          url: '/api/EducationManage/Student',
          delKey: 'id',
          searchForm: {
            labelWidth: '120px',
            els: [
              {
                eType: 'el-select',
                label: '年级',
                prop: 'gradeAdjustId',
                optionsData: {
                  _reflect: 'grades',
                  list: [],
                  label: 'gradeName',
                  value: 'gradeAdjustId'
                },
                events: {                  
                  change(val) {
                    this.$parent.$emit('grade-change', val)
                  }
                }
              },
              {
                eType: 'el-select',
                label: '班级',
                prop: 'classAdjustId',
                optionsData: {
                  _reflect: 'classes',
                  list: [],
                  label: 'className',
                  value: 'classAdjustId'
                },
                isDisabled(row) {
                  return !!row.gradeAdjustId
                }
              }
            ]
          },
          table: {
            operate: {
              width: 80,
              els: [
                {
                  text: '编辑',
                  type: 'text',
                  isEdit: true,
                  clear: true
                },
                {
                  text: '删除',
                  type: 'text',
                  isDel: true
                },
                {
                  text: '家庭关系',
                  type: 'text',
                  event: 'family'
                }
              ]
            },
            els: [
              {
                label: '姓名',
                prop: 'studentName',
                width: 200
              },
              {
                label: '学号',
                prop: 'studentCode',
                width: 200
              },
              {
                label: '性别',
                renderFn(row) {
                  return (
                    <el-tag 
                      size="mini" 
                      type={ row.studentSex === Sex['男'] ? 'primary' : 'warning' }
                    >
                      { Sex[row.studentSex] }
                    </el-tag>
                  )
                }
              },
              {
                label: '出生日期',
                prop: 'studentBirth',
                renderFn(row) {
                  return (
                    <div>
                      { row.studentBirth ? row.studentBirth.split(' ')[0] : '' }
                    </div>
                  )
                },
                width: 200
              },
              {
                label: '监护人电话',
                prop: 'guardianMobile',
                width: 200
              },
              {
                label: '状态',
                prop: 'studentStatus',
                renderFn(row) {
                  return (
                    <el-tag size="mini" type={ ['success', 'info'][row.studentStatus] }>{ ['在读', '离校'][row.studentStatus] }</el-tag>
                  )
                }
              }
            ]
          },
          form: {
            labelWidth: '120px',
            bindData(formData) {
              this.$parent.$parent.$emit('grade-change2', formData.gradeAdjustId)
              return formData
            },
            els: [
              {
                eType: 'el-select',
                label: '年级',
                prop: 'gradeAdjustId',
                optionsData: {
                  _reflect: 'grades',
                  list: [],
                  label: 'gradeName',
                  value: 'gradeAdjustId'
                },
                change(formData, value, label) {
                  formData.gradeName = label
                  this.$parent.$parent.$emit('grade-change2', value)
                },
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-select',
                label: '班级',
                prop: 'classAdjustId',
                optionsData: {
                  _reflect: 'classes2',
                  list: [],
                  label: 'className',
                  value: 'classAdjustId'
                },
                change(formData, value, label) {
                  formData.className = label
                },
                col: { lg: { span: 16 } }
              },
              {
                eType: 'el-input',
                label: '姓名',
                prop: 'studentName',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-input',
                label: '姓名拼音',
                prop: 'namePinyin',
                col: { lg: { span: 16 } }
              },
              {
                eType: 'img-upload',
                label: '学生照片',
                prop: 'studentPhoto',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-date-picker',
                label: '出生日期',
                prop: 'studentBirth',
                col: { lg: { span: 16 } }
              },
              {
                eType: 'el-radio-group',
                label: '性别',
                prop: 'studentSex',
                optionsData: {
                  list: convertEnumToArray(Sex, 1)
                },
                col: { lg: { span: 16 } }
              },
              {
                eType: 'el-date-picker',
                label: '入校日期',
                prop: 'entranceDate',
                col: { lg: { span: 16 } }
              },
              {
                eType: 'el-select',
                label: '身份证类型',
                prop: 'identityType',
                optionsData: {
                  list: [
                    {
                      label: '居民身份证',
                      value: 0
                    }
                  ]
                },
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-input',
                label: '身份证号',
                prop: 'identityCard',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-select',
                label: '户口性质',
                prop: 'householdRegister',
                optionsData: {
                  list: [
                    {
                      label: '农村',
                      value: 0
                    },
                    {
                      label: '城市',
                      value: 1
                    }
                  ]
                },
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-select',
                label: '非农业户口性质',
                prop: 'noAgriculturalHousehold',
                optionsData: {
                  list: [
                    {
                      label: '城市1',
                      value: 0
                    },
                    {
                      label: '城市2',
                      value: 1
                    }
                  ]
                },
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-input',
                label: '国籍',
                prop: 'nationality',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-input',
                label: '民族',
                prop: 'national',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-input',
                label: '籍贯',
                prop: 'nativePlace',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-input',
                label: '家庭号码',
                prop: 'familyMobile',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-input',
                label: '家庭地址',
                prop: 'familyAddress',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-input',
                label: '监护人姓名',
                prop: 'guardianName',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-input',
                label: '监护人号码',
                prop: 'guardianMobile',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-select',
                label: '监护人证件类型',
                prop: 'guardianIdentityType',
                optionsData: {
                  list: [
                    {
                      label: '居民身份证',
                      value: 0
                    }
                  ]
                },
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-input',
                label: '监护人证件号',
                prop: 'guardianIdentityCard',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-select',
                label: '学生状态',
                prop: 'studentStatus',
                optionsData: {
                  list: convertEnumToArray(StudentStatus, 1)
                },
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-select',
                label: '健康状态',
                prop: 'healthStatus',
                optionsData: {
                  list: [
                    {
                      label: '健康',
                      value: 0
                    },
                    {
                      label: '亚健康',
                      value: 1
                    },
                    {
                      label: '不良',
                      value: 2
                    }
                  ]
                },
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-input',
                label: '是否港澳台',
                prop: 'isGT',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-select',
                label: '是否留守儿童',
                prop: 'isLeave',
                optionsData: {
                  list: [
                    {
                      label: '否',
                      value: 0
                    },
                    {
                      label: '是',
                      value: 1
                    }
                  ]
                },
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-switch',
                label: '是否进城务工子女',
                prop: 'isCityWork',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-switch',
                label: '是否孤儿',
                prop: 'isOrphan',
                col: { lg: { span: 8 } }
              },
              {
                eType: 'el-switch',
                label: '是否残疾人',
                prop: 'isDisability',
                col: { lg: { span: 8 } }
              }
            ]
          }
        }
      }
    },
    created() {
      this.getGrades()
    },
    methods: {
      showFamily(row) {
        this.$refs.family.show(row)
      },
      onGradeChange(e) {
        this.getClasses(e)
      },
      onGradeChange2(e) {
        this.getClasses(e, true)
      },
      async getGrades() {
        this.reflections.grades = await this.$axios.get('/api/EducationManage/GetGradeDropList', {
          queryAll: 1
        }, {
          processDeep: true
        })
      },
      async getClasses(gradeId, isForm) {
        const classes = await this.$axios.get('/api/EducationManage/GetClassDropList', {
          queryAll: 1,
          gradeAdjustId: gradeId
        }, {
          processDeep: true
        })
        if (!isForm) {
          this.reflections.classes = classes
        } else {
          this.reflections.classes2 = classes
        }
      }
    }
  }
</script>