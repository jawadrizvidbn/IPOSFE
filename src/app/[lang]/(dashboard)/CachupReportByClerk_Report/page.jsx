// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import CachupReportByClerk_Report from '@views/store/CachupReportByClerk_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <CachupReportByClerk_Report /> 
      </Grid>
    </Grid>
  )
}

export default Tables
