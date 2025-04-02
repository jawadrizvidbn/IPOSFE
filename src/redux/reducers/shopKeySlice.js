// src/redux/reducers/shopKeySlice.js
import { createSlice } from '@reduxjs/toolkit'

const shopKeySlice = createSlice({
  name: 'shopKey',
  initialState: '',
  reducers: {
    setShopKey: (state, action) => action.payload,
    clearShopKey: () => ''
  }
})

export const { setShopKey, clearShopKey } = shopKeySlice.actions
export default shopKeySlice.reducer
