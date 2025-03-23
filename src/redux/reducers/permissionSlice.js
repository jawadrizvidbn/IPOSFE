import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import permissionService from '../../services/permissionService'
import { thunkStatus } from '../../utils/statusHandler'
import { toast } from 'react-toastify'

const name = 'permission'

export const createPermission = createAsyncThunk(`${name}/createPermission`, async (permission, { dispatch }) => {
  await permissionService.createPermission(permission)
  dispatch(getAllPermissions())
  toast.success('Permission created successfully')
})

export const getAllPermissions = createAsyncThunk(`${name}/getAllPermissions`, async (_, { dispatch }) => {
  const response = await permissionService.getAllPermissions()
  dispatch(setList(response.data))
  return response.data
})

export const getPermissionById = createAsyncThunk(`${name}/getPermissionById`, async (id, { dispatch }) => {
  const response = await permissionService.getPermissionById(id)
  dispatch(setCurrentPermission(response.data))
  return response.data
})

export const updatePermission = createAsyncThunk(`${name}/updatePermission`, async (payload, { dispatch }) => {
  const { id, permission } = payload
  await permissionService.updatePermission(id, permission)
  dispatch(getAllPermissions())
  toast.success('Permission updated successfully')
})

export const deletePermission = createAsyncThunk(`${name}/deletePermission`, async (id, { dispatch }) => {
  await permissionService.deletePermission(id)
  dispatch(getAllPermissions())
  toast.success('Permission deleted successfully')
})

const permissionSlice = createSlice({
  name,
  initialState: {
    list: [],
    currentPermission: null,
    createPermissionStatus: thunkStatus.IDLE,
    getAllPermissionsStatus: thunkStatus.IDLE,
    getPermissionByIdStatus: thunkStatus.IDLE,
    updatePermissionStatus: thunkStatus.IDLE,
    deletePermissionStatus: thunkStatus.IDLE
  },
  reducers: {
    setList: (state, action) => {
      state.list = action.payload
    },
    setCurrentPermission: (state, action) => {
      state.currentPermission = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // createPermission
      .addCase(createPermission.pending, (state) => {
        state.createPermissionStatus = thunkStatus.LOADING
      })
      .addCase(createPermission.fulfilled, (state) => {
        state.createPermissionStatus = thunkStatus.IDLE
      })
      .addCase(createPermission.rejected, (state) => {
        state.createPermissionStatus = thunkStatus.FAILED
        toast.error('Failed to create permission')
      })
      
      // getAllPermissions
      .addCase(getAllPermissions.pending, (state) => {
        state.getAllPermissionsStatus = thunkStatus.LOADING
      })
      .addCase(getAllPermissions.fulfilled, (state) => {
        state.getAllPermissionsStatus = thunkStatus.IDLE
      })
      .addCase(getAllPermissions.rejected, (state) => {
        state.getAllPermissionsStatus = thunkStatus.FAILED
        toast.error('Failed to fetch permissions')
      })
      
      // getPermissionById
      .addCase(getPermissionById.pending, (state) => {
        state.getPermissionByIdStatus = thunkStatus.LOADING
      })
      .addCase(getPermissionById.fulfilled, (state) => {
        state.getPermissionByIdStatus = thunkStatus.IDLE
      })
      .addCase(getPermissionById.rejected, (state) => {
        state.getPermissionByIdStatus = thunkStatus.FAILED
        toast.error('Failed to fetch permission details')
      })
      
      // updatePermission
      .addCase(updatePermission.pending, (state) => {
        state.updatePermissionStatus = thunkStatus.LOADING
      })
      .addCase(updatePermission.fulfilled, (state) => {
        state.updatePermissionStatus = thunkStatus.IDLE
      })
      .addCase(updatePermission.rejected, (state) => {
        state.updatePermissionStatus = thunkStatus.FAILED
        toast.error('Failed to update permission')
      })
      
      // deletePermission
      .addCase(deletePermission.pending, (state) => {
        state.deletePermissionStatus = thunkStatus.LOADING
      })
      .addCase(deletePermission.fulfilled, (state) => {
        state.deletePermissionStatus = thunkStatus.IDLE
      })
      .addCase(deletePermission.rejected, (state) => {
        state.deletePermissionStatus = thunkStatus.FAILED
        toast.error('Failed to delete permission')
      })
  }
})

export const { setList, setCurrentPermission } = permissionSlice.actions

export default permissionSlice.reducer
