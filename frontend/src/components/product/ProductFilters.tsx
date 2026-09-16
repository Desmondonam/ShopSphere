import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface ProductFiltersProps {
  categories: Category[] | undefined
  selectedCategory: string | null
  minPrice: string
  maxPrice: string
  onCategoryChange: (slug: string | null) => void
  onPriceChange: (min: string, max: string) => void
  onClear: () => void
}

export function ProductFilters({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  onCategoryChange,
  onPriceChange,
  onClear,
}: ProductFiltersProps) {
  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)

  function applyPrice() {
    onPriceChange(localMin, localMax)
  }

  function handlePriceSubmit(e: FormEvent) {
    e.preventDefault()
    applyPrice()
  }

  const hasActiveFilters = !!selectedCategory || !!minPrice || !!maxPrice

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button onClick={onClear} className="text-xs font-medium text-brand-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700">Category</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategoryChange(null)}
              className={cn(
                'w-full rounded-lg px-2.5 py-1.5 text-left text-sm',
                !selectedCategory ? 'bg-brand-50 font-medium text-brand-700' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              All categories
            </button>
          </li>
          {categories?.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onCategoryChange(category.slug)}
                className={cn(
                  'w-full rounded-lg px-2.5 py-1.5 text-left text-sm',
                  selectedCategory === category.slug
                    ? 'bg-brand-50 font-medium text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700">Price range</h3>
        <form onSubmit={handlePriceSubmit} className="flex items-end gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            aria-label="Minimum price"
          />
          <span className="pb-2.5 text-gray-400">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            aria-label="Maximum price"
          />
        </form>
        <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={applyPrice}>
          Apply
        </Button>
      </div>
    </aside>
  )
}
