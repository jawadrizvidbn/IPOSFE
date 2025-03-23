// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllUsers from '@/views/store/Allusers'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AllUsers />
      </Grid>
    </Grid>
  )
}

export default Tables
