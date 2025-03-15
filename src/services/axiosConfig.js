import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    throw new Error(error?.response?.data?.message || error.message)
  }
)

export default axiosInstance
