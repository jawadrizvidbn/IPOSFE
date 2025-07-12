import axiosInstance from './axiosConfig'

const BASE_URL = '/database'

const connectNewServer = async data => axiosInstance.post(`${BASE_URL}/connect-new-server`, data)

const getAllShop = async () => axiosInstance.get(`${BASE_URL}/getallshop`)

const accrossShopReport = async params => axiosInstance.get(`${BASE_URL}/accrossShopReport`, { params })

const acrossShopProducts = async params => axiosInstance.get(`${BASE_URL}/acrossShopProducts`, { params })

const acrossShopRetailWholesale = async params =>
  axiosInstance.get(`${BASE_URL}/acrossRetailWholesaleByProductReport`, { params })

const acrossShopStockOnHand = async params => axiosInstance.get(`${BASE_URL}/acrossStockOnHandReport`, { params })

const acrossDailySales = async params => axiosInstance.get(`${BASE_URL}/acrossDailySalesReport`, { params })

const acrossInvoiceReport = async params => axiosInstance.get(`${BASE_URL}/acrossInvoiceReport`, { params })

const acrossShopRetailWholesaleByCategory = async params =>
  axiosInstance.get(`${BASE_URL}/acrossWholesaleByCategoryReport`, { params })

export default {
  connectNewServer,
  getAllShop,
  accrossShopReport,
  acrossShopProducts,
  acrossShopRetailWholesale,
  acrossShopStockOnHand,
  acrossDailySales,
  acrossInvoiceReport,
  acrossShopRetailWholesaleByCategory
}
