'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { FormControl, InputLabel, Select } from '@mui/material'

// Third-party Imports
import { toast } from 'react-toastify'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { email, object, minLength, string, number, array, optional } from 'valibot'

// Redux Imports
import {
  connectNewServer,
  unsetConnectedServerStores,
  resetConnectNewServerStatus
} from '@/redux/reducers/databaseSlice'
import { thunkStatus } from '@/utils/statusHandler'
import { getAllPlans } from '@/redux/reducers/planSlice'
import { getAllPermissions } from '@/redux/reducers/permissionSlice'
import { updateUser, getUserById } from '@/redux/reducers/authSlice'

const schema = object({
  name: string([minLength(3, 'Name must be at least 3 characters long')]),
  email: string([email('Please enter a valid email address')]),
  permissions: array(string()),
  password: optional(string()),
  plan: number([minLength(1, 'This field is required')]),
  planStartDate: string([minLength(1, 'This field is required')]),
  planEndDate: string([minLength(1, 'This field is required')]),
  serverHost: string([minLength(1, 'This field is required')]),
  serverUser: string([minLength(1, 'This field is required')]),
  serverPassword: string([minLength(1, 'This field is required')]),
  allowedStores: array(string()),
  gracePeriod: string([minLength(1, 'This field is required')])
})

