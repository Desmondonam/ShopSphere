import { apiSlice } from '@/api/apiSlice'
import type { PaginatedResponse, Review } from '@/types'

export interface CreateReviewRequest {
  product: number
  rating: number
  comment: string
}

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<PaginatedResponse<Review>, { productId: number; page?: number }>({
      query: ({ productId, page }) => `/reviews/?product=${productId}${page ? `&page=${page}` : ''}`,
      providesTags: (result, _error, { productId }) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Review' as const, id })),
              { type: 'Review' as const, id: `PRODUCT_${productId}` },
            ]
          : [{ type: 'Review' as const, id: `PRODUCT_${productId}` }],
    }),
    createReview: builder.mutation<Review, CreateReviewRequest>({
      query: (payload) => ({
        url: '/reviews/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { product }) => [
        { type: 'Review', id: `PRODUCT_${product}` },
        { type: 'Product', id: 'LIST' },
      ],
    }),
    updateReview: builder.mutation<Review, { id: number; rating: number; comment: string; productId: number }>({
      query: ({ id, ...body }) => ({
        url: `/reviews/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Review', id: `PRODUCT_${productId}` }],
    }),
    deleteReview: builder.mutation<void, { id: number; productId: number }>({
      query: ({ id }) => ({
        url: `/reviews/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Review', id: `PRODUCT_${productId}` }],
    }),
  }),
})

export const {
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi
