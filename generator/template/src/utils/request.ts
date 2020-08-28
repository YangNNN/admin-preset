import config from '@/config'
import store from '@/store'
import { setAuthToken } from '@/utils/auth'
import axios from 'axios'

const service = axios.create({
  baseURL: config.baseUrl // url = base url + request url
})

// request interceptor
service.interceptors.request.use(
  (config: { headers: { [x: string]: string } }) => {
    // do something before request is sent
    if (store.getters.token) {
      config.headers['Authorization'] = setAuthToken(store.getters.token)
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  (response: any) => {
    return response
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

export default service
