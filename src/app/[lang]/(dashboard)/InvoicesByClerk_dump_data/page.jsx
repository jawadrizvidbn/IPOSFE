// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllInvoicesByClerkTablesRecord from '@views/store/InvoicesByClerk_Tables'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <AllInvoicesByClerkTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
