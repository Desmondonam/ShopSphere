import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { STORAGE_KEYS } from '@/lib/constants'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
}

function loadInitialState(): AuthState {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken)
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken)
    const rawUser = localStorage.getItem(STORAGE_KEYS.user)
    return {
      accessToken,
      refreshToken,
      user: rawUser ? (JSON.parse(rawUser) as User) : null,
    }
  } catch {
    return { user: null, accessToken: null, refreshToken: null }
  }
}

const initialState: AuthState = loadInitialState()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User | null; accessToken: string; refreshToken: string }>,
    ) => {
      const { user, accessToken, refreshToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.refreshToken = refreshToken

      localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
      localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
      if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null

      localStorage.removeItem(STORAGE_KEYS.accessToken)
      localStorage.removeItem(STORAGE_KEYS.refreshToken)
      localStorage.removeItem(STORAGE_KEYS.user)
    },
  },
})

export const { setCredentials, updateUser, logout } = authSlice.actions
export default authSlice.reducer
