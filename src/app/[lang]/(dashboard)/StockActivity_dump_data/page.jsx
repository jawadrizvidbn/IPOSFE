// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllStockActivityTablesRecord from '@views/store/StockActivity_Tables'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AllStockActivityTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
