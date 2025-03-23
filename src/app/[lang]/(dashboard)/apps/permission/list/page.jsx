'use client'

// MUI Imports
import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// Icon Imports
import { FiEdit, FiTrash2 } from 'react-icons/fi'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import { getAllPermissions, deletePermission } from '@/redux/reducers/permissionSlice'
import { thunkStatus } from '@/utils/statusHandler'

// Next Imports
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const ListPermission = () => {
  // Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const { lang: locale } = useParams()

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permissionToDelete, setPermissionToDelete] = useState(null)

  // Redux state
  const permissions = useSelector(state => state.permission.list)
  const loading = useSelector(state => state.permission.getAllPermissionsStatus === thunkStatus.LOADING)
  const deleting = useSelector(state => state.permission.deletePermissionStatus === thunkStatus.LOADING)

  // Fetch permissions on component mount
  useEffect(() => {
    dispatch(getAllPermissions())
  }, [dispatch])

  // Handle delete permission
  const handleDeleteClick = permission => {
    setPermissionToDelete(permission)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (permissionToDelete) {
      dispatch(deletePermission(permissionToDelete.id))
        .unwrap()
        .then(() => {
          setDeleteDialogOpen(false)
          setPermissionToDelete(null)
        })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setPermissionToDelete(null)
  }

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Permissions' 
            action={
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => router.push(`/${locale}/apps/permission/create`)}
              >
                Add Permission
              </Button>
            }
          />
          <CardContent>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <CircularProgress />
              </div>
            ) : (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label='permissions table'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align='right'>Created At</TableCell>
                      <TableCell align='right'>Updated At</TableCell>
                      <TableCell align='center'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {permissions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align='center'>
                          <Typography variant='body1'>No permissions found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      permissions?.map(permission => (
                        <TableRow key={permission.id}>
                          <TableCell component='th' scope='row'>
                            {permission.name}
                          </TableCell>
                          <TableCell>{permission.description}</TableCell>
                          <TableCell align='right'>{formatDate(permission.createdAt)}</TableCell>
                          <TableCell align='right'>{formatDate(permission.updatedAt)}</TableCell>
                          <TableCell align='center'>
                            <Link href={`/${locale}/apps/permission/edit/${permission.id}`}>
                              <IconButton color='primary' aria-label='edit permission'>
                                <FiEdit size={20} />
                              </IconButton>
                            </Link>
                            <IconButton color='error' onClick={() => handleDeleteClick(permission)} aria-label='delete permission'>
                              <FiTrash2 size={20} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>{'Delete Permission'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            Are you sure you want to delete the permission "{permissionToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='primary'>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color='error'
            variant='contained'
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} color='inherit' /> : null}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ListPermission
