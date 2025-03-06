// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import CreditorsValue_Report from '@views/store/CreditorsValue_Reports.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <CreditorsValue_Report /> 
      </Grid>
    </Grid>
  )
}

export default Tables
