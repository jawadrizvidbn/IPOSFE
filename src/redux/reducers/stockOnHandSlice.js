// src/redux/reducers/stockOnHandSlice.js
import { createSlice } from '@reduxjs/toolkit'

const stockOnHandSlice = createSlice({
  name: 'stockOnHand',
  initialState: [], // Start with an empty array
  reducers: {
    // Append new data to the existing state
    setStockOnHand: (state, action) => {
      return [...state, ...action.payload] // Append new items to the existing state
    },
    clearStockOnHand: () => [] // Clear the stored response
  }
})

export const { setStockOnHand, clearStockOnHand } = stockOnHandSlice.actions
export default stockOnHandSlice.reducer
