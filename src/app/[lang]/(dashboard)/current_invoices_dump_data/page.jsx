// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import Current_invoices from '@views/store/Current_invoices'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Current_invoices />
      </Grid>
    </Grid>
  )
}

export default Tables
