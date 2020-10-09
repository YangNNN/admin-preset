/**
 * @file 工具库文件
 * @author yangshangman
 */

/**
 * 
 * @param date 日期
 * @param formatStr 日期字符串模板
 */
export const dateFormat = function(date: any, formatStr = 'yyyy-MM-dd') {
  if (!date || date === '') return '-/-/-'
  let innerDate: Date
  if (typeof date === 'string') {
    // 去除时区时差影响
    date = date.replace('T', ' ').replace(/-/g, '/')
    innerDate = new Date(date)
  } else if (typeof date === 'number') {
    if (date * 1000 > 4133865600000) {
      innerDate = new Date(date)
    } else {
      innerDate = new Date(date * 1000)
    }
  } else {
    innerDate = new Date(date)
  }
  var week: { [x: string]: string } = {
    '0': '\u65e5',
    '1': '\u4e00',
    '2': '\u4e8c',
    '3': '\u4e09',
    '4': '\u56db',
    '5': '\u4e94',
    '6': '\u516d'
  }
  var map: { [x: string]: any } = {
    'M': innerDate.getMonth() + 1, // 月份
    'd': innerDate.getDate(), // 日
    'h': innerDate.getHours(), // 小时
    'm': innerDate.getMinutes(), // 分
    's': innerDate.getSeconds(), // 秒
    'q': Math.floor((innerDate.getMonth() + 3) / 3), // 季度
    'S': innerDate.getMilliseconds() // 毫秒
  }
  formatStr = formatStr.replace(/([yMdhmsEqS])+/g, function(all, t) {
    var v = map[t]
    if (v !== undefined) {
      if (all.length > 1) {
        v = '0' + v
        v = v.substr(v.length - 2)
      }
      return v
    } else if (t === 'y') {
      return (date.getFullYear() + '').substr(4 - all.length)
    } else if (t === 'E') {
      var w = week[date.getDay()]
      if (all.length === 1) {
        return w
      } else if (all.length === 2) {
        return '\u5468' + w
      } else {
        return '\u661f\u671f' + w
      }
    }
    return all
  })
  return formatStr
}

export function debounce(func: Function, interval: number) {
  let canIExcute = true
  return function(...arg: any) {
    if (canIExcute) {
      canIExcute = false
      setTimeout(() => {
        func && func(...arg)
        canIExcute = true
      }, interval)
    }
  }
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele: { className: any }, cls: string) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele: { className: string }, cls: string) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele: { className: string }, cls: string) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

export function deepClone(source: any) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments')
  }
  const targetObj: any = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

