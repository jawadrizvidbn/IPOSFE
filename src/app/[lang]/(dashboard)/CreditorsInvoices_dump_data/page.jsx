// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllCreditorsInvoicesTablesRecord from '@views/store/Creditors_Invoices_Tables.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <AllCreditorsInvoicesTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
