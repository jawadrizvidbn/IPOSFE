// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import Adjustment_Report from '@views/store/Adjustment_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <Adjustment_Report />
      </Grid>
    </Grid>
  )
}

export default Tables
