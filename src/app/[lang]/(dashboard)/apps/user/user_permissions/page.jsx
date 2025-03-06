// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import UserPermission from '@/views/store/User_Permissions.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <UserPermission/>
      </Grid>
    </Grid>
  )
}

export default Tables
