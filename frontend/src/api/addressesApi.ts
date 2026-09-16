import { apiSlice } from '@/api/apiSlice'
import type { Address } from '@/types'

export type AddressPayload = Omit<Address, 'id'>

export const addressesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], void>({
      query: () => '/addresses/',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Address' as const, id })), { type: 'Address' as const, id: 'LIST' }]
          : [{ type: 'Address' as const, id: 'LIST' }],
    }),
    createAddress: builder.mutation<Address, AddressPayload>({
      query: (payload) => ({
        url: '/addresses/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    updateAddress: builder.mutation<Address, { id: number } & Partial<AddressPayload>>({
      query: ({ id, ...body }) => ({
        url: `/addresses/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    deleteAddress: builder.mutation<void, number>({
      query: (id) => ({
        url: `/addresses/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi
