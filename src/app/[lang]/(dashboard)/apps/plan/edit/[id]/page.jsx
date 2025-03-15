'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string } from 'valibot'
import { useDispatch, useSelector } from 'react-redux'
import { getPlanById, updatePlan } from '@/redux/reducers/planSlice'
import { thunkStatus } from '@/utils/statusHandler'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

const schema = object({
  planName: string([
    minLength(1, 'This field is required'),
    minLength(3, 'Plan name must be at least 3 characters long')
  ]),
  numberOfStores: string([minLength(1, 'This field is required')]),
  planPrice: string([minLength(1, 'This field is required')])
})

const EditPlan = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { id, lang: locale } = useParams()

  // Redux state
  const currentPlan = useSelector(state => state.plan.currentPlan)
  const fetchingPlan = useSelector(state => state.plan.getPlanByIdStatus === thunkStatus.LOADING)
  const updatingPlan = useSelector(state => state.plan.updatePlanStatus === thunkStatus.LOADING)

  // Form hooks
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      planName: '',
      numberOfStores: '',
      planPrice: ''
    }
  })

  // Fetch plan data on component mount
  useEffect(() => {
    if (id) {
      dispatch(getPlanById(id))
    }
  }, [dispatch, id])

  // Set form values when plan data is fetched
  useEffect(() => {
    if (currentPlan) {
      reset({
        planName: currentPlan.planName || '',
        numberOfStores: currentPlan.numberOfStores?.toString() || '',
        planPrice: currentPlan.planPrice || ''
      })
    }
  }, [currentPlan, reset])

  // Handle form submission
  const onSubmit = async data => {
    const plan = {
      ...data,
      numberOfStores: parseInt(data.numberOfStores)
    }

    dispatch(updatePlan({ id, plan }))
      .unwrap()
      .then(() => {
        router.push(`/${locale}/apps/plan/list`)
      })
  }

  // Handle cancel button
  const handleCancel = () => {
    router.push(`/${locale}/apps/plan/list`)
  }

  if (fetchingPlan) {
    return (
      <Card>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <CircularProgress />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='Edit Plan' />
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
              <Button disabled={updatingPlan} variant='contained' type='submit' sx={{ mr: 2 }}>
                {updatingPlan ? 'Updating...' : 'Update'}
              </Button>
              <Button variant='outlined' onClick={handleCancel}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default EditPlan
