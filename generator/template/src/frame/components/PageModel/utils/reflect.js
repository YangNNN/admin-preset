export default class ReflectRelation {
  constructor() {
    this.reclectRelations = {}
  }
  collectRelations(config) {
    const self = this
    function collect(data, keys) {
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
              if (reclectRelations[val]) {
                reclectRelations[val].push(keys)
              } else {
                reclectRelations[val] = [keys]
              }
            }
          }
        }
      }
    }
    function collectArray(array, keys) {
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
  getRelations(key) {
    return this.reclectRelations[key]
  }

  destroy() {
    this.reclectRelations = null
  }
}
