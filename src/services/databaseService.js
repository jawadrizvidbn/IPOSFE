import axiosInstance from './axiosConfig'

const BASE_URL = '/database'

const connectNewServer = async data => axiosInstance.post(`${BASE_URL}/connect-new-server`, data)

const getAllShop = async () => axiosInstance.get(`${BASE_URL}/getallshop`)

export default {
  connectNewServer,
  getAllShop
}