const EditUser = ({ params }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Redux
  const dispatch = useDispatch()
  const connectedServerStores = useSelector(state => state.database.connectedServerStores)
  const plans = useSelector(state => state.plan.list)
  const permissions = useSelector(state => state.permission.list)

  // For debugging only
  const isConnecting = useSelector(state => state.database.connectNewServerStatus === thunkStatus.LOADING)
  const getAllPlansLoading = useSelector(state => state.plan.getAllPlansStatus === thunkStatus.LOADING)
  const updateUserLoading = useSelector(state => state.auth.updateUserStatus === thunkStatus.LOADING)

  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      permissions: [],
      password: '',
      plan: null,
      planStartDate: '',
      planEndDate: '',
      serverHost: '',
      serverUser: '',
      serverPassword: '',
      allowedStores: [],
      gracePeriod: ''
    }
  })

  useEffect(() => {
    const fetchUserAndInitialize = async () => {
      try {
        // Fetch user data using thunk
        const result = await dispatch(getUserById(params.id)).unwrap()
        const userData = result

        // Reset form with user data
        reset({
          name: userData.name,
          email: userData.email,
          // permissions: JSON.parse(userData.permissions || '[]'),
          permissions: userData.permissions || [],
          plan: userData.plan,
          planStartDate: userData.planStartDate,
          planEndDate: userData.planEndDate,
          serverHost: userData.serverHost,
          serverUser: userData.serverUser,
          serverPassword: userData.serverPassword,
          allowedStores: userData.allowedStores || [],
          gracePeriod: userData.gracePeriod ? String(userData.gracePeriod) : ''
        })

        // Connect to server automatically
        if (userData.serverHost && userData.serverUser && userData.serverPassword) {
          dispatch(
            connectNewServer({
              host: userData.serverHost,
              user: userData.serverUser,
              password: userData.serverPassword
            })
          )
        }
      } catch (error) {
        toast.error('Failed to fetch user data')
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch initial data
    dispatch(getAllPlans())
    dispatch(getAllPermissions())
    fetchUserAndInitialize()

    // Cleanup when component unmounts
    return () => {
      dispatch(unsetConnectedServerStores())
    }
  }, [dispatch, params.id, reset])

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleConnectServer = async () => {
    const { serverHost, serverUser, serverPassword } = getValues()

    if (!serverHost || !serverUser || !serverPassword) {
      toast.error('Please fill all server connection fields')
      return
    }

    dispatch(
      connectNewServer({
        host: serverHost,
        user: serverUser,
        password: serverPassword
      })
    )
  }

  const onSubmit = async data => {
    try {
      const payload = { ...data, password: data?.password || null }
      await dispatch(updateUser({ id: params.id, user: payload })).unwrap()
      toast.success('User updated successfully')
    } catch (error) {
      toast.error('Failed to update user')
      console.error('Error updating user:', error)
    }
  }

  if (isLoading) {
    return (
      <Grid container justifyContent='center' alignItems='center' style={{ minHeight: '400px' }}>
        <CircularProgress />
      </Grid>
    )
  }

  // Determine if the stores dropdown should be disabled
  const isStoresDisabled = !connectedServerStores || connectedServerStores.length === 0

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Edit User' />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Name'
                        placeholder='User Name'
                        variant='outlined'
                        error={!!errors.name}
                        helperText={errors.name ? errors.name.message : ''}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='email'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='email'
                        label='Email'
                        variant='outlined'
                        placeholder='johndoe@example.com'
                        error={!!errors.email}
                        helperText={errors.email ? errors.email.message : ''}
                        InputLabelProps={{ shrink: true }}
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Password'
                        placeholder='Leave blank to keep current password'
                        variant='outlined'
                        type={isPasswordShown ? 'text' : 'password'}
                        error={!!errors.password}
                        helperText={errors.password ? errors.password.message : ''}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                onClick={handleClickShowPassword}
                                onMouseDown={e => e.preventDefault()}
                                aria-label='toggle password visibility'
                                edge='end'
                              >
                                <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        InputLabelProps={{ shrink: true }}
                        autoComplete='new-password'
                      />
                    )}
                  />
                </Grid>

                {/* Server Connection Fields */}
                <Grid item xs={12}>
                  <CardHeader title='Server Details' sx={{ px: 0, pt: 3, pb: 0 }} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller
                    name='serverHost'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Server Host'
                        variant='outlined'
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.serverHost}
                        helperText={errors.serverHost?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name='serverUser'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Server User'
                        variant='outlined'
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.serverUser}
                        helperText={errors.serverUser?.message}
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name='serverPassword'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Server Password'
                        type='password'
                        variant='outlined'
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.serverPassword}
                        helperText={errors.serverPassword?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant='contained'
                    color='secondary'
                    onClick={handleConnectServer}
                    disabled={isConnecting}
                    startIcon={isConnecting && <CircularProgress size={20} color='inherit' />}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect to Server'}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name='allowedStores'
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel id='stores-select-label'>Stores</InputLabel>
                        <Select
                          labelId='stores-select-label'
                          fullWidth
                          multiple
                          label='Stores'
                          disabled={isStoresDisabled}
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                          error={!!errors.allowedStores}
                          helperText={errors.allowedStores?.message}
                        >
                          {connectedServerStores && connectedServerStores.length > 0 ? (
                            connectedServerStores.map(store => (
                              <MenuItem key={store} value={store}>
                                {store}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No stores available</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CardHeader title='Plan Details' sx={{ px: 0, pt: 3, pb: 0 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='plan'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel id='plan-select-label'>Plan</InputLabel>
                        <Select
                          labelId='plan-select-label'
                          fullWidth
                          label='Plan'
                          disabled={getAllPlansLoading}
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                          error={!!errors.plan}
                          helperText={errors.plan?.message}
                        >
                          {plans && plans.length > 0 ? (
                            plans.map(plan => (
                              <MenuItem key={plan?.id} value={plan?.id}>
                                {plan?.planName}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No plans available</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='planStartDate'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Plan Start Date'
                        variant='outlined'
                        type='datetime-local'
                        error={!!errors.planStartDate}
                        helperText={errors.planStartDate ? errors.planStartDate.message : ''}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='planEndDate'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Plan End Date'
                        variant='outlined'
                        type='datetime-local'
                        error={!!errors.planEndDate}
                        helperText={errors.planEndDate ? errors.planEndDate.message : ''}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='gracePeriod'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Grace Period (in days)'
                        variant='outlined'
                        type='number'
                        error={!!errors.gracePeriod}
                        helperText={errors.gracePeriod ? errors.gracePeriod.message : ''}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CardHeader title='Permission Details' sx={{ px: 0, pt: 3, pb: 0 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='permissions'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel id='permission-select-label'>Permission</InputLabel>
                        <Select
                          labelId='permission-select-label'
                          fullWidth
                          multiple
                          label='Permission'
                          disabled={getAllPlansLoading}
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                          error={!!errors.permissions}
                          helperText={errors.permissions?.message}
                        >
                          {permissions && permissions.length > 0 ? (
                            permissions.map(permission => (
                              <MenuItem key={permission?.id} value={permission?.name}>
                                {permission?.name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No permissions available</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button disabled={updateUserLoading} variant='contained' color='primary' type='submit' fullWidth>
                    {updateUserLoading ? 'Updating' : 'Update User'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default EditUser
