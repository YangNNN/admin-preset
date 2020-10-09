/**
 * @file edu 工具
 * @author yangshangman
 */


 /**
  * 快捷处理获取下拉菜单
  */

import $axios from '@/utils/ajax'

export const getSelectData = (api, params) => {
  return $axios.get('/api/EducationManage/' + api, {
    queryAll: 1,
      ...params
  }, {
    processDeep: true
  })
}

/**
 * methods
 */
const methods = {
  onSchoolChange(unitId) {
    this.selectId.unitId = unitId
  },
  async getSchools() {
    this.reflections.schools = await getSelectData('GetUnitDropList')
    const firstUnitId = this.reflections.schools[0]?.unitId
    this.selectId.unitId = this.config.searchForm.init.data.unitId = firstUnitId
  },
  async getGrades() {
    this.reflections.grades = await getSelectData('Grade', {
      pageIndex: 1,
      pageSize: 100,
      unitId: 20
    })
  },
  async getClasses() {
    this.reflections.classes = await getSelectData('Class', {
      pageIndex: 1,
      pageSize: 100,
      unitId: 20
    })
  }
}

const mixins = [
  // 只有学校
  {
    data() {
      return {
        init: false,
        selectId: {
          unitId: null
        },
        reflections: {
          schools: []
        }
      }
    },
    methods: {
      async getSchools() {
        await methods.getSchools.apply(this, arguments)
        this.init = true
        this.$nextTick(() => {
          this.$refs.page.init()
        })
      },
      onSchoolChange: methods.onSchoolChange
    }
  },
  {
    data() {
      return {
        init: false,
        selectId: {
          unitId: null
        },
        reflections: {
          schools: [],
          grades: []
        }
      }
    },
    methods: {
      getSchools: methods.getSchools,
      getGrades: methods.getGrades
    }
  },
  {
    data() {
      return {
        init: false,
        selectId: {
          unitId: null
        },
        reflections: {
          schools: [],
          grades: [],
          classes: []
        }
      }
    },
    methods: {
      async getSchools() {
        await methods.getSchools.apply(this, arguments)
        this.init = true
        this.$nextTick(() => {
          this.$refs.page.init()
        })
      },
      getGrades: methods.getGrades,
      getClasses: methods.getClasses
    }
  }
]

/**
 * 获取下拉的页面的混入代码
 */
export const getSelectMixinWrapper = (level) => {
  return mixins[level]
}