// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllDataAccrossRecords from '@views/store/Across_tables.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <AllDataAccrossRecords />
      </Grid>
    </Grid>
  )
}

export default Tables
