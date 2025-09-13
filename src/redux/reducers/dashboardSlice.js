import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import dashboardService from '../../services/dashboardService'
import { thunkStatus } from '@/utils/statusHandler'

const name = 'dashboard'

const initialState = {
  currentStore: '',
  salesOverview: [],
  revenueReport: [],
  topTurnoverStores: [],
  topTransactionsStores: [],
  getSalesOverviewStatus: thunkStatus.IDLE,
  getRevenueReport: thunkStatus.IDLE,
  getTopStoresStatus: thunkStatus.IDLE
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

export const getTopStores = createAsyncThunk(
  `${name}/getTopStores`,
  async ({ year = new Date().getFullYear() }, { dispatch, getState }) => {
    const shopKeys = getState()?.auth?.user?.allowedStores || []
    if (!Array.isArray(shopKeys)) return
    const res = await dashboardService.getTopStores({ year }, { shopKeys })
    dispatch(setTopTurnoverStores(res.data?.data?.byTurnover || []))
    dispatch(setTopTransactionsStores(res.data?.data?.byTransactions || []))
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
    },
    setTopTurnoverStores: (state, action) => {
      state.topTurnoverStores = action.payload
    },
    setTopTransactionsStores: (state, action) => {
      state.topTransactionsStores = action.payload
    }
  }
})

export const { setCurrentStore, setSalesOverview, setRevenueReport, setTopTurnoverStores, setTopTransactionsStores } =
  dashboardSlice.actions

export default dashboardSlice.reducer
