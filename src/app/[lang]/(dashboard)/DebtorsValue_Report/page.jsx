// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import DebtorsValue_Report from '@views/store/DebtorsValue_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <DebtorsValue_Report /> 
      </Grid>
    </Grid>
  )
}

export default Tables
