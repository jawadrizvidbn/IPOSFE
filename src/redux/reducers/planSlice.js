import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import planService from '../../services/planService'
import { thunkStatus } from '@/utils/statusHandler'
import { toast } from 'react-toastify'
const name = 'plan'

export const createPlan = createAsyncThunk(`${name}/createPlan`, async (plan, { dispatch }) => {
  await planService.createPlan(plan)
  dispatch(getAllPlans())
  toast.success('Plan added successfully')
})

export const getAllPlans = createAsyncThunk(`${name}/getAllPlans`, async (_, { dispatch }) => {
  const response = await planService.getAllPlans()
  dispatch(setList(response.data))
})

export const getPlanById = createAsyncThunk(`${name}/getPlanById`, async (id, { dispatch }) => {
  const response = await planService.getPlanById(id)
  dispatch(setCurrentPlan(response.data))
})

export const updatePlan = createAsyncThunk(`${name}/updatePlan`, async (payload, { dispatch }) => {
  const { id, plan } = payload
  await planService.updatePlan(id, plan)
  dispatch(getAllPlans())
  toast.success('Plan updated successfully')
})

export const deletePlan = createAsyncThunk(`${name}/deletePlan`, async (id, { dispatch }) => {
  await planService.deletePlan(id)
  dispatch(getAllPlans())
  toast.success('Plan deleted successfully')
})

const planSlice = createSlice({
  name,
  initialState: {
    list: [],
    currentPlan: null,
    createPlanStatus: thunkStatus.IDLE,
    updatePlanStatus: thunkStatus.IDLE,
    deletePlanStatus: thunkStatus.IDLE,
    getAllPlansStatus: thunkStatus.IDLE,
    getPlanByIdStatus: thunkStatus.IDLE
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

export const { setList, setCurrentPlan } = planSlice.actions

export default planSlice.reducer
