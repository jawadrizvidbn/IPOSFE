import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import databaseService from '../../services/databaseService'
import { thunkStatus } from '@/utils/statusHandler'
import { toast } from 'react-toastify'
const name = 'database'

export const connectNewServer = createAsyncThunk(`${name}/connectNewServer`, async (data, { dispatch }) => {
  const response = await databaseService.connectNewServer(data)
  dispatch(setConnectedServerStores(response.data))
  toast.success('Server connected successfully, you can now select the stores')
  return response.data
})

const databaseSlice = createSlice({
  name,
  initialState: {
    connectedServerStores: [],
    connectNewServerStatus: thunkStatus.IDLE
  },
  reducers: {
    setConnectedServerStores: (state, action) => {
      state.connectedServerStores = action.payload
    },
    unsetConnectedServerStores: state => {
      state.connectedServerStores = []
    },
    resetConnectNewServerStatus: state => {
      state.connectNewServerStatus = thunkStatus.IDLE
    }
  }
})

export const { setConnectedServerStores, unsetConnectedServerStores, resetConnectNewServerStatus } = databaseSlice.actions

export default databaseSlice.reducer
