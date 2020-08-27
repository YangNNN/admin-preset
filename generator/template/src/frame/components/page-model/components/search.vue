<template>
  <div v-if="pagemodel.hasSearch" class="model-search">
    <div v-show="pagemodel.isSearchExpand">
      <el-form
        class="search-form model-form"
        :model="searchForm"
        :label-width="configSearchForm.labelWidth"
        :size="searchForm.size || useConfig.size"
      >
        <el-row>
          <el-col
            v-for="(item, index) in showSearchEls"
            v-show="wrapFc(item.isShow, contextInThisComponent, searchForm, 'call', true)"
            :key="index"
            v-bind="item.col || { lg: 8 }"
          >
            <el-form-item
              :label="item.label ? `${item.label}:` : ''"
              :label-width="item.labelWidth || ''"
              :class="[!item.cover ? 'postInfo-container-item' : '']"
            >
              <form-template
                v-model="searchForm[item.prop]"
                :options="item"
                :context="contextInThisComponent"
                :change="wrapFc(item.change, contextInThisComponent, searchForm, 'bind')"
                :disabled="wrapFc(item.isDisabled, contextInThisComponent, searchForm)"
                :render-fn="wrapFc(item.renderFn, contextInThisComponent, searchForm, 'bind')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 展开 && 收起 -->
        <el-form-item v-if="hasInnerExpand">
          <span class="searchbar-expand" @click="toggleInnerExpand">{{ isInnerSearchExpand ? '收起' : '展开' }}</span>
        </el-form-item>
        <div class="searchbar-btns">
          <el-button :size="searchForm.size || useConfig.size" type="primary" @click="onSearch">筛选</el-button>
          <el-button :size="searchForm.size || useConfig.size" @click="onReset">重置</el-button>
          <el-button v-if="useConfig.exportUrl" :size="searchForm.size || useConfig.size" @click="onExport">导出报表</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { jsonClone, getType, combineReqData } from '@/utils'
import { wrapFc } from '../utils'
import provideMixin from '../utils/provide-mixin'

export default {
  mixins: [provideMixin],
  props: {
    staticData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      contextInThisComponent: this, // 实例
      searchModel: {}, // 搜索初始模型
      searchForm: {}, // 搜索表单当前数据
      isInnerSearchExpand: false // 表单内部是否展开
    }
  },
  computed: {
    configSearchForm() {
      return this.useConfig.searchForm
    },
    showSearchEls() {
      return this.hasInnerExpand && !this.isInnerSearchExpand
        ? this.configSearchForm.els.slice(0, this.configSearchForm.showEls)
        : this.configSearchForm.els
    },
    hasInnerExpand() {
      return this.configSearchForm.showEls < this.configSearchForm.els.length
    }
  },
  methods: {
    wrapFc,
    init() {
      const configSearchForm = this.configSearchForm
      if (configSearchForm?.init?.data) {
        this.resetModel(configSearchForm.init.data)
      }
    },
    resetModel(model) {
      this.searchModel = jsonClone(model)
      this.searchForm = jsonClone(this.searchModel)
    },
    onExport() {
      this.$emit('export')
    },
    onSearch() {
      this.$emit('search')
    },
    onReset() {
      this.searchForm = jsonClone(this.searchModel)
      this.onSearch()
      this.$parent.$refs.ptable?.$refs['el-table'].clearSort()
    },
    combineReqData() {
      const data = combineReqData(this.searchForm)
      const configSearchForm = this.configSearchForm
      if (getType(configSearchForm?.beforeSubmit) === 'function') {
        return configSearchForm.beforeSubmit.call(this, data)
      } else {
        return data
      }
    },
    toggleInnerExpand() {
      this.isInnerSearchExpand = !this.isInnerSearchExpand
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';
.model-search {
  .search-form {
    background-color: #F7F7F7;
    padding: 20px;
    box-sizing: border-box;
    margin-top: 10px;
  }
  .searchbar-btns {
    text-align: right;
  }
  .postInfo-container-item {
    float: left;
  }
  .searchbar-expand {
    color: $buttonText;
    cursor: pointer;
  }
}
</style>
