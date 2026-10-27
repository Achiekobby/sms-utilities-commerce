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
import campaignsReducer from '../features/campaigns/campaignsSlice'
import contactsReducer from '../features/contacts/contactsSlice'
import messagesReducer from '../features/messages/messagesSlice'
import senderIdsReducer from '../features/sender-ids/senderIdsSlice'

const authPersistConfig = {
  key: 'auth',
  storage,
}

const contactsPersistConfig = {
  key: 'contacts',
  storage,
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

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)
const persistedContactsReducer = persistReducer(contactsPersistConfig, contactsReducer)
const persistedCampaignsReducer = persistReducer(campaignsPersistConfig, campaignsReducer)
const persistedMessagesReducer = persistReducer(messagesPersistConfig, messagesReducer)
const persistedSenderIdsReducer = persistReducer(senderIdsPersistConfig, senderIdsReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    access: accessReducer,
    contacts: persistedContactsReducer,
    campaigns: persistedCampaignsReducer,
    messages: persistedMessagesReducer,
    senderIds: persistedSenderIdsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
