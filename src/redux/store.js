import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { errorHandlerMiddleware } from '../utils/errorHandler'
import { statusHandlerEnahncer } from '../utils/statusHandler'

import exampleReducer from './reducers/exampleReducer'
import authReducer from './reducers/authSlice'
import shopKeyReducer from './reducers/shopKeySlice'
import stockOnHandReducer from './reducers/stockOnHandSlice'
import planReducer from './reducers/planSlice'
import permissionReducer from './reducers/permissionSlice'
import databaseReducer from './reducers/databaseSlice'
import dashboardReducer from './reducers/dashboardSlice'
import acrossReportsReducer from './reducers/acrossReportsSlice'

const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(persistConfig, authReducer)

const rootReducer = combineReducers({
  auth: persistedReducer,
  example: exampleReducer,
  shopKey: shopKeyReducer,
  stockOnHand: stockOnHandReducer,
  plan: planReducer,
  permission: permissionReducer,
  database: databaseReducer,
  dashboard: dashboardReducer,
  acrossReports: acrossReportsReducer
})

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    }).concat(errorHandlerMiddleware),
  enhancers: getDefaultEnhancers => getDefaultEnhancers().concat(statusHandlerEnahncer)
})

export const persistor = persistStore(store)
export default store
