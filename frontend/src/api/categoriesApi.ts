import { apiSlice } from '@/api/apiSlice'
import type { Category } from '@/types'

export const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/categories/',
      providesTags: ['Category'],
    }),
    getCategory: builder.query<Category, string>({
      query: (slug) => `/categories/${slug}/`,
      providesTags: (_result, _error, slug) => [{ type: 'Category', id: slug }],
    }),
  }),
})

export const { useGetCategoriesQuery, useGetCategoryQuery } = categoriesApi
