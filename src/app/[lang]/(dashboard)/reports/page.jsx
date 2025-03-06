// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import Reports from '@views/store/Reports'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <Reports />
      </Grid>
    </Grid>
  )
}

export default Tables
