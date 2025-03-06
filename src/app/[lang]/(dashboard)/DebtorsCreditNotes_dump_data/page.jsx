// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllDebtorsCreditNotesTablesRecord from '@views/store/Debtors_Credit_Notes_Tables'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <AllDebtorsCreditNotesTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
