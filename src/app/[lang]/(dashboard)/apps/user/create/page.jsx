'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import axios from 'axios'
import { toast } from 'react-toastify'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { email, object, minLength, string } from 'valibot'

const schema = object({
  name: string([minLength(1, 'This field is required'), minLength(3, 'Name must be at least 3 characters long')]),
  email: string([minLength(1, 'This field is required'), email('Please enter a valid email address')]),
  image: string([minLength(1, 'This field is required')]),

  // role: string([minLength(1, 'This field is required')]),

  // permissions: string([minLength(1, 'This field is required')]),
  password: string([
    minLength(1, 'This field is required'),
    minLength(8, 'Password must be at least 8 characters long')
  ]),
  plan: string([minLength(1, 'Plan is required')]),
  planActive: string(), // You might want to use a boolean value instead
  planStartDate: string(),
  planEndDate: string()
})

const CreateUser = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      image: '',

      // role: '',

      // permissions: '',
      password: '',
      plan: 'Basic', // Default value
      planActive: 'true', // String type, consider changing to boolean if needed
      planStartDate: '',
      planEndDate: ''
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async data => {
    try {
      // Fetch admin token from your state, context, or Redux store
      const adminToken = 'tokan'

      // Make API call to register user
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/register`

      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }

      const response = await axios.post(apiUrl, data, config)

      // Reset form after successful submission
      reset()

      // Display success message
      toast.success('User added successfully')
    } catch (error) {
      // Display error message
      toast.error('Failed to add user')
      console.error('Error adding user:', error)
    }
  }
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Add User' />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: true }}
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
                    rules={{ required: true }}
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
                    name='image'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        type='file'
                        {...field}
                        fullWidth
                        label='Image'
                        variant='outlined'
                        error={!!errors.image}
                        helperText={errors.image ? errors.image.message : ''}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: true }}
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
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='plan'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Plan'
                        variant='outlined'
                        error={!!errors.plan}
                        helperText={errors.plan ? errors.plan.message : ''}
                        InputLabelProps={{ shrink: true }}
                      />
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

                <Grid item xs={12}>
                  <Button variant='contained' color='primary' type='submit' fullWidth>
                    Add User
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
