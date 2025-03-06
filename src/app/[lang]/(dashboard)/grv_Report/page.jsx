// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import GRV_Report from '@views/store/Grv_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <GRV_Report />
      </Grid>
    </Grid>
  )
}

export default Tables
