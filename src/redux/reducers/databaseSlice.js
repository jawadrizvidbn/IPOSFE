import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import databaseService from '../../services/databaseService'
import { thunkStatus } from '@/utils/statusHandler'
import { toast } from 'react-toastify'
const name = 'database'

const initialState = {
  connectedServerStores: [],
  connectNewServerStatus: thunkStatus.IDLE,
  getAllShopStatus: thunkStatus.IDLE,
  allAcrossShops: []
}

export const connectNewServer = createAsyncThunk(`${name}/connectNewServer`, async (data, { dispatch }) => {
  const response = await databaseService.connectNewServer(data)
  dispatch(setConnectedServerStores(response.data))
  toast.success('Server connected successfully, you can now select the stores')
  return response.data
})

export const getAllShop = createAsyncThunk(`${name}/getAllShop`, async (data, { dispatch }) => {
  const response = await databaseService.getAllShop(data)
  dispatch(setAllShopData(Object.keys(response.data)))
})

const databaseSlice = createSlice({
  name,
  initialState,
  reducers: {
    setConnectedServerStores: (state, action) => {
      state.connectedServerStores = action.payload
    },
    unsetConnectedServerStores: state => {
      state.connectedServerStores = []
    },
    resetConnectNewServerStatus: state => {
      state.connectNewServerStatus = thunkStatus.IDLE
    },
    setAllShopData: (state, action) => {
      state.allAcrossShops = action.payload
    }
  }
})

export const { setConnectedServerStores, unsetConnectedServerStores, resetConnectNewServerStatus, setAllShopData } =
  databaseSlice.actions

export default databaseSlice.reducer
