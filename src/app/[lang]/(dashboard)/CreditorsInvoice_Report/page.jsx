// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import CreditorsInvoiceReport from '@views/store/Creditors_Invoices_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <CreditorsInvoiceReport /> 
      </Grid>
    </Grid>
  )
}

export default Tables
