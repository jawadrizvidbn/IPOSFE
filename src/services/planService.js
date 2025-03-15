import axiosInstance from './axiosConfig'

const BASE_URL = '/plan'

const createPlan = async plan => axiosInstance.post(`${BASE_URL}`, plan)

export default {
  createPlan
}
