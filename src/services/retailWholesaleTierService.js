import axiosInstance from './axiosConfig'

// Fetch tier results through the existing authenticated Axios client.
export async function getRetailWholesaleTierReport(params, signal) {
  const response = await axiosInstance.get('/database/retail-wholesale-tier-report', { params, signal })

  return response.data
}
