import { apiSlice } from '@/api/apiSlice'
import type { User } from '@/types'

interface TokenResponse {
  access: string
  refresh: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  first_name: string
  last_name: string
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TokenResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/token/',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<TokenResponse, RegisterRequest>({
      query: (payload) => ({
        url: '/auth/register/',
        method: 'POST',
        body: payload,
      }),
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me/',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, Partial<Pick<User, 'first_name' | 'last_name' | 'phone_number'>>>({
      query: (payload) => ({
        url: '/auth/me/',
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useUpdateProfileMutation,
} = authApi
