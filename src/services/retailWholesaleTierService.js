import axiosInstance from './axiosConfig'

export async function getRetailWholesaleTierReport(params, signal) {
  const response = await axiosInstance.get('/database/retail-wholesale-tier-report', { params, signal })

  return response.data
}
