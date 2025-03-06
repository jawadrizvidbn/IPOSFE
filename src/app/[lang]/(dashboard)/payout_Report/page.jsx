// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import PayoutReport from '@views/store/Payout_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <PayoutReport /> 
      </Grid>
    </Grid>
  )
}

export default Tables
