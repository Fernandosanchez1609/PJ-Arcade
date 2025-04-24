// store/store.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import onlineReducer from './slices/onlineSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    online: onlineReducer,
    // aquí puedes añadir más slices…
  },
})
