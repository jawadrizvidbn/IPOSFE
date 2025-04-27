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
import { object, minLength, string, optional } from 'valibot'
import { useDispatch, useSelector } from 'react-redux'
import { getPermissionById, updatePermission } from '@/redux/reducers/permissionSlice'
import { thunkStatus } from '@/utils/statusHandler'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

const schema = object({
  name: string([
    minLength(1, 'This field is required'),
    minLength(3, 'Permission name must be at least 3 characters long')
  ]),
  description: optional(string())
})

const EditPermission = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { id, lang: locale } = useParams()

  // Redux state
  const currentPermission = useSelector(state => state.permission.currentPermission)
  const fetchingPermission = useSelector(state => state.permission.getPermissionByIdStatus === thunkStatus.LOADING)
  const updatingPermission = useSelector(state => state.permission.updatePermissionStatus === thunkStatus.LOADING)

  // Form hooks
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      description: ''
    }
  })

  // Fetch permission data on component mount
  useEffect(() => {
    if (id) {
      dispatch(getPermissionById(id))
    }
  }, [dispatch, id])

  // Set form values when permission data is fetched
  useEffect(() => {
    if (currentPermission) {
      reset({
        name: currentPermission.name || '',
        description: currentPermission.description || ''
      })
    }
  }, [currentPermission, reset])

  // Handle form submission
  const onSubmit = async data => {
    const permission = {
      ...data
    }

    dispatch(updatePermission({ id, permission }))
      .unwrap()
      .then(() => {
        router.push(`/${locale}/apps/permission/list`)
      })
  }

  // Handle cancel button
  const handleCancel = () => {
    router.push(`/${locale}/apps/permission/list`)
  }

  if (fetchingPermission) {
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
      <CardHeader title='Edit Permission' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Permission Name'
                    placeholder='Enter permission name'
                    {...(errors.name && { error: true, helperText: errors.name.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='description'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Description'
                    placeholder='Enter permission description'
                    {...(errors.description && { error: true, helperText: errors.description.message })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} className='flex gap-4'>
              <Button disabled={updatingPermission} variant='contained' type='submit' sx={{ mr: 2 }}>
                {updatingPermission ? 'Updating...' : 'Update'}
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

export default EditPermission
