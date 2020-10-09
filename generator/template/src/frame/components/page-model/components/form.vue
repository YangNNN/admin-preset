<template>
  <div class="form-page" :class="{ 'use-tab': manager.isUseTabs }">
    <el-form
      v-if="formManager.formData"
      ref="commonForm"
      class="page-form"
      :model="formManager.formData"
      :style="formManager.style"
      :size="formManager.size"
      :label-width="formManager.labelWidth"
      :rules="formManager.rules"
      :label-position="formManager.labelPosition"
    >

      <!-- 普通表单 -->
      <template v-if="!formManager.isUseTabs">
        <formEls 
          :els="formManager.formEls" 
          :context="formManager.context" 
          :form-data="formManager.formData" 
          :static-data="staticData" 
        />
        <el-col>
          <el-form-item>
            <el-button type="danger" @click="cancel">
              取消
            </el-button>
            <el-button :loading="formManager.isSubmiting" type="success" @click="submit">
              {{ formManager.isAdd ? '添加' : '保存' }}
            </el-button>
          </el-form-item>
        </el-col>
      </template>

      <!-- 有tabs -->
      <template v-else>
        <el-tabs
          v-model="formManager.activeName" 
          v-bind="formManager.tabsProperty.props" 
          v-on="formManager.tabsProperty.events"
        >
          <el-tab-pane
            v-for="(item, index) in formManager.formEls"
            :key="index"
            :label="item.text"
            :name="`${index.toString()}`"
          >
            <el-scrollbar :vertical="true">
              <formEls 
                :els="item.els" 
                :context="formManager.context" 
                :form-data="formData" 
                :static-data="staticData" 
              />
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
        <div class="fixed-bottom-btns flex-center">
          <el-button type="danger" @click="cancel">
            取消
          </el-button>
          <el-button :loading="formManager.isSubmiting" type="success" @click="submit">
            {{ formManager.isAdd ? '添加' : '保存' }}
          </el-button>
        </div>
      </template>

    </el-form>
  </div>
</template>

<script>
import { combineReqData } from '@/utils'
import formEls from '../components/formEls'
import provideMixin from '../utils/provide-mixin'

export default {
  name: 'PageForm',
  mixins: [provideMixin],
  components: {
    formEls
  },
  props: {
    staticData: {
      type: Object,
      default: () => {}
    }
  },
  created() {
    this.formManager.setValue('context', this)
  },
  computed: {
    formManager() {
      return this.manager.formManager
    }
  },
  methods: {
    // 取消填写 关闭表单
    cancel() {
      this.$emit('close')
    },
    // 重置表单值
    resetValue() {
      this.formManager.resetFormData()
    },
    // 设置表单值
    setValue(value) {
      this.formManager.setFormData(value)
    },
    // 提交表单
    submit() {
      this.$refs.commonForm.validate((valid) => {
        if (!valid) return
        this.formManager.submit()
      })
    }
  }
}
</script>

<style lang="scss">
$fixed_bottom: 80px;
.form-page {
  padding: 22px 25px 20px;
  &.use-tab {
    height: 100%;
    box-sizing: border-box;
    .page-form {
      position: relative;
      height: 100%;
      padding-bottom: $fixed_bottom;
      box-sizing: border-box;
    }
    .el-tabs {
      height: 100%;
    }
    .el-tabs__content {
      height: calc(100% - 40px);
    }
    .el-tab-pane {
      height: 100%;
    }
    .el-scrollbar {
      height: 100%;
      .el-scrollbar__wrap {
        overflow-x: hidden;
      }
    }
  }
  .page-form {
    font-size: 0;
  }
  .postInfo-container-item {
    float: left;
    white-space: nowrap;
  }
  .item-fix {
    display: inline-block;
    color: #666;
    &.prefix {
      margin-right: 6px;
    }
    &.suffix {
      margin-left: 6px;
    }
  }
  .item-help-text {
    color: #999;
  }

  .fixed-bottom-btns {
    position: absolute;
    bottom: -20px;
    left: -40px;
    right: 0;
    z-index: 9;
    background-color: #fff;
    height: $fixed_bottom;
    text-align: center;
    box-shadow: -4px -2px 0px 0px rgba(0, 0, 0, .05);
  }
}
.mobile {
  .form-page {
    padding: 0;
    .fixed-bottom-btns {
      bottom: 0;
      left: -15px;
    }
  }
}

</style>
