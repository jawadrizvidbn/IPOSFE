// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllDebtorsPaymentTablesRecord from '@views/store/Debtors_Payment_Tables'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AllDebtorsPaymentTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
