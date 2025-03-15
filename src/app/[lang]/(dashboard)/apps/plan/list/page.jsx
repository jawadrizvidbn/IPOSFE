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
import { getAllPlans, deletePlan } from '@/redux/reducers/planSlice'
import { thunkStatus } from '@/utils/statusHandler'

// Next Imports
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const ListPlans = () => {
  // Hooks
  const dispatch = useDispatch()
  const router = useRouter()

  const { lang: locale } = useParams()

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)

  // Redux state
  const plans = useSelector(state => state.plan.list)
  const loading = useSelector(state => state.plan.getAllPlansStatus === thunkStatus.LOADING)
  const deleting = useSelector(state => state.plan.deletePlanStatus === thunkStatus.LOADING)

  console.log(plans)

  // Fetch plans on component mount
  useEffect(() => {
    dispatch(getAllPlans())
  }, [dispatch])

  // Handle delete plan
  const handleDeleteClick = plan => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (planToDelete) {
      dispatch(deletePlan(planToDelete.id))
        .unwrap()
        .then(() => {
          setDeleteDialogOpen(false)
          setPlanToDelete(null)
        })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setPlanToDelete(null)
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
          <CardHeader title='Plans' />
          <CardContent>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <CircularProgress />
              </div>
            ) : (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label='plans table'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan Name</TableCell>
                      <TableCell align='right'>Number of Stores</TableCell>
                      <TableCell align='right'>Price</TableCell>
                      <TableCell align='right'>Created At</TableCell>
                      <TableCell align='right'>Updated At</TableCell>
                      <TableCell align='center'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plans?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align='center'>
                          <Typography variant='body1'>No plans found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      plans?.map(plan => (
                        <TableRow key={plan.id}>
                          <TableCell component='th' scope='row'>
                            {plan.planName}
                          </TableCell>
                          <TableCell align='right'>{plan.numberOfStores}</TableCell>
                          <TableCell align='right'>{plan.planPrice}</TableCell>
                          <TableCell align='right'>{formatDate(plan.createdAt)}</TableCell>
                          <TableCell align='right'>{formatDate(plan.updatedAt)}</TableCell>
                          <TableCell align='center'>
                            <Link href={`/${locale}/apps/plan/edit/${plan.id}`}>
                              <IconButton color='primary' aria-label='edit plan'>
                                <FiEdit size={20} />
                              </IconButton>
                            </Link>
                            <IconButton color='error' onClick={() => handleDeleteClick(plan)} aria-label='delete plan'>
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
        <DialogTitle id='delete-dialog-title'>{'Delete Plan'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            Are you sure you want to delete the plan "{planToDelete?.planName}"? This action cannot be undone.
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

export default ListPlans
