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

          // 使用文件读取Api
          const reader = new FileReader()

          // 设置监听函数
          reader.onload = (e) => {
            // buffer转化成本地blob地址
            const buffer = e.target.result
            const blob = new Blob([buffer])
            const blobUrl = URL.createObjectURL(blob)
            
            // 设置临时读取路径
            file.tempFileSrc = blobUrl

            // 如果是图片添加ratio和背景色
            if (filetype === 'image') {
              const img = new Image()
              img.src = blobUrl
              img.onload = () => {
                // ratio获取，设置图片宽高比
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

          // 读取文件
          reader.readAsArrayBuffer(file)
        })
      })
    )
    res(files)
  })
}
