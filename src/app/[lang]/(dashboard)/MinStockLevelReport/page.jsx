// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import MinStockLevel_Report from '@views/store/MinStockLevel_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <MinStockLevel_Report /> 
      </Grid>
    </Grid>
  )
}

export default Tables
