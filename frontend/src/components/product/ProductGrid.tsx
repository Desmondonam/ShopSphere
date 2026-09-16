import { PackageSearch } from 'lucide-react'

import { ProductCard } from '@/components/product/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductGridSkeleton } from '@/components/ui/SkeletonCard'
import type { ProductListItem } from '@/types'

interface ProductGridProps {
  products: ProductListItem[] | undefined
  isLoading: boolean
  isError: boolean
}

export function ProductGrid({ products, isLoading, isError }: ProductGridProps) {
  if (isLoading) return <ProductGridSkeleton />

  if (isError) {
    return (
      <EmptyState
        icon={<PackageSearch className="size-10" />}
        title="Couldn't load products"
        description="Something went wrong while fetching products. Please try again."
      />
    )
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="size-10" />}
        title="No products found"
        description="Try adjusting your filters or search terms."
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
