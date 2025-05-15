// store/store.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import onlineReducer from './slices/onlineSlice'
import matchReducer from './slices/matchSlice'
import chatReducer from './slices/chatSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    online: onlineReducer,
    match: matchReducer,
    chat: chatReducer,
  },
})
