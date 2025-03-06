// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import ProductBySaleInvoiceTablesRecord from '@views/store/productBySaleInvoice_Tables'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <ProductBySaleInvoiceTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
