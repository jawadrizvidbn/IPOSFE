import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { errorHandlerMiddleware } from '../utils/errorHandler'
import { statusHandlerEnahncer } from '../utils/statusHandler'

import rootReducer from './reducers'

const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
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
