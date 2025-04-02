// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllPayoutTablesRecord from '@views/store/Payout_Tables'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AllPayoutTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
