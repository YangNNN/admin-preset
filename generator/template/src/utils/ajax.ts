/**
 * @file 基础请求封装，请求请从这里走
 * @author yangshangman
 */

import { removeToken } from '@/utils/auth';
import request from '@/utils/request';
import { Loading, Message } from 'element-ui';
import Qs from 'Qs';
import rules, { Rules } from './add-params';

/**
 * @description 请求options声明
 */
export interface options {
  url: string,
  method: string, // default
  config?: {
    loading?: Boolean, // 是否loading
    process?: Boolean, // 是否处理数据
    processDeep?: Boolean, // 二次获取数据，data.data
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

/**
 * @description 遇到错误怎么办!!!
 */
const ERRORS: any = {
  '401': removeToken
}

/**
 * @description 默认loading配置
 */
const LOADING_DEFAULT_OPTIONS = {
  lock: true,
  text: '加载中',
  spinner: 'el-icon-loading',
  background: 'rgba(255, 255, 255, 0.7)'
}

/**
 * 请求之前添加参数
 * @param { Array } rules 添加参数的规则列表
 */
function addParams(rules: Rules) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // 没有规则
    if (!rules || rules.length === 0) return
    const originValue = descriptor.value
    descriptor.value = function(options: options) {
      rules.forEach(rule => {
        options = rule.excute(options)
      })
      return originValue.call(this, options)
    }
  }
}

class Ajax {
  /**
   * @description 对请求地址进行拼接 
   * @example appendRoute('/api/test/:id', { id: 1 }) ===> { url: '/api/test/1', appendKeys: ['id'] }
   * @param url 
   * @param routeData 
   */
  appendRoute(url: string, routeData: any) {
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

  @addParams(rules)
  sendRequest(options : options) {
    options.method = options.method.toUpperCase();
    // 合并路由数据
    const config = options.config || {}
    const routeData = Object.assign({}, options.data, options.params, config.routeData);
  
    // 拼接路由链接
    if (Object.keys(routeData).length) {
      const { url, appendKeys } = this.appendRoute(options.url, routeData)
      options.url = url
      // 清除被路由添加过的数据
      appendKeys.length && appendKeys.forEach(key => {
        if (options.data && options.data.hasOwnProperty(key)) {
          delete options.data[key]
        }
        if (options.params && options.params.hasOwnProperty(key)) {
          delete options.params[key]
        }
      })
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
          loadingInstance = Loading.service(typeof config.loading === 'object' ? config.loading : LOADING_DEFAULT_OPTIONS)
        }
        const response = await request(options)
        const responseData = response.data
        if (!responseData.error_code) {
          if (config.process !== false) {
            resolve(config.processDeep === true ? responseData.data : responseData)
          } else {
            resolve(response)
          }
        } else {
          if (ERRORS[responseData.error_code]) {
            ERRORS[responseData.error_code]()
          }
          const message = responseData.error_msg || `请稍后重试!${responseData.error_code}`
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

}

const ajax = new Ajax()

const METHODS = ['get', 'post', 'delete', 'put'];

export const $axios: any = function(options: options) {
  return ajax.sendRequest(options)
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
    return ajax.sendRequest(options)
  }
})

export default $axios
