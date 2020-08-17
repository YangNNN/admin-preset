const axios = window.axios
import store from '@/store'
import { setAuthToken } from '@/utils/auth'
import config from '@/config'

const service = axios.create({
  baseURL: config.baseUrl // url = base url + request url
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      config.headers['Authorization'] = setAuthToken(store.getters.token)
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

export default service