export function objectMerge(target: any, source: any) {
  if (typeof target !== 'object' || target == null) {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach(property => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object' && sourceProperty != null) {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

/**
 * json 拷贝
 */
export function jsonClone(o: any) {
  return JSON.parse(JSON.stringify(o))
}


/**
 * 处理数据成树
 * @param { object } data 处理的数据 
 * @param { string } superKey id
 * @param { string } subKey pid
 * @param { string } sortKey 排序字段
 * @param { number } sortMode  排序模式
 */
export function tree(data: any, superKey: string, subKey: string, sortKey: any, sortMode = 1) {
  const tree = []
  const leaves: any[] = []
  for (const v of data) {
    if (!v[subKey]) {
      tree.push(v)
    } else {
      const branch = tree.find(branch => branch[superKey] === v[subKey])
      if (branch) {
        branch.children = branch.children || []
        branch.children.push(v)
      } else {
        leaves.push(v)
      }
    }
  }
  function sortData(data: any[], sortKey: string, sortMode: number) {
    if (!data || getType(data) !== 'array' || data.length === 0 || !sortKey) {
      return false
    }
    data.sort((a: { [x: string]: any }, b: { [x: string]: any }) => {
      if (sortMode > 0) {
        return b[sortKey] - a[sortKey]
      } else {
        return a[sortKey] - b[sortKey]
      }
    })
  }
  function appendleave(data: any[]) {
    data.forEach((branch: { [x: string]: any; children: any }) => {
      const children = leaves.filter(leave => leave[subKey] === branch[superKey])
      if (children && children.length > 0) {
        branch.children = (branch.children || []).concat(children)
      }
      sortData(branch.children, sortKey, sortMode)
      if (branch.children) {
        appendleave(branch.children)
      }
    })
  }
  appendleave(tree)
  sortData(tree, sortKey, sortMode)
  return tree
}

export function findDataFromTree(data: string | any[], key: string | number, value: any): any[] {
  let ret = []
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (item[key] === value) {
      ret.push(item)
      break
    } else {
      if (item.children) {
        const result = findDataFromTree(item.children, key, value)
        if (result.length) {
          ret.push(item)
          ret = ret.concat(result)
          break
        }
      }
    }
  }
  return ret
}

export function groupBy(data: any[], o: string | Function, sortKey: string, isAsc: boolean) {
  let ret: any[] = []
  if (typeof o === 'function') {
    ret[0] = []
    ret[1] = []
    for (let i = 0, l = data.length; i < l; i++) {
      const item = data[i]
      let pushTarget = o(data[i], i) ? ret[0] : ret[1]
      pushTarget.push(item)
    }
  } else {
    let keys = []
    for (let i = 0, l = data.length; i < l; i++) {
      if (!data[i]) continue
      const keyValue = data[i][o]
      const keyIndex = keys.indexOf(keyValue)
      if (~keyIndex) {
        ret[keyIndex].push(data[i])
      } else {
        ret.push([data[i]])
        keys.push(keyValue)
      }
    }
    if (sortKey) {
      ret = ret.sort(function(a, b) {
        if (isAsc) {
          return (a[0][sortKey] || 0) - (b[0][sortKey] || 0)
        } else {
          return (b[0][sortKey] || 0) - (a[0][sortKey] || 0)
        }
      })
    }
  }
  return ret
}
/**
 * @param {any} val 返回参数小写类型字符串
 */
export const getType = function(val: any) {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase()
}

/**
 * 是否函数
 * @param {any} value 
 */
export const isFunction = (value: any) => {
  return getType(value) === 'function'
}

/**
 *
 * @param {any} 是否已定义
 */
export const isDef = function(val: undefined) {
  return val !== undefined
}

/**
 * 动态加载script
 * @param {string | Array} src 加载src字符串或者数组
 * @param {string} loadKey 暴露在window上的属性
 * @param {function} callback 加载完回调
 * @param {number} trytimes 尝试次数
 */

export const dynamicLoadScript = (src: string, loadKey: string | number, callback: Function, trytimes: number) => {
  let trytime = 1
  const srcs = getType(src) === 'array' ? src : [src]
  trytimes = Math.max.apply(null, [srcs.length, trytimes])
  const existingScript:any = document.getElementById(src)
  const cb = callback || function() {}

  load()

  function load() {
    let src = srcs[trytime - 1] || srcs[0]
    src = src.indexOf('?') > 0 ? `${src}&trytime=${trytime}` : `${src}?trytime=${trytime}`
    if (!existingScript) {
      const script: any = document.createElement('script')
      script.src = src // src url for the third-party library being loaded.
      script.id = src
      document.body.appendChild(script)
      const onEnd = 'onload' in script ? stdOnEnd : ieOnEnd
      onEnd(script)
    }
    if (existingScript && cb) {
      let global: any = window
      if (global[loadKey]) {
        cb(null, existingScript)
      }
    }
  }

  function stdOnEnd(script: any) {
    script.onload = function() {
      // this.onload = null here is necessary
      // because even IE9 works not like others
      this.onerror = this.onload = null
      cb(null, script)
    }
    script.onerror = function() {
      this.onerror = this.onload = null
      document.body.removeChild(script)
      if (++trytime > trytimes) {
        cb(new Error('Failed to load ' + src), script)
      } else {
        load()
      }
    }
  }

  function ieOnEnd(script: any) {
    script.onreadystatechange = function() {
      if (this.readyState !== 'complete' && this.readyState !== 'loaded') return
      this.onreadystatechange = null
      cb(null, script)
    }
  }
}

/**
 * 根据库名和版本号创建链接
 * @param {string} libname 库名
 * @param {string} version 版本号
 */
export const createCDNSources = (libname: any, version: any) => {
  return [
    `https://cdn.jsdelivr.net/npm/${libname}@${version}/${libname}.min.js`, // jsdelivr
    `https://cdn.jsdelivr.net/npm/${libname}@${version}/dist/${libname}.min.js`, // jsdelivr
    `https://cdnjs.cloudflare.com/ajax/libs/${libname}/${version}/${libname}.min.js`, // cloudflare
    `https://cdn.bootcdn.net/ajax/libs/${libname}/${version}/${libname}.min.js`, // bootcdn
    `/js/${libname}.${version}.min.js`, // 本地带版本
    `/js/${libname}.min.js` // 本地
  ]
}

/**
 * 生成唯一id
 */
export const guid = function() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

/**
 * 将内部请求数据处理，日期 => 字符串; 字符串 => trim
 * @param formData 
 */
export const combineReqData = function(formData: { [x: string]: any }) {
  const data:{ [x: string]: any } = {}
  for (const key in formData) {
    const keys = key.split(',')
    const values = keys.length > 1 ? formData[key] : [formData[key]]
    keys.forEach((k, index) => {
      const value = values[index]
      const type = getType(value)
      switch (type) {
        case 'date':
          data[k] = dateFormat(value, 'yyyy-MM-dd hh:mm:ss')
          break
        case 'string':
          data[k] = value.trim()
          break
        default:
          data[k] = value
          break
      }
    })
  }
  return data
}

/**
 * 比较两个列表数据的不同，返回新增、更新和删除的数据
 * @param { Array } oldlist 旧列表数据
 * @param { Array } newlist 新的列表数据
 * @param { String } compareKey 比较的key、id
 * @returns { Object } 返回数据结构{ adds: [], dels: [], updates: [], isModify: true | false }
 */
export const compareList = function(oldlist: any[], newlist: any[], compareKey: string)
 : { adds: any[], dels: any[], updates: any[], isModify: boolean}
 {
  let adds = newlist.slice(), dels = [], updates = []
  const compareEqual = (obj1: any, obj2: any) => {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false
    }
    for (const k in obj1) {
      if (obj1[k] !== obj2[k]) {
        return false
      }
    }
    return true
  }
  for (let i = 0; i < oldlist.length; i++) {
    const olditem = oldlist[i]
    let isExsit = false
    for (let j = 0; j < newlist.length ; j ++) {
      const newitem = newlist[j]
      if (olditem[compareKey] === newitem[compareKey]) {
        // 比较是否更新
        isExsit = true
        if (!compareEqual(olditem, newitem)) {
          updates.push(newitem)
        }
        const index = adds.findIndex(a => a[compareKey] === newitem[compareKey])
        adds.splice(index, 1)
      }
    }
    if (!isExsit) {
      dels.push(olditem)
    }
  }
  return {
    adds,
    dels,
    updates,
    isModify: !!(adds.length || dels.length || updates.length)
  }
}

/**
 * 转化枚举对象成数组
 * @param enumData 枚举对象
 * @param mode 0 | 1 // 0返回字符串数组 1返回select下拉数组
 * @returns { Array }
 */
export const convertEnumToArray = function(enumData: any, mode: 0 | 1 = 0) {
  let ret: { [index: number]: string } = []
  Object.keys(enumData).forEach((key: any) => {
    if (isNaN(key * 1)) return
    ret[key] = mode === 0 ? enumData[key] : {
      value: key * 1,
      label: enumData[key]
    }
  })
  return ret
}