// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllCachupReportByClerkTablesRecord from '@views/store/CachupReportByClerk_Tables'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AllCachupReportByClerkTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
