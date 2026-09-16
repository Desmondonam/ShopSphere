import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import { API_BASE_URL } from '@/lib/constants'
import { logout, setCredentials } from '@/features/auth/authSlice'
import type { RootState } from '@/app/store'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// Wraps the base query so that a 401 triggers a single token-refresh attempt
// before retrying the original request. If the refresh also fails, the user
// is logged out and the original 401 is surfaced to the caller.
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/token/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions,
      )

      if (refreshResult.data) {
        const { access } = refreshResult.data as { access: string }
        const currentUser = (api.getState() as RootState).auth.user
        api.dispatch(setCredentials({ user: currentUser, accessToken: access, refreshToken }))
        result = await rawBaseQuery(args, api, extraOptions)
      } else {
        api.dispatch(logout())
      }
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'Category', 'Review', 'Order', 'Address', 'User', 'Wishlist'],
  endpoints: () => ({}),
})
