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
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { toast } from 'react-toastify'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, optional } from 'valibot'
import { useDispatch, useSelector } from 'react-redux'
import { createPermission } from '@/redux/reducers/permissionSlice'
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

const CreatePermission = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { lang: locale } = useParams()

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
      description: ''
    }
  })

  const createPermissionLoading = useSelector(state => state.permission.createPermissionStatus === thunkStatus.LOADING)

  const onSubmit = async data => {
    dispatch(createPermission(data))
      .unwrap()
      .then(() => {
        reset()
        router.push(`/${locale}/apps/permission/list`)
      })
  }

  const handleCancel = () => {
    router.push(`/${locale}/apps/permission/list`)
  }

  return (
    <Card>
      <CardHeader title='Create Permission' />
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
              <Button disabled={createPermissionLoading} variant='contained' type='submit' sx={{ mr: 2 }}>
                {createPermissionLoading ? 'Creating...' : 'Create'}
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

export default CreatePermission
