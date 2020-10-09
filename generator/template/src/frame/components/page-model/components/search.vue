<template>
  <div v-if="searchManager.hasSearch" class="model-search">
    <div v-show="headManager.isSearchExpand">
      <el-form
        class="search-form model-form"
        :model="searchManager.searchForm"
        :label-width="searchManager.labelWidth"
        :size="searchManager.size"
      >
        <el-row>
          <el-col
            v-for="(item, index) in searchManager.showSearchEls"
            v-show="wrapFc(item.isShow, contextInThisComponent, searchManager.searchForm, 'call', true)"
            :key="index"
            v-bind="item.col"
          >
            <el-form-item
              :label="item.label ? `${item.label}:` : ''"
              :label-width="item.labelWidth || ''"
              :class="[!item.cover ? 'postInfo-container-item' : '']"
            >
              <form-item-template
                v-model="searchManager.searchForm[item.prop]"
                :options="item"
                :context="contextInThisComponent"
                :change="wrapFc(item.change, contextInThisComponent, searchManager.searchForm, 'bind')"
                :disabled="wrapFc(item.isDisabled, contextInThisComponent, searchManager.searchForm)"
                :render-fn="wrapFc(item.renderFn, contextInThisComponent, searchManager.searchForm, 'bind')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 展开 && 收起 -->
        <el-form-item v-if="searchManager.hasInnerExpand">
          <span class="searchbar-expand" @click="toggleInnerExpand">{{ searchManager.isInnerSearchExpand ? '收起' : '展开' }}</span>
        </el-form-item>
        <div class="searchbar-btns">
          <el-button :size="searchManager.size" type="primary" @click="onSearch">筛选</el-button>
          <el-button :size="searchManager.size" @click="onReset">重置</el-button>
          <el-button v-if="searchManager.exportUrl" :size="searchManager.size" @click="onExport">导出报表</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
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
      contextInThisComponent: this // 实例
    }
  },
  created() {
    this.searchManager.setValue('context', this)
  },
  computed: {
    headManager() {
      return this.manager.headManager
    },
    searchManager() {
      return this.manager.searchManager
    }
  },
  created() {
    this.searchManager.setValue('context', this)
  },
  methods: {
    wrapFc,
    onExport() {
      this.$emit('export')
    },
    onSearch() {
      this.$emit('search')
    },
    onReset() {
      this.searchManager.initFormData()
      this.onSearch()
      this.$parent.$refs.ptable?.$refs['el-table'].clearSort()
    },
    toggleInnerExpand() {
      this.searchManager.setValue('isInnerSearchExpand', !this.searchManager.isInnerSearchExpand )
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
