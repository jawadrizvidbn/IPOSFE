import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.request.use(
  async config => {
    const session = await getSession()
    if (session?.user?.token) {
      config.headers.Authorization = `Bearer ${session.user.token}`
    }
    return config
  },
  error => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    // Handle unauthorized access (401) or forbidden access (403)
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      // Sign out the user
      await signOut({ redirect: true, callbackUrl: '/login' })
    }
    throw new Error(error?.response?.data?.message || error.message)
  }
)

export default axiosInstance
