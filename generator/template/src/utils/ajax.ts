
interface options {
  url: string,
  method: string, // default
  config?: {
    loading?: Boolean, // 是否loading
    process?: Boolean, // 是否处理数据
    error?: Boolean, // 错误是否报错提示
    routeData?: any
  },
  baseURL?: string,
  transformRequest?: Function,
  headers?: object,
  params?: any,
  paramsSerializer?: Function,
  data?: any,
  timeout?: Number, // default is `0` (no timeout)
  withCredentials?: Boolean, // default
  adapter?: Function,
  auth?: object,
  responseType?: string, // default json
  responseEncoding?: string, // default utf8
  xsrfCookieName?: string, // default XSRF-TOKEN
  xsrfHeaderName?: string, // default X-XSRF-TOKEN
  onUploadProgress?: Function,
  onDownloadProgress?: Function,
  maxContentLength?: Number,
  maxBodyLength?: Number,
  validateStatus?: Function,
  maxRedirects?: Number, // default 5
  socketPath?: string, // default
  httpAgent?: any,
  httpsAgent?: any,
  proxy?: {
    host: string,
    port: Number,
    auth: {
      username: string,
      password: string
    }
  },

  // `cancelToken` specifies a cancel token that can be used to cancel the request
  // (see Cancellation section below for details)
  cancelToken?: Function,
  decompress?: Boolean // default true
}

import { removeToken } from '@/utils/auth';
import request from '@/utils/request';
import { Loading, Message } from 'element-ui';
import Qs from 'Qs';

const ERRORS: any = {
  '401': removeToken
}

const LOADING_DEFAULT_OPTIONS = {
  lock: true,
  text: '加载中',
  spinner: 'el-icon-loading',
  background: 'rgba(255, 255, 255, 0.7)'
}

function appendRoute(url: string, routeData: any) {
  const appendKeys = []
  for (const k in routeData) {
    if (routeData.hasOwnProperty(k) && new RegExp(`/:${k}(/|$)`).test(url)) {
      appendKeys.push(k)
      url = url.replace(`:${k}`, routeData[k])
    }
  }
  return {
    url,
    appendKeys
  }
}

const METHODS = ['get', 'post', 'delete', 'put'];

export const $axios: any = function(options: options) {
  return beforeRequest(options)
}

function beforeRequest(options : options) {
  options.method = options.method.toUpperCase();

  // 合并路由数据
  const config = options.config || {}
  const routeData = Object.assign({}, options.data, options.params, config.routeData);

  // 拼接路由链接
  if (Object.keys(routeData).length) {
    const { url, appendKeys } = appendRoute(options.url, routeData)
    options.url = url
    // 清除路由添加数据
    if (appendKeys.length) {
      appendKeys.forEach(key => {
        if (options.data && options.data.hasOwnProperty(key)) {
          delete options.data[key]
        }
        if (options.params && options.params.hasOwnProperty(key)) {
          delete options.params[key]
        }
      })
    }
  }

  // 设置params序列化
  options.paramsSerializer = options.paramsSerializer || function(params: options["params"]) {
    return Qs.stringify(params, {arrayFormat: 'brackets'})
  }

  return new Promise(async (resolve, reject) => {
    let loadingInstance = null
    try {
      // loading
      if (config.loading) {
        loadingInstance = Loading(typeof config.loading === 'object' ? config.loading : LOADING_DEFAULT_OPTIONS)
      }

      const response = await request(options)
      if (!response.error_code) {
        if (config.process !== false) {
          resolve(response.data)
        } else {
          resolve(response)
        }
      } else {
        if (ERRORS[response.error_code]) {
          ERRORS[response.error_code]()
        }
        const message = response.message || `请稍后重试!${response.error_code}`
        reject(message)
        if (config.error !== false) {
          Message({
            message,
            type: 'error'
          })
        }
      }
    } catch (error) {
      // response code !== 200
      const message = error.message
      if (config.error !== false) {
        Message({
          message,
          type: 'error'
        })
      }
      reject(message)
    } finally {
      loadingInstance && loadingInstance.close()
    }
  });

}

// 添加方法
METHODS.forEach(m => {
  $axios[m] = function(url: string, requestData = {}, configData = { routeData: {} }) {
    const method = m.toUpperCase()
    const options: options = Object.assign(configData, {
      url,
      method,
      config: configData,
      data: method !== 'GET' ? requestData : {},
      params: method === 'GET' ? requestData : {}
    })
    return beforeRequest(options)
  }
})

export default $axios