// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import DebtorsPayments_Report from '@views/store/DebtorsPayments_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <DebtorsPayments_Report /> 
      </Grid>
    </Grid>
  )
}

export default Tables
