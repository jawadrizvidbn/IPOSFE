import axiosInstance from './axiosConfig'

const BASE_URL = '/dashboard'

const getSalesOverview = async params => axiosInstance.get(`${BASE_URL}/sales-overview`, { params })

const getRevenueReport = async params => axiosInstance.get(`${BASE_URL}/revenue-report`, { params })

export default {
  getSalesOverview,
  getRevenueReport
}
