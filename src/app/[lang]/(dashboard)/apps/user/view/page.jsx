// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import Register from '@/views/store/UserRegister.jsx'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Register />
      </Grid>
    </Grid>
  )
}

export default Tables
