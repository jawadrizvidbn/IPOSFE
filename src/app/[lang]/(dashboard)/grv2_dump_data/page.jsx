// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import GRV2 from '@views/store/Grv2_tables.jsx'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <GRV2 />
      </Grid>
    </Grid>
  )
}

export default Tables
