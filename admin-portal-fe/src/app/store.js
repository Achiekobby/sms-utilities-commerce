import { configureStore } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist'
import { reducer as notificationsReducer } from 'reapop'
import storage from 'redux-persist/es/storage'
import authReducer from '../features/auth/authSlice'
import { baseApi } from '../services/api/baseApi'
import '../services/api/auth/authApi'
import '../services/api/profile/profileApi'

const authPersistConfig = {
  key: 'admin-auth',
  storage,
}

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: persistReducer(authPersistConfig, authReducer),
    notifications: notificationsReducer(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['api', 'notifications'],
        ignoredActionPaths: ['meta.arg', 'payload'],
      },
    }).concat(baseApi.middleware),
})

export const persistor = persistStore(store)
