<template>
  <div class="container" style="height: 100%;">
    <PageModel
      ref="page"
      :config="config"
      :reflections="reflections"
      @products="onPro"
    />
  </div>
</template>

<script>
import PageModel from '@/frame/components/PageModel'
export default {
  name: 'test',
  components: {
    PageModel
  },
  data() {
    return {
      reflections: {
        list2: [
          {
            label: 'label1',
            value: 'value1'
          }
        ]
      },
      config: {
        isWatch: true,
        reflect: true,
        addButton: {
          text: '添加测试',
          icon: 'edit'
        },
        getUrl: '/api/ProductGoods/GetGoodsGroupList',
        addUrl: '/api/Config/InsertAdvertise',
        updUrl: '/api/Config/UpdateAdvertise',
        delUrl: '/api/Config/DelAdvertise',
        delKey: 'id',
        searchForm: {
          labelWidth: '100px',
          els: [
            {
              label: '标题',
              prop: 'content',
              eType: 'el-input',
              attrs: {
                placeholder: '请输入标题'
              }
            },
            {
              eType: 'el-select',
              label: '排序2',
              prop: 'sort',
              optionsData: {
                _reflect: 'list2',
                list: []
              }
            }
          ]
        },
        table: {
          simpleSpanMethod() {
            return [
              0,
              [0, 2]
            ]
          },
          operate: {
            width: 260,
            els: [
              {
                text: '修改',
                size: 'mini',
                type: 'text',
                isEdit: true,
                clear: true
              },
              {
                text: '删除',
                size: 'mini',
                type: 'text',
                isDel: true
              },
              {
                text: '评论',
                size: 'mini',
                type: 'text',
                event: 'comment'
              },
              {
                text: '产品',
                event: 'products',
                size: 'mini',
                type: 'text'
              }
            ]
          },
          els: [
            {
              width: true,
              label: '1',
              renderFn() {
                return (
                  <div>1234324</div>
                )
              }
            },
            {
              label: '排序',
              prop: 'sort',
              children: [
                {
                  label: '排序',
                  prop: 'sort'
                },
                {
                  label: '排序',
                  prop: 'sort'
                },
                {
                  label: '排序',
                  prop: 'sort'
                },
                {
                  label: '排序',
                  prop: 'sort'
                }
              ]
            },
            {
              label: '排序',
              prop: 'sort',
              children: [
                {
                  label: '排序',
                  prop: 'sort'
                },
                {
                  label: '排序',
                  prop: 'sort'
                },
                {
                  label: '排序',
                  prop: 'sort'
                },
                {
                  label: '排序',
                  prop: 'sort'
                }
              ]
            }
          ]
        },
        form: {
          labelWidth: '100px',
          size: 'mini',
          key: 'id',
          init: {
            data: {}
          },
          els: [
            {
              text: '基础设置',
              els: [
                {
                  eType: 'el-input',
                  label: '内容',
                  prop: 'content',
                  events: {
                    change(e) {
                      console.log(this.formData)
                    }
                  }
                },
                {
                  eType: 'el-input',
                  label: '排序',
                  prop: 'sort'
                },
                {
                  eType: 'ImgUpload',
                  label: '上传',
                  prop: 'adverseImg',
                  props: {
                    mode: 'video',
                    qiniu: false,
                    mult: true
                  }
                },
                {
                  eType: 'ImgUpload',
                  label: '上传',
                  prop: 'adverseImg',
                  props: {
                    mode: 'video',
                    qiniu: false,
                    mult: true
                  }
                },
                {
                  eType: 'ImgUpload',
                  label: '上传',
                  prop: 'adverseImg',
                  props: {
                    mode: 'video',
                    qiniu: false,
                    mult: true
                  }
                },
                {
                  eType: 'ImgUpload',
                  label: '上传',
                  prop: 'adverseImg',
                  props: {
                    mode: 'video',
                    qiniu: false,
                    mult: true
                  }
                },
                {
                  eType: 'ImgUpload',
                  label: '上传',
                  prop: 'adverseImg',
                  props: {
                    mode: 'video',
                    qiniu: false,
                    mult: true
                  }
                },
                {
                  eType: 'ImgUpload',
                  label: '上传',
                  prop: 'adverseImg',
                  props: {
                    mode: 'video',
                    qiniu: false,
                    mult: true
                  }
                }
              ]
            },
            {
              text: '基础设置2',
              els: [
                {
                  eType: 'el-input',
                  label: '内容2',
                  prop: 'content'
                },
                {
                  eType: 'el-input',
                  label: '内容2',
                  prop: 'content'
                },
                {
                  eType: 'el-select',
                  label: '排序2',
                  prop: 'sort',
                  optionsData: {
                    _reflect: 'list2',
                    list: []
                  }
                },
                {
                  eType: 'FileUpload',
                  label: '上传文件',
                  prop: 'adverseImg'
                }
              ]
            }
          ]
        }
      }
    }
  },
  created() {
    this.config.a = '1'
    setTimeout(() => {
      this.reflections.list2 = [
        {
          label: 'label2',
          value: 'value2'
        }
      ]
    }, 3000)
  },
  methods: {
    onPro(e, i) {
    }
  }
}
</script>
