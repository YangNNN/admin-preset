
interface propKeys extends Array<any> {
  [x: string]: any
  [index: number]: string | number
}

interface reclectRelations {
  [key :string]: Array<propKeys>
}

export default class ReflectRelation {
  reclectRelations: reclectRelations | null
  constructor() {
    this.reclectRelations = {}
  }
  collectRelations(config: any) {
    const self = this
    this.reclectRelations = {}
    function collect(data: any, keys: propKeys) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const val = data[key]
          const type = Object.prototype.toString.call(val).slice(8, -1).toLowerCase()
          if (type === 'object') {
            collect(val, keys.concat(key))
          } else if (type === 'array') {
            collectArray(val, keys.concat(key))
          } else {
            if (key === '_reflect') {
              const reclectRelations = self.reclectRelations
              keys.reflectChangeKey = data._reflectChangeKey || 'list'
              if (reclectRelations && reclectRelations[val]) {
                reclectRelations[val].push(keys)
              } else {
                reclectRelations && (reclectRelations[val] = [keys])
              }
            }
          }
        }
      }
    }
    function collectArray(array: Array<any>, keys: propKeys) {
      for (let i = 0; i < array.length; i++) {
        const val = array[i]
        const type = Object.prototype.toString.call(val).slice(8, -1).toLowerCase()
        if (type === 'object') {
          collect(val, keys.concat(i))
        }
      }
    }
    collect(config, [])
  }
  getRelations(key: string) {
    return this.reclectRelations && this.reclectRelations[key]
  }

  destroy() {
    this.reclectRelations = null
  }
}
