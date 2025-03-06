// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import Refund from '@views/store/Refund_tables.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <Refund />
      </Grid>
    </Grid>
  )
}

export default Tables
