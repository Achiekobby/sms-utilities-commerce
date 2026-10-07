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
import storage from 'redux-persist/es/storage'
import accessReducer from '../features/auth/accessSlice'
import authReducer from '../features/auth/authSlice'
import contactsReducer from '../features/contacts/contactsSlice'

const authPersistConfig = {
  key: 'auth',
  storage,
}

const contactsPersistConfig = {
  key: 'contacts',
  storage,
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)
const persistedContactsReducer = persistReducer(contactsPersistConfig, contactsReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    access: accessReducer,
    contacts: persistedContactsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
