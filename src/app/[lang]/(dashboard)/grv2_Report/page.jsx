// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import GRV2_Report from '@views/store/Grv2_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <GRV2_Report />
      </Grid>
    </Grid>
  )
}

export default Tables
