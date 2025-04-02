// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllPriceChangeTablesRecord from '@views/store/PriceChange_Tables.jsx'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AllPriceChangeTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
