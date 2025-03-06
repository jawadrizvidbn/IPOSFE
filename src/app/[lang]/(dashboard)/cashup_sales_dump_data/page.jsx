// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import Cashup_Sales_Record from '@views/store/AllDataCashupRecords'

// Component imports

const ItemSalesDUMPDATA = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Cashup_Sales_Record />
      </Grid>
    </Grid>
  )
}

export default ItemSalesDUMPDATA
