import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import dashboardService from '../../services/dashboardService'
import { thunkStatus } from '@/utils/statusHandler'

const name = 'dashboard'

const initialState = {
  currentStore: '',
  salesOverview: [],
  revenueReport: [],
  getSalesOverviewStatus: thunkStatus.IDLE,
  getRevenueReport: thunkStatus.IDLE
}

export const getSalesOverview = createAsyncThunk(
  `${name}/getSalesOverview`,
  async ({ shopKey, duration = null }, { dispatch }) => {
    const res = await dashboardService.getSalesOverview({ shopKey, duration })
    dispatch(setSalesOverview(res.data))
  }
)

export const getRevenueReport = createAsyncThunk(
  `${name}/getRevenueReport`,
  async ({ shopKey, duration = null }, { dispatch }) => {
    const res = await dashboardService.getRevenueReport({ shopKey })
    dispatch(setRevenueReport(res.data))
  }
)

const dashboardSlice = createSlice({
  name,
  initialState,
  reducers: {
    setCurrentStore: (state, action) => {
      state.currentStore = action.payload
    },
    setSalesOverview: (state, action) => {
      state.salesOverview = action.payload
    },
    setRevenueReport: (state, action) => {
      state.revenueReport = action.payload
    }
  }
})

export const { setCurrentStore, setSalesOverview, setRevenueReport } = dashboardSlice.actions

export default dashboardSlice.reducer
