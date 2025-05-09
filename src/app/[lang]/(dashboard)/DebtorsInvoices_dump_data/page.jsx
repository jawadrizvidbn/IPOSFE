// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllDebtorsInvoicesTablesRecord from '@views/store/Debtors_Invoices_Tables'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AllDebtorsInvoicesTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
