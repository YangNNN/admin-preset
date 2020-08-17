/**
 * Created by PanJiaChen on 16/11/18.
 */

export const dateFormat = function(date, formatStr = 'yyyy-MM-dd', netTimeStamp = false) {
  if (!date || date === '') return '-/-/-'
  if (typeof date === 'string') {
    // 去除时区时差影响
    date = date.replace('T', ' ').replace(/-/g, '/')
    date = new Date(date)
  } else if (typeof date === 'number') {
    if (netTimeStamp) {
      // 如果是 .net 时间戳, 单位为秒
      date = new Date(date * 1000)
    } else {
      // 不是则自动判断
      // 如果 * 1000 后超过 2100/12/31 则自动判断为毫秒时间戳
      // 否则则自动判断为秒时间戳
      if (date * 1000 > 4133865600000) {
        date = new Date(date)
      } else {
        date = new Date(date * 1000)
      }
    }
  } else {
    date = new Date(date)
  }
  var week = {
    '0': '\u65e5',
    '1': '\u4e00',
    '2': '\u4e8c',
    '3': '\u4e09',
    '4': '\u56db',
    '5': '\u4e94',
    '6': '\u516d'
  }
  var map = {
    'M': date.getMonth() + 1, // 月份
    'd': date.getDate(), // 日
    'h': date.getHours(), // 小时
    'm': date.getMinutes(), // 分
    's': date.getSeconds(), // 秒
    'q': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
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

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function timeToString(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return timeToString(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
export function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length
  for (var i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xDC00 && code <= 0xDFFF) i--
  }
  return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')
        .replace(/\+/g, ' ') +
      '"}'
  )
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
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
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

/**
 * json 拷贝
 */
export function jsonClone(o) {
  return JSON.parse(JSON.stringify(o))
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

/**
 *
 * @param {data} 处理数据
 * @param {superKey}
 * @param {subKey}
 * 每条数据都应持有 superKey subKey
 */

export function tree(data, superKey, subKey, sortKey, sortMode = 1) {
  const tree = []
  const leaves = []
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
  function sortData(data, sortKey, sortMode) {
    if (!data || getType(data) !== 'array' || data.length === 0) {
      return false
    }
    if (!sortKey) {
      return data
    }
    data.sort((a, b) => {
      if (sortMode > 0) {
        return b[sortKey] - a[sortKey]
      } else {
        return a[sortKey] - b[sortKey]
      }
    })
  }
  function appendleave(data) {
    data.forEach(branch => {
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

export function findDataFromTree(data, key, value) {
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

export function groupBy(data, o, sortKey, isAsc) {
  var ret = []; var i; var l
  if (typeof o === 'function') {
    ret[0] = []
    ret[1] = []
    for (i = 0, l = data.length; i < l; i++) {
      if (o(data[i], i)) {
        ret[0].push(data[i])
      } else {
        ret[1].push(data[i])
      }
    }
  } else {
    var keys = []
    for (i = 0, l = data.length; i < l; i++) {
      if (!data[i]) continue
      var keyValue = data[i][o]
      var keyIndex = keys.indexOf(keyValue)
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
 * @param {any} 返回参数小写类型字符串
 */
export const getType = function(val) {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase()
}
/**
 *
 * @param {any} 是否已定义
 */
export const isDef = function(val) {
  return val !== undefined
}

/**
 * 动态加载script
 * @param {string | Array} src 加载src字符串或者数组
 * @param {string} loadKey 暴露在window上的属性
 * @param {function} callback 加载完回调
 * @param {number} trytimes 尝试次数
 */

export const dynamicLoadScript = (src, loadKey, callback, trytimes) => {
  let trytime = 1
  const srcs = getType(src) === 'array' ? src : [src]
  trytimes = Math.max.apply(null, [srcs.length, trytimes])
  const existingScript = document.getElementById(src)
  const cb = callback || function() {}

  load()

  function load() {
    let src = srcs[trytime - 1] || srcs[0]
    src = src.indexOf('?') > 0 ? `${src}&trytime=${trytime}` : `${src}?trytime=${trytime}`
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = src // src url for the third-party library being loaded.
      script.id = src
      document.body.appendChild(script)
      const onEnd = 'onload' in script ? stdOnEnd : ieOnEnd
      onEnd(script)
    }
    if (existingScript && cb) {
      if (window[loadKey]) {
        cb(null, existingScript)
      }
    }
  }

  function stdOnEnd(script) {
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

  function ieOnEnd(script) {
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
export const createCDNSources = (libname, version) => {
  return [
    `https://cdn.jsdelivr.net/npm/${libname}@${version}/${libname}.min.js`, // jsdelivr
    `https://cdn.jsdelivr.net/npm/${libname}@${version}/dist/${libname}.min.js`, // jsdelivr
    `https://cdnjs.cloudflare.com/ajax/libs/${libname}/${version}/${libname}.min.js`, // cloudflare
    `https://cdn.bootcdn.net/ajax/libs/${libname}/${version}/${libname}.min.js`, // bootcdn
    `/js/${libname}.${version}.min.js`, // 本地带版本
    `/js/${libname}.min.js` // 本地
  ]
}

export const guid = function() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}


export const combineReqData = function(formData) {
  const data = {}
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