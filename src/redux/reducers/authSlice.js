import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { signIn } from 'next-auth/react'

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

const authSlice = createSlice({
  name,
  initialState: {
    user: null,
    error: null,
    loading: false
  },
  reducers: {
    logout: state => {
      state.user = null
      state.error = null
      state.loading = false
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

export const { logout } = authSlice.actions

export default authSlice.reducer
