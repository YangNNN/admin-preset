<template>
  <div class="container" style="height: 100%;">
    <PageModel
      ref="page"
      :config="config"
      @first-execute="firstExecute"
      @re-execute="reExecute"
      @stop="stopExecute"
    />
  </div>
</template>

<script>
import PageModel from '@/frame/components/PageModel'
export default {
  name: 'schedule',
  components: {
    PageModel
  },
  data() {
    return {
      config: {
        overflowScroll: true,
        name: {
          title: '任务调度'
        },
        getUrl: '/api/Schedule/GetScheduleList',
        addUrl: '/api/Schedule/AddScheduleJobTask',
        updUrl: '/api/Schedule/UpdateScheduleJobTast',
        delUrl: '/api/Schedule/DeleteScheduleJob',
        delKey: 'id',
        searchForm: {
          labelWidth: '100px',
          els: [
            {
              label: '任务名称',
              prop: 'jobName',
              eType: 'el-input',
              attrs: {
                placeholder: '请输入任务名称'
              }
            }
          ]
        },
        table: {
          size: 'mini',
          operate: {
            width: 320,
            els: [
              {
                text: '开始执行',
                size: 'mini',
                type: 'success',
                event: 'first-execute',
                clear: true,
                isShow(row) {
                  return row.jobStatus == null
                },
                isDisabled(row) {
                  return row.jobStatus != null
                }
              },
              {
                text: '回复执行',
                size: 'mini',
                type: 'success',
                event: 're-execute',
                clear: true,
                isShow(row) {
                  return row.jobStatus != null
                },
                isDisabled(row) {
                  return row.jobStatus !== 0
                }
              },
              {
                text: '编辑',
                size: 'mini',
                type: 'plain',
                isEdit: true
              },
              {
                text: '停止',
                size: 'mini',
                type: 'plain',
                event: 'stop',
                isDisabled(row) {
                  return row.jobStatus !== 1
                }
              },
              {
                text: '删除',
                size: 'mini',
                type: 'danger',
                isDel: true,
                isDisabled(row) {
                  return row.jobStatus !== 0
                }
              }
            ]
          },
          els: [
            {
              label: '任务名称',
              prop: 'jobName'
            },
            {
              label: '任务组',
              prop: 'jobGroup'
            },
            {
              label: '触发器类型',
              width: 80,
              html(row) {
                return ['simple', 'cron'][row.triggerType]
              }
            },
            {
              label: 'url',
              prop: 'url'
            },
            {
              label: '时间表达式',
              width: 80,
              prop: 'cron'
            },
            {
              label: '执行次数',
              width: 76,
              prop: 'runTimes'
            },
            {
              label: '间隔时间(s)',
              width: 90,
              prop: 'intervalSecond'
            },
            {
              label: '任务状态',
              width: 76,
              html(row) {
                if (row.jobStatus == null) {
                  return '未启动'
                }
                return ['已暂停', '已启用'][row.jobStatus]
              }
            },
            {
              label: '程序集',
              prop: 'assemblyName'
            },
            {
              label: 'IJob实现类',
              width: 90,
              prop: 'className'
            },
            {
              label: '开始时间',
              width: 82,
              prop: 'beginTime'
            },
            {
              label: '结束时间',
              width: 82,
              prop: 'endTime'
            },
            {
              label: '任务描述',
              prop: 'remark'
            }
          ]
        },
        form: {
          labelWidth: '100px',
          size: 'mini',
          key: 'id',
          rules: {
            name: [
              { required: true, message: '请输入名称' }
            ]
          },
          els: [
            {
              eType: 'el-input',
              label: '任务名称',
              prop: 'jobName',
              attrs: {
                placeholder: '请输入任务名称'
              }
            },
            {
              eType: 'el-input',
              label: '任务组',
              prop: 'jobGroup',
              attrs: {
                placeholder: '请输入任务组'
              }
            },
            {
              eType: 'el-select',
              label: '触发器类型',
              prop: 'triggerType',
              attrs: {
                placeholder: '请输入触发器类型'
              },
              optionsData: {
                list: [
                  {
                    label: 'simple',
                    value: 0
                  },
                  {
                    label: 'cron',
                    value: 1
                  }
                ]
              }
            },
            {
              eType: 'el-input',
              label: 'url',
              prop: 'url',
              attrs: {
                placeholder: '请输入url'
              }
            },
            {
              eType: 'el-input',
              label: '任务所在类',
              prop: 'className',
              attrs: {
                placeholder: '请输入任务所在类'
              }
            },
            {
              eType: 'el-input',
              label: '任务所在DLL对应的程序集名称',
              prop: 'assemblyName',
              attrs: {
                placeholder: '请输入任务所在DLL对应的程序集名称'
              }
            },
            {
              eType: 'el-input',
              label: '时间表达式',
              prop: 'cron',
              attrs: {
                placeholder: '请输入时间表达式'
              }
            },
            {
              eType: 'el-input',
              label: '执行次数',
              prop: 'runTimes',
              attrs: {
                placeholder: '请输入执行次数'
              }
            },
            {
              eType: 'el-input',
              label: '执行间隔(s)',
              prop: 'intervalSecond',
              attrs: {
                placeholder: '请输入执行间隔(s)'
              }
            }
          ]
        }
      }
    }
  },
  methods: {
    firstExecute(row) {
      this.update('是否确定开始执行?', '/api/Schedule/ExecuteScheduleJob', {
        id: row.id
      })
    },
    reExecute(row) {
      this.update('是否确定恢复执行?', '/api/Schedule/ResumeScheduleJob', {
        id: row.id
      })
    },
    stopExecute(row) {
      this.update('是否确定停止执行?', '/api/Schedule/StopScheduleJob', {
        id: row.id
      })
    },
    async update(content, api, data) {
      const isConfirm = await this.$confirm(content, '提示', {
        type: 'info'
      })
      if (!isConfirm) {
        return
      }
      await this.$axios.post(api, data)
      this.$message.success('操作成功!')
      this.$refs.page.refreshTableData()
    }
  }
}
</script>
