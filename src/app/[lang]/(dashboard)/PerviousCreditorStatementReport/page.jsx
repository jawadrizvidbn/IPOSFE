// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import PerviousCreditorStatement_Report from '@views/store/PerviousCreditorStatement_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <PerviousCreditorStatement_Report /> 
      </Grid>
    </Grid>
  )
}

export default Tables
