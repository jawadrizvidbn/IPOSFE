// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import Cashup_sales from '@/views/store/Cashup_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <Cashup_sales/>
      </Grid>
    </Grid>
  )
}

export default Tables
