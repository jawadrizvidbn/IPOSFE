import axiosInstance from './axiosConfig'

const BASE_URL = '/auth'

const login = async ({ email, password }) => axiosInstance.post(`${BASE_URL}/login`, { email, password })

export default {
  login
}
