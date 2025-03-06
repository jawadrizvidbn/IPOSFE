// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllUsers_Update from '@/views/store/Allusers_Update.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <AllUsers_Update/>
      </Grid>
    </Grid>
  )
}

export default Tables
