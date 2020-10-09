import { jsonClone } from '@/utils';
/**
 * @file 表单管理
 * @author yangshangman
 */
import { configInterface, FormInstance, FormItemInterface, PageManagerInterface } from '../interface';
import ManagerAccepter from '../manager-accepter';

export default class Form extends ManagerAccepter implements FormInstance {

  context: any // 表单组件实例

  hasForm: boolean = false // 是否存在表单
  formEls?: FormItemInterface[] = [] // 表单成员
  isUseTabs: boolean = false // 内部表单是否使用tabs形式展示
  configForm: configInterface['form'] // 表单配置
  size?: string // 表单尺寸
  style?: object // 表单style
  labelWidth?: string // 表单label宽度
  rules?: any[] // 表单校验规则
  labelPosition?: string // label位置

  initdata: { [prop: string]: any } = {} // init数据
  formData: { [prop: string]: any } = {} // 用户填写的formData数据
  isAdd: boolean = true // 是否处于新增状态
  isDialog: boolean = false // 是否使用弹窗表单
  dialog?: { [prop: string]: any } // 弹窗

  tabsProperty: { events: { [prop: string]: any }, props: { [prop: string]: any } } = { events: {}, props: {} } // tab栏属性
  activeName: string = '0' // 激活的tab name
  
  isSubmiting: boolean = false // 是否正在提交表单

  constructor(pagemodel: PageManagerInterface) {
    super(pagemodel)
    this.init()
  }

  /**
   * 页面初始化的处理逻辑
   */
  init() {
    this.setConfigForm()
    this.initStatus()
    this.initFormData()
    this.initTabs()
  }

  /**
   * 页面挂载后的处理逻辑
   */
  initPage() {
  }

  /**
   * 更新配置的处理逻辑
   */
  updateConfig() {
    this.setConfigForm()
    this.initStatus()
    this.initTabs()
  }

  setConfigForm() {
    const { useConfig } = this.pagemodel
    this.hasForm = useConfig.hasForm || false
    if (!this.hasForm) return
    this.configForm = useConfig.form
  }
  
  /**
   * 初始化表单简单状态
   */
  initStatus() {
    const { useConfig } = this.pagemodel
    const configForm = this.configForm

    // 表单页面是否使用tab
    const formEls = this.formEls = configForm?.els
    this.isUseTabs = !!(formEls && formEls[0] && formEls[0].els)

    // 是否使用dialog
    this.isDialog = !!configForm?.dialog
    this.dialog = configForm?.dialog

    // 表单size
    this.size = configForm?.size || useConfig.size

    // 表单style
    this.style = configForm?.style

    // 表单labelwidth
    this.labelWidth = configForm?.labelWidth || (configForm && configForm['label-width'])

    // 表单rules
    let rules = null
    if (configForm?.rules) {
      rules = configForm?.rules
    } else if (configForm?.required) {
      rules = configForm?.required.reduce((data: { [prop: string]: any }, key: string) => {
        const el = formEls?.find(el => el.prop === key)
        data[key] = {
          required: true,
          message: el ? ( (el.eType?.startsWith('el-input') ? '请输入' : '请选择') + (el.label || '') ) : '请输入' 
        }
        return data
      }, {})
    }

    this.rules = rules

    // 表单labelPosition
    this.labelPosition = configForm?.labelPosition

  }

  /**
   * 初始化表单formData相关数据
   */
  initFormData() {
    const configForm = this.configForm

    // 表单初始化数据
    this.initdata = configForm?.init?.data || {}
    
    // 首次渲染，初始化表单
    !this.isInit && (this.formData = {})

  }

  /**
   * 初始化表单tab栏的事件和属性
   * events && props
   */
  initTabs() {
    const configForm = this.configForm
    if (!configForm?.tab) return
    
    let tabsProperty = this.tabsProperty

    // tab events 点击事件等
    const events = configForm?.tab?.events
    if (events) {
      for (const k in events) {
        tabsProperty.events[k] = events[k].bind(this.context)
      }
    }
    // tab props 属性
    const props = configForm?.tab?.props
    if (props) {
      tabsProperty.props = props
    }

  }

  // 重置表单值
  resetFormData() {
    this.isAdd = true
    this.formData = this.bindDataProcess(this.initdata)
    this.afterSetFormData()
  }

  // 设置表单值
  async setFormData(value: any) {
    this.isAdd = false
    
    // 如果有详情接口需要调用
    const { useConfig, context } = this.pagemodel
    if (useConfig.detailUrl && useConfig.detailKey) {
      value = await context.$axios[useConfig.detailMethod](useConfig.detailUrl, {
        [useConfig.detailKey]: value[useConfig.detailKey]
      }, {
        processDeep: true
      })
    }
    this.formData = this.bindDataProcess(jsonClone(value))
    this.afterSetFormData()
  }

  afterSetFormData() {
    this.context.$nextTick(() => {
      this.context.$refs.commonForm.clearValidate()
    })
  }

  // 绑定数据处理
  bindDataProcess(data: any) {
    data = { ...data }
    const bindData = this.configForm?.bindData
    bindData && (data = bindData.call(this.context, data))
    return data
  }

  // 提交数据处理
  submitDataProcess(data: any) {
    data = { ...data }
    const beforeSubmit = this.configForm?.beforeSubmit
    beforeSubmit && (data = beforeSubmit.call(this.context, data))
    return data
  }

  /**
   * 提交表单
   */
  async submit() {
    // 数据处理
    const data = this.submitDataProcess({ ...this.formData })
    if (!data) return false

    // 开始提交数据
    this.isSubmiting = true
    const { useConfig } = this.pagemodel
    const context = this.context
    try {
      let method: string = ''
      let url: string = ''
      if (this.isAdd) {
        method = useConfig.addMethod || ''
        url = useConfig.addUrl || ''
      } else {
        method = useConfig.updMethod || ''
        url = useConfig.updUrl || ''
      }
      await context.$axios[method](url, data)
      context.$message.success('操作成功!')
      context.$emit('success')
    } catch (error) {
      // 报错
      console.log('submit form error:::', error)
    }
    this.isSubmiting = false
  }

}