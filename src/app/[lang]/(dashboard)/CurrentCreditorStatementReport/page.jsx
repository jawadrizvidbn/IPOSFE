// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import CurrentCreditorStatement_Report from '@views/store/CurrentCreditorStatement_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <CurrentCreditorStatement_Report /> 
      </Grid>
    </Grid>
  )
}

export default Tables
