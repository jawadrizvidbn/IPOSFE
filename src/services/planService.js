import axiosInstance from './axiosConfig'

const BASE_URL = '/plan'

const createPlan = async plan => axiosInstance.post(`${BASE_URL}`, plan)

const getAllPlans = async () => axiosInstance.get(`${BASE_URL}`)

const getPlanById = async id => axiosInstance.get(`${BASE_URL}/${id}`)

const updatePlan = async (id, plan) => axiosInstance.put(`${BASE_URL}/${id}`, plan)

const deletePlan = async id => axiosInstance.delete(`${BASE_URL}/${id}`)

export default {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan
}
