// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import Void_Report from '@views/store/Void_Report'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <Void_Report /> 
      </Grid>
    </Grid>
  )
}

export default Tables
