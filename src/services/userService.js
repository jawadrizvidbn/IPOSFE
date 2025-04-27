import axiosInstance from './axiosConfig'

const BASE_URL = '/auth'

const login = async ({ email, password }) =>
  axiosInstance.post(`${BASE_URL}/login`, { email, password }, { withCredentials: true })

const getAllUsers = async () => axiosInstance.get(`${BASE_URL}/users`)

const getUserById = async id => axiosInstance.get(`${BASE_URL}/users/${id}`)

const createUser = async user => axiosInstance.post(`${BASE_URL}/users`, user)

const updateUser = async (id, user) => axiosInstance.put(`${BASE_URL}/users/${id}`, user)

const deleteUser = async id => axiosInstance.delete(`${BASE_URL}/users/${id}`)

export default {
  login,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}
