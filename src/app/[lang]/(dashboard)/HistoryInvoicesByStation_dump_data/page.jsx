// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllHistoryInvoicesByStationTablesRecord from '@views/store/HistoryInvoicesByStation_Tables'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AllHistoryInvoicesByStationTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
