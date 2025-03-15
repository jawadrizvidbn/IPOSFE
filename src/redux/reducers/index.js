// src/redux/reducers/index.js
import { combineReducers } from 'redux'

import exampleReducer from './exampleReducer'
import authReducer from './authSlice'
import shopKeyReducer from './shopKeySlice'
import stockOnHandReducer from './stockOnHandSlice'
import planReducer from './planSlice'

const rootReducer = combineReducers({
  example: exampleReducer,
  auth: authReducer,
  shopKey: shopKeyReducer,
  stockOnHand: stockOnHandReducer,
  plan: planReducer
})

export default rootReducer
