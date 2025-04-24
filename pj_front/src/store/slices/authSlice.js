
import { createSlice } from '@reduxjs/toolkit';

// helper para decodificar el payload de un JWT (sin librerías externas)
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
  user: null,    // aquí guardaremos el objeto decodificado
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
        // side-effect: guardar en localStorage
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
