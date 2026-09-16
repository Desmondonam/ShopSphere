import { apiSlice } from '@/api/apiSlice'
import type { Order, PaginatedResponse, PaymentMethod } from '@/types'

export interface CreateOrderRequest {
  items: { product: number; quantity: number }[]
  shipping_address_id: number
  payment_method: PaymentMethod
}

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<PaginatedResponse<Order>, { page?: number } | void>({
      query: (params) => `/orders/${params?.page ? `?page=${params.page}` : ''}`,
      providesTags: (result) =>
        result
          ? [...result.results.map(({ id }) => ({ type: 'Order' as const, id })), { type: 'Order' as const, id: 'LIST' }]
          : [{ type: 'Order' as const, id: 'LIST' }],
    }),
    getOrder: builder.query<Order, number>({
      query: (id) => `/orders/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (payload) => ({
        url: '/orders/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    cancelOrder: builder.mutation<Order, number>({
      query: (id) => ({
        url: `/orders/${id}/cancel/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Order', id }, { type: 'Order', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
} = ordersApi
