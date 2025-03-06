// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllVoidTablesRecord from '@views/store/Void_Tables.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <AllVoidTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
