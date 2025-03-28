import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userService from '../../services/userService'
import { signIn } from 'next-auth/react'
import { thunkStatus } from '@/utils/statusHandler'
import { toast } from 'react-toastify'

const name = 'auth'

export const loginUser = createAsyncThunk(`${name}/loginUser`, async (data, { rejectWithValue }) => {
  try {
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,

      redirect: false
    })

    if (res.ok && !res.error) {
      return data
    }

    return rejectWithValue(res.error)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const createUser = createAsyncThunk(`${name}/createUser`, async (user, { dispatch }) => {
  await userService.createUser(user)
  dispatch(getAllUsers())
})

export const getAllUsers = createAsyncThunk(`${name}/getAllUsers`, async (_, { dispatch }) => {
  try {
    const res = await userService.getAllUsers()
    dispatch(setList(res.data))
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateUser = createAsyncThunk(`${name}/updateUser`, async (payload, { dispatch }) => {
  const { id, user } = payload
  await userService.updateUser(id, user)
  dispatch(getAllUsers())
  toast.success('User updated successfully')
})

export const deleteUser = createAsyncThunk(`${name}/deleteUser`, async (id, { dispatch }) => {
  await userService.deleteUser(id)
  dispatch(getAllUsers())
  toast.success('User deleted successfully')
})

export const getUserById = createAsyncThunk(`${name}/getUserById`, async (id, { dispatch }) => {
  const response = await userService.getUserById(id)
  return response.data
})

const authSlice = createSlice({
  name,
  initialState: {
    user: null,
    list: [],
    error: null,
    loading: false,
    createUserStatus: thunkStatus.IDLE,
    getAllUsersStatus: thunkStatus.IDLE,
    updateUserStatus: thunkStatus.IDLE,
    deleteUserStatus: thunkStatus.IDLE,
    getUserByIdStatus: thunkStatus.IDLE
  },
  reducers: {
    logout: state => {
      state.list = []
      state.user = null
      state.error = null
      state.loading = false
    },
    setList: (state, action) => {
      state.list = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        console.log('Login failed, error:', state.error)
      })
  }
})

export const { logout, setList } = authSlice.actions

export default authSlice.reducer
