// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllDebtorsDebitNotesTablesRecord from '@views/store/Debtors_Debit_Notes_Tables'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <AllDebtorsDebitNotesTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
