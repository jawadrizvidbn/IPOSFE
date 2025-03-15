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
import { toast } from 'react-toastify'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, number, integer } from 'valibot'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { createPlan } from '@/redux/reducers/planSlice'
import { thunkStatus } from '@/utils/statusHandler'

const schema = object({
  planName: string([
    minLength(1, 'This field is required'),
    minLength(3, 'Plan name must be at least 3 characters long')
  ]),
  numberOfStores: string([minLength(1, 'This field is required')]),
  planPrice: string([minLength(1, 'This field is required')])
})

const CreatePlan = () => {
  const dispatch = useDispatch()
  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      planName: '',
      numberOfStores: null,
      planPrice: ''
    }
  })

  const createPlanLoading = useSelector(state => state.plan.createPlanStatus === thunkStatus.LOADING)

  const onSubmit = async data => {
    const payload = { ...data, numberOfStores: parseInt(data.numberOfStores) }
    dispatch(createPlan(payload))
      .unwrap()
      .then(() => {
        reset()
      })
  }

  return (
    <Card>
      <CardHeader title='Validation Schema With OnChange' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='planName'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Plan Name'
                    placeholder='Plan Name'
                    {...(errors.planName && { error: true, helperText: errors.planName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='numberOfStores'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type='number'
                    fullWidth
                    label='Number of Stores'
                    placeholder='Number of Stores'
                    {...(errors.numberOfStores && { error: true, helperText: errors.numberOfStores.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='planPrice'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Plan Price'
                    placeholder='Plan Price'
                    {...(errors.planPrice && { error: true, helperText: errors.planPrice.message })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} className='flex gap-4'>
              <Button disabled={createPlanLoading} variant='contained' type='submit'>
                {createPlanLoading ? 'Creating...' : 'Create'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreatePlan
