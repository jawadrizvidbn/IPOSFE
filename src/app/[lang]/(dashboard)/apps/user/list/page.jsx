'use client'

// Next Imports
import { useEffect } from 'react'
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import { getAllUsers } from '@/redux/reducers/authSlice'
import { thunkStatus } from '@/utils/statusHandler'

// Component imports
import AllUsers from '@/views/store/Allusers'

const UserList = () => {
  const dispatch = useDispatch()
  const { list: users, getAllUsersStatus, deleteUserStatus } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(getAllUsers())
  }, [dispatch])

  const isLoading = getAllUsersStatus === thunkStatus.LOADING

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5' gutterBottom>
          User Management
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <AllUsers users={users} />
        )}
      </Grid>
    </Grid>
  )
}

export default UserList
