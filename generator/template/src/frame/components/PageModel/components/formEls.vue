<template>
  <el-row>
    <el-col
      v-for="(item, index) in els"
      v-show="wrapFc(item.isShow, context, formData, 'call', true)"
      :key="index"
      v-bind="item.col"
    >
      <el-form-item
        :label="item.label ? `${item.label}：`: ''"
        :label-width="item.labelWidth"
        :prop="item.prop"
        :rules="item.rules"
        :class="[!item.cover ? 'postInfo-container-item' : '']"
      >
        <template v-if="item.prefix">
          <div class="item-fix prefix" v-html="wrapFc(item.prefix, context, formData)" />
        </template>
        <formTemplate
          v-model="formData[item.prop]"
          :options="item"
          :context="context"
          :change="wrapFc(item.change, context, formData, 'bind')"
          :disabled="wrapFc(item.isDisabled, context, formData)"
          :render-fn="wrapFc(item.renderFn, context, formData, 'bind')"
        />
        <template v-if="item.suffix">
          <div class="item-fix suffix" v-html="wrapFc(item.suffix, context, formData)" />
        </template>
        <template v-if="item.helpText">
          <div class="item-help-text" v-html="wrapFc(item.helpText, context, formData)" />
        </template>
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script>
import { wrapFc } from '../utils'
export default {
  props: {
    els: {
      type: Array,
      default: () => ([])
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    staticData: {
      type: Object,
      default: () => ({})
    }
  },
  inject: {
    context: {}
  },
  methods: {
    wrapFc
  }
}
</script>
