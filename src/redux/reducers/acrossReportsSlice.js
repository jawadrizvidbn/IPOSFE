import { createSlice } from '@reduxjs/toolkit'

const name = 'acrossReports'
const initialState = {
  reportType: ''
}

export const acrossReportsSlice = createSlice({
  name,
  initialState,
  reducers: {
    setReportType: (state, action) => {
      state.reportType = action.payload
    },
    clearReportType: state => {
      state.reportType = ''
    }
  }
})

export const { setReportType, clearReportType } = acrossReportsSlice.actions
export default acrossReportsSlice.reducer
