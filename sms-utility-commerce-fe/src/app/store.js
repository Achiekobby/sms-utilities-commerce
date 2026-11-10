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
import accessReducer from '../features/auth/accessSlice'
import authReducer from '../features/auth/authSlice'
import { baseApi } from '../services/api/baseApi'
import '../services/api/auth/authApi'
import '../services/api/apiKeys/apiKeysApi'
import '../services/api/wallet/walletApi'
import '../services/api/activity/activityApi'
import '../services/api/sender-ids/senderIdsApi'
import '../services/api/messages/messagesApi'
import '../services/api/contacts/contactsApi'
import '../services/api/contacts/contactRecordsApi'
import campaignsReducer from '../features/campaigns/campaignsSlice'
import contactsReducer from '../features/contacts/contactsSlice'
import messagesReducer from '../features/messages/messagesSlice'
import senderIdsReducer from '../features/sender-ids/senderIdsSlice'
import walletReducer, { demoWalletBalanceUnits } from '../features/wallet/walletSlice'

const authPersistConfig = {
  key: 'auth',
  storage,
}

const contactsPersistConfig = {
  key: 'contacts',
  storage,
  // Never keep local "created" groups across reloads. The API list is the source of truth.
  blacklist: ['created'],
}

const campaignsPersistConfig = {
  key: 'campaigns',
  storage,
}

const messagesPersistConfig = {
  key: 'messages',
  storage,
}

const senderIdsPersistConfig = {
  key: 'senderIds',
  storage,
}

const walletPersistConfig = {
  key: 'wallet',
  storage,
  // Bump when demo seed changes so persisted zero balances pick up the temporary float.
  version: 1,
  migrate: (state) => {
    if (!state || typeof state.balance !== 'number' || state.balance <= 0) {
      return Promise.resolve({
        balance: demoWalletBalanceUnits,
        entries: state?.entries ?? [],
      })
    }
    return Promise.resolve(state)
  },
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)
const persistedContactsReducer = persistReducer(contactsPersistConfig, contactsReducer)
const persistedCampaignsReducer = persistReducer(campaignsPersistConfig, campaignsReducer)
const persistedMessagesReducer = persistReducer(messagesPersistConfig, messagesReducer)
const persistedSenderIdsReducer = persistReducer(senderIdsPersistConfig, senderIdsReducer)
const persistedWalletReducer = persistReducer(walletPersistConfig, walletReducer)

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: persistedAuthReducer,
    access: accessReducer,
    contacts: persistedContactsReducer,
    campaigns: persistedCampaignsReducer,
    messages: persistedMessagesReducer,
    senderIds: persistedSenderIdsReducer,
    wallet: persistedWalletReducer,
    notifications: notificationsReducer(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['api', 'notifications'],
        ignoredActionPaths: [
          'meta.arg',
          'meta.baseQueryMeta',
          'meta.baseQueryMeta.request',
          'meta.baseQueryMeta.response',
          'payload',
        ],
      },
    }).concat(baseApi.middleware),
})

export const persistor = persistStore(store)
