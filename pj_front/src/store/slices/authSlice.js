import { createSlice } from '@reduxjs/toolkit';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

const initialState = {
  token: null,
  user: null, 
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: {
      reducer(state, action) {
        state.token = action.payload
        state.user = decodeJwt(action.payload)
      },
      prepare(token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
        }
        return { payload: token }
      }
    },
    clearCredentials: {
      reducer(state) {
        state.token = null
        state.user = null
      },
      prepare() {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
        return {}
      }
    }
  }
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer