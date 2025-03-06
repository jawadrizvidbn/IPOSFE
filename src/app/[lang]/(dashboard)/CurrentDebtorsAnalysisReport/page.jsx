// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import CurrentDebtorsAnalysis_Report from '@views/store/CurrentDebtorsAnalysis_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <CurrentDebtorsAnalysis_Report /> 
      </Grid>
    </Grid>
  )
}

export default Tables
