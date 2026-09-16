import { apiSlice } from '@/api/apiSlice'
import type { PaginatedResponse, Product, ProductListItem } from '@/types'

export interface ProductListParams {
  search?: string
  category?: string
  min_price?: number
  max_price?: number
  ordering?: string
  page?: number
}

function buildQueryString(params: ProductListParams): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<ProductListItem>, ProductListParams | void>({
      query: (params) => `/products/${buildQueryString(params ?? {})}`,
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),
    getProduct: builder.query<Product, string>({
      query: (slug) => `/products/${slug}/`,
      providesTags: (_result, _error, slug) => [{ type: 'Product', id: slug }],
    }),
    getRelatedProducts: builder.query<ProductListItem[], string>({
      query: (slug) => `/products/${slug}/related/`,
      providesTags: [{ type: 'Product', id: 'RELATED' }],
    }),
    getFeaturedProducts: builder.query<ProductListItem[], void>({
      query: () => '/products/?ordering=-average_rating&page_size=8',
      transformResponse: (response: PaginatedResponse<ProductListItem>) => response.results,
      providesTags: [{ type: 'Product', id: 'FEATURED' }],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
  useGetFeaturedProductsQuery,
} = productsApi
