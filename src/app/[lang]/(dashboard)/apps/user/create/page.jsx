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
import { Checkbox, FormControl, FormControlLabel, InputLabel, Select } from '@mui/material'

// Third-party Imports
import { toast } from 'react-toastify'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { email, object, minLength, string, number, array } from 'valibot'
import { useRouter } from 'next/navigation'

// Redux Imports
import {
  connectNewServer,
  unsetConnectedServerStores,
  resetConnectNewServerStatus
} from '@/redux/reducers/databaseSlice'
import { thunkStatus } from '@/utils/statusHandler'
import { getAllPlans } from '@/redux/reducers/planSlice'
import { getAllPermissions } from '@/redux/reducers/permissionSlice'
import { createUser } from '@/redux/reducers/authSlice'
import { getLocalizedUrl } from '@/utils/i18n'
import { ROLE_TYPES } from '@/utils/contants'
import { getReportTypeLabel, REPORT_TYPE_VALUES } from '@/helpers/acrossReportConst'

const schema = object({
  name: string([minLength(3, 'Name must be at least 3 characters long')]),
  email: string([email('Please enter a valid email address')]),
  permissions: array(string()),
  password: string([minLength(8, 'Password must be at least 8 characters long')]),
  plan: number([minLength(1, 'This field is required')]),
  planStartDate: string([minLength(1, 'This field is required')]),
  planEndDate: string([minLength(1, 'This field is required')]),
  serverHost: string([minLength(1, 'This field is required')]),
  serverUser: string([minLength(1, 'This field is required')]),
  serverPort: string([minLength(1, 'This field is required')]),
  serverPassword: string([minLength(1, 'This field is required')]),
  allowedStores: array(string()),
  gracePeriod: string([minLength(1, 'This field is required')]),
  referenceNumber: string([minLength(11, 'Reference must be 3 letters + 8 digits')]),
  role: string([minLength(1, 'This field is required')]),
  reportPermissions: optional(object({}))
})

