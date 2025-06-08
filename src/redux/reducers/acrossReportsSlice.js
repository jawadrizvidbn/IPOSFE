import { REPORT_TYPE_VALUES } from '@/helpers/acrossReportHelpers'
import dashboardService from '@/services/dashboardService'
import databaseService from '@/services/databaseService'
import { thunkStatus } from '@/utils/statusHandler'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const name = 'acrossReports'
const initialState = {
  reportType: '',
  reportData: [],
  grandTotal: 0,
  getAcrossReportStatus: thunkStatus.IDLE
}

export const getAcrossReport = createAsyncThunk('acrossReports/getAcrossReport', async ({ params }, { dispatch }) => {
  let response
  switch (params.reportType) {
    case REPORT_TYPE_VALUES.stock:
      response = await databaseService.accrossShopReport(params)
      dispatch(setReportData(response.data.finalResults || []))
      dispatch(setGrandTotal(response.data.grandTotalQty || 0))
      break
    case REPORT_TYPE_VALUES.turnover:
      response = await dashboardService.getTopStores(params, { shopKeys: params.shopKeys?.split?.(',') })
      dispatch(setReportData(response.data?.data?.byTurnover || []))
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
    setGrandTotal: (state, action) => {
      state.grandTotal = action.payload
    }
  }
})
export const { setReportType, clearReportType, setReportData, setGrandTotal } = acrossReportsSlice.actions
export default acrossReportsSlice.reducer
