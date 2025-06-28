import dashboardService from '@/services/dashboardService'
import databaseService from '@/services/databaseService'
import { thunkStatus } from '@/utils/statusHandler'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { REPORT_TYPE_VALUES } from '../../helpers/acrossReportConst'
import { format } from 'date-fns'

const name = 'acrossReports'
const initialState = {
  reportType: '',
  reportData: [],
  sortableKeys: [],
  storeFields: [],
  grandTotal: 0,
  getAcrossReportStatus: thunkStatus.IDLE
}

export const getAcrossReport = createAsyncThunk('acrossReports/getAcrossReport', async ({ params }, { dispatch }) => {
  let response
  let startDate = ''
  let endDate = ''
  switch (params.reportType) {
    case REPORT_TYPE_VALUES.quantitySold:
      response = await databaseService.accrossShopReport(params)
      dispatch(setReportData(response.data.finalResults || []))
      dispatch(setSortableKeys(response.data.sortableKeys || []))
      dispatch(setGrandTotal(response.data.grandTotalQty || 0))
      break
    case REPORT_TYPE_VALUES.turnover:
      startDate = format(params.startDate, 'yyyy-MM-dd')
      endDate = format(params.endDate, 'yyyy-MM-dd')

      response = await dashboardService.getTopStores(
        { ...params, startDate, endDate },
        { shopKeys: params.shopKeys?.split?.(','), isAll: true }
      )
      dispatch(setReportData(response.data?.data?.byTurnover || []))
      dispatch(setSortableKeys(response.data?.data?.sortableKeys || []))
      dispatch(setStoreFields(response.data?.data?.storeFields || []))
      dispatch(setGrandTotal(null))
      break
    case REPORT_TYPE_VALUES.products:
      startDate = format(params.startDate, 'yyyy-MM-dd')
      endDate = format(params.endDate, 'yyyy-MM-dd')

      response = await databaseService.acrossShopProducts({ ...params, startDate, endDate })
      dispatch(setReportData(response.data?.data || []))
      dispatch(setSortableKeys(response.data?.sortableKeys || []))
      dispatch(setGrandTotal(null))
      break
    case REPORT_TYPE_VALUES.retailWholesale:
      response = await databaseService.acrossShopRetailWholesale(params)
      dispatch(setReportData(response.data?.data || []))
      dispatch(setSortableKeys(response.data?.sortableKeys || []))
      dispatch(setGrandTotal(null))
      break
    case REPORT_TYPE_VALUES.stockOnHand:
      response = await databaseService.acrossShopStockOnHand(params)
      dispatch(setReportData(response.data?.data || []))
      dispatch(setSortableKeys(response.data?.sortableKeys || []))
      dispatch(setGrandTotal(null))
      break
    case REPORT_TYPE_VALUES.dailySales:
      startDate = format(params.startDate, 'yyyy-MM-dd')
      endDate = format(params.endDate, 'yyyy-MM-dd')
      response = await databaseService.acrossDailySales({ ...params, startDate, endDate })
      dispatch(setReportData(response.data?.data || []))
      dispatch(setSortableKeys(response.data?.sortableKeys || []))
      dispatch(setGrandTotal(null))
      break
    default:
      break
  }
})

export const acrossReportsSlice = createSlice({
  name,
  initialState,
  reducers: {
    setReportType: (state, action) => {
      state.reportType = action.payload
    },
    clearReportType: state => {
      state.reportType = ''
    },
    setReportData: (state, action) => {
      state.reportData = action.payload
    },
    setSortableKeys: (state, action) => {
      state.sortableKeys = action.payload
    },
    setGrandTotal: (state, action) => {
      state.grandTotal = action.payload
    },
    setStoreFields: (state, action) => {
      state.storeFields = action.payload
    },
    cleanReportData: (state, action) => {
      state.reportData = []
      state.grandTotal = 0
      state.sortableKeys = []
      state.storeFields = []
    }
  }
})
export const {
  setReportType,
  clearReportType,
  setReportData,
  setSortableKeys,
  setGrandTotal,
  setStoreFields,
  cleanReportData
} = acrossReportsSlice.actions
export default acrossReportsSlice.reducer
