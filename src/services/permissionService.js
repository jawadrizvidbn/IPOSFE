import axiosConfig from './axiosConfig'

const BASE_URL = '/permission'

const createPermission = async permission => axiosConfig.post(`${BASE_URL}`, permission)

const getAllPermissions = async () => axiosConfig.get(`${BASE_URL}`)

const getPermissionById = async id => axiosConfig.get(`${BASE_URL}/${id}`)

const updatePermission = async (id, permission) => axiosConfig.put(`${BASE_URL}/${id}`, permission)

const deletePermission = async id => axiosConfig.delete(`${BASE_URL}/${id}`)

export default {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
}
