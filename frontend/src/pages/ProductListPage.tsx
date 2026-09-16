import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useGetCategoriesQuery } from '@/api/categoriesApi'
import { useGetProductsQuery } from '@/api/productsApi'
import { ProductFilters } from '@/components/product/ProductFilters'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { PRODUCT_SORT_OPTIONS } from '@/lib/constants'

const PAGE_SIZE = 12

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category')
  const minPrice = searchParams.get('min_price') ?? ''
  const maxPrice = searchParams.get('max_price') ?? ''
  const ordering = searchParams.get('ordering') ?? '-created_at'
  const page = Number(searchParams.get('page') ?? '1')

  const { data: categories } = useGetCategoriesQuery()
  const { data, isLoading, isError } = useGetProductsQuery({
    search: search || undefined,
    category: category || undefined,
    min_price: minPrice ? Number(minPrice) : undefined,
    max_price: maxPrice ? Number(maxPrice) : undefined,
    ordering,
    page,
  })

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    if (!('page' in updates)) next.delete('page')
    setSearchParams(next)
  }

  const activeCategory = categories?.find((c) => c.slug === category)

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Shop', to: '/products' }, ...(activeCategory ? [{ label: activeCategory.name }] : [])]} />

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {search ? `Results for "${search}"` : activeCategory?.name ?? 'All products'}
        </h1>
        <button
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 lg:hidden"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">
          <ProductFilters
            categories={categories}
            selectedCategory={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={(slug) => updateParams({ category: slug })}
            onPriceChange={(min, max) => updateParams({ min_price: min, max_price: max })}
            onClear={() => updateParams({ category: null, min_price: null, max_price: null, search: null })}
          />
        </div>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close">
                  <X className="size-5" />
                </button>
              </div>
              <ProductFilters
                categories={categories}
                selectedCategory={category}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onCategoryChange={(slug) => {
                  updateParams({ category: slug })
                  setMobileFiltersOpen(false)
                }}
                onPriceChange={(min, max) => updateParams({ min_price: min, max_price: max })}
                onClear={() => updateParams({ category: null, min_price: null, max_price: null, search: null })}
              />
            </div>
          </div>
        )}

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{data ? `${data.count} products` : ''}</p>
            <Select
              value={ordering}
              onChange={(e) => updateParams({ ordering: e.target.value })}
              className="w-auto"
              aria-label="Sort products"
            >
              {PRODUCT_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <ProductGrid products={data?.results} isLoading={isLoading} isError={isError} />

          {data && (
            <div className="mt-8">
              <Pagination
                page={page}
                totalCount={data.count}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => updateParams({ page: String(p) })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
