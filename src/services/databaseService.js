import axiosInstance from './axiosConfig'

const BASE_URL = '/database'

const connectNewServer = async data => axiosInstance.post(`${BASE_URL}/connect-new-server`, data)

export default {
  connectNewServer
}
