import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import planService from '../../services/planService'
import { thunkStatus } from '@/utils/statusHandler'
import { toast } from 'react-toastify'
const name = 'plan'

export const createPlan = createAsyncThunk(`${name}/createPlan`, async (plan, { dispatch }) => {
  await planService.createPlan(plan)
  toast.success('Plan added successfully')
})

const planSlice = createSlice({
  name,
  initialState: {
    list: [],
    currentPlan: null,
    createPlanStatus: thunkStatus.IDLE
  },
  reducers: {
    setList: (state, action) => {
      state.list = action.payload
    },
    setCurrentPlan: (state, action) => {
      state.currentPlan = action.payload
    }
  }
})

export default planSlice.reducer