const CreateUser = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isServerPasswordShown, setIsServerPasswordShown] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [reportPermissions, setReportPermissions] = useState({})
  // Redux
  const dispatch = useDispatch()
  const connectedServerStores = useSelector(state => state.database.connectedServerStores)
  const plans = useSelector(state => state.plan.list)
  const permissions = useSelector(state => state.permission.list)

  // For debugging only
  const isConnecting = useSelector(state => state.database.connectNewServerStatus === thunkStatus.LOADING)
  const getAllPlansLoading = useSelector(state => state.plan.getAllPlansStatus === thunkStatus.LOADING)
  const createUserLoading = useSelector(state => state.auth.createUserStatus === thunkStatus.LOADING)
  const router = useRouter()
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
      plan: null, // Default value
      planStartDate: '',
      planEndDate: '',
      serverHost: '',
      serverUser: '',
      serverPort: '',
      serverPassword: '',
      allowedStores: [],
      gracePeriod: 0,
      referenceNumber: '',
      role: ''
    }
  })

  const generateReferenceNumber = () => {
    const ref = getValues('referenceNumber')?.toUpperCase() || ''

    if (ref.length === 0) {
      toast.error('Please enter a 3-letter prefix before generating reference number')
      return
    }

    if (!/^[A-Z]{3}$/.test(ref)) {
      toast.error('Prefix must be exactly 3 uppercase letters')
      return
    }

    const numbers = Math.floor(10000000 + Math.random() * 90000000).toString()
    const finalRef = ref + numbers

    const currentValues = getValues()
    reset({ ...currentValues, referenceNumber: finalRef })
  }

  useEffect(() => {
    dispatch(getAllPlans())
    dispatch(getAllPermissions())

    // Cleanup when component unmounts
    return () => {
      dispatch(unsetConnectedServerStores())
    }
  }, [])

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleClickShowServerPassword = () => setIsServerPasswordShown(show => !show)

  const handleConnectServer = async () => {
    const { serverHost, serverUser, serverPassword, serverPort } = getValues()

    if (!serverHost || !serverUser || !serverPassword || !serverPort) {
      toast.error('Please fill all server connection fields')
      return
    }

    dispatch(
      connectNewServer({
        host: serverHost,
        user: serverUser,
        port: serverPort,
        password: serverPassword
      })
    )
  }

  const onSubmit = async data => {
    try {
      console.log('Inside try block, data:', data)

      dispatch(createUser({ ...data, reportPermissions: reportPermissions }))
      // Reset form after successful submission
      reset()
      router.replace(getLocalizedUrl('apps/user/list'))
      // Display success message
      toast.success('User added successfully')
    } catch (error) {
      // Display error message
      toast.error('Failed to add user')
      console.error('Error adding user:', error)
    }
  }

  // Determine if the stores dropdown should be disabled
  const isStoresDisabled = !connectedServerStores || connectedServerStores.length === 0

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Add User' />
          <CardContent>
            <form
              onSubmit={e => {
                console.log('Form submit event triggered')
                console.log('Form validation errors:', errors)
                console.log('Current form values:', getValues())
                handleSubmit(
                  data => {
                    console.log('Form validated successfully, calling onSubmit with data:', data)
                    onSubmit(data)
                  },
                  errors => {
                    console.log('Form validation failed with errors:', errors)
                  }
                )(e)
              }}
              // onSubmit={handleSubmit(onSubmit)}
            >
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
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Password'
                        placeholder='Password'
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
                        autoComplete='new-password'
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='referenceNumber'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Reference Number'
                        placeholder='ABC12345678'
                        inputProps={{ maxLength: 11, style: { textTransform: 'uppercase' } }}
                        value={field.value?.toUpperCase() || ''}
                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                        error={!!errors.referenceNumber}
                        helperText={errors.referenceNumber?.message}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <Button variant='outlined' size='small' onClick={generateReferenceNumber}>
                                Generate
                              </Button>
                            </InputAdornment>
                          )
                        }}
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
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name='serverPort'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Server Port'
                        variant='outlined'
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.serverPort}
                        helperText={errors.serverPort?.message}
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
                        type={isServerPasswordShown ? 'text' : 'password'}
                        variant='outlined'
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.serverPassword}
                        helperText={errors.serverPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                onClick={handleClickShowServerPassword}
                                onMouseDown={e => e.preventDefault()}
                                aria-label='toggle server password visibility'
                                edge='end'
                              >
                                <i className={isServerPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
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

                {selectedRole !== ROLE_TYPES.USER && (
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
                )}

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='role'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel id='role-select-label'>Role</InputLabel>
                        <Select
                          labelId='role-select-label'
                          fullWidth
                          label='Role'
                          disabled={getAllPlansLoading}
                          value={field.value}
                          onChange={e => {
                            field.onChange(e.target.value)
                            setSelectedRole(e.target.value)
                          }}
                          error={!!errors.role}
                          helperText={errors.role?.message}
                        >
                          {Object.values(ROLE_TYPES).map(role => (
                            <MenuItem key={role} value={role}>
                              {role}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CardHeader title='Report Permissions' sx={{ px: 0, pt: 3, pb: 0 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant='outlined' sx={{ p: 2 }}>
                    <CardHeader
                      title={getReportTypeLabel(REPORT_TYPE_VALUES.retailWholesaleByCategory)}
                      sx={{ px: 0, pt: 3, pb: 3 }}
                    />
                    <CardContent>
                      <Controller
                        name={`totalsOnly`}
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={
                                    reportPermissions[REPORT_TYPE_VALUES.retailWholesaleByCategory]?.totalsOnly || false
                                  }
                                  onChange={e => {
                                    setReportPermissions({
                                      ...reportPermissions,
                                      [REPORT_TYPE_VALUES.retailWholesaleByCategory]: {
                                        totalsOnly: e.target.checked
                                      }
                                    })
                                  }}
                                  name='totalsOnly'
                                />
                              }
                              label='Show Totals Only'
                              sx={{ mr: 3 }}
                            />
                          </FormControl>
                        )}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Button variant='contained' color='primary' type='submit' fullWidth disabled={createUserLoading}>
                    {createUserLoading ? 'Adding User...' : 'Add User'}
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

export default CreateUser
