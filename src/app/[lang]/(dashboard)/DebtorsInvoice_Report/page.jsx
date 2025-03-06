// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import DebtorsInvoiceReport from '@views/store/Debtors_Invoices_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <DebtorsInvoiceReport /> 
      </Grid>
    </Grid>
  )
}

export default Tables
