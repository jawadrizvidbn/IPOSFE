// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import GRV from '@views/store/Grv_tables.jsx'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <GRV />
      </Grid>
    </Grid>
  )
}

export default Tables
