import { getColor } from '../color-thief'

const SPERATE = '_'

function setFilename(name, keys, suffix) {
  name += '-' + Math.random().toString().slice(2, 10) + SPERATE
  for (const k in keys) {
    name += k + '=' + keys[k] + SPERATE
  }
  return suffix ? `${name}.${suffix}` : name
}

export const getFileInfoFromUrl = (url) => {
  const info = {}
  url.split(SPERATE).forEach(value => {
    const keyvalue = value.split('=')
    if (keyvalue.length === 2) {
      info[keyvalue[0]] = keyvalue[1]
    }
  })
  return info
}

export const setFilesName = (files) => {
  files = Array.from(files)
  return new Promise(async res => {
    await Promise.all(
      files.map((file) => {
        return new Promise(resolve => {
          const [filetype, _suffix] = file.type.split('/')
          // 设置文件名称
          let suffix = _suffix
          try {
            suffix = file.name.split('.').slice(-1)[0]?.split('?')[0]
          } catch (error) {
            //
          }
          const keys = {
            t: filetype
          }
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = (e) => {
            const base64Src = e.target.result
            file.base64Src = base64Src
            // 如果是图片添加ratio和背景色
            if (filetype === 'image') {
              const img = new Image()
              img.src = base64Src
              img.onload = () => {
                // ratio获取
                keys.r = (img.width / img.height).toFixed(2)
                // 背景色获取
                keys.c = getColor(img)
                file.newname = setFilename(Date.now(), keys, suffix)
                resolve(file)
              }
            } else {
              file.newname = setFilename(Date.now(), keys, suffix)
              resolve(file)
            }
          }
        })
      })
    )
    res(files)
  })
}
