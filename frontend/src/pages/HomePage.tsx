import type { ReactNode } from 'react'
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useGetCategoriesQuery } from '@/api/categoriesApi'
import { useGetFeaturedProductsQuery } from '@/api/productsApi'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductImage } from '@/components/ui/ProductImage'

export default function HomePage() {
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery()
  const { data: featured, isLoading: featuredLoading, isError: featuredError } = useGetFeaturedProductsQuery()

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="container-page flex flex-col items-start gap-6 py-16 sm:py-24">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">New season, new deals</span>
          <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
            Shop smarter with ShopSphere
          </h1>
          <p className="max-w-lg text-brand-100">
            Curated products, unbeatable prices, and fast delivery — all in one place.
          </p>
          <Link
            to="/products"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-base font-medium text-brand-700 transition-colors hover:bg-brand-50"
          >
            Shop now
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white">
        <div className="container-page grid grid-cols-1 gap-6 py-10 sm:grid-cols-3">
          <Perk icon={<Truck className="size-5" />} title="Free shipping" description="On orders over $100" />
          <Perk icon={<RotateCcw className="size-5" />} title="Easy returns" description="30-day return policy" />
          <Perk icon={<ShieldCheck className="size-5" />} title="Secure checkout" description="100% protected payments" />
        </div>
      </section>

      {(categoriesLoading || (categories && categories.length > 0)) && (
        <section className="container-page py-12">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categoriesLoading
              ? Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
                ))
              : categories?.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.slug}`}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-center transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
                      <ProductImage src={category.image} alt={category.name} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600">
                      {category.name}
                    </span>
                  </Link>
                ))}
          </div>
        </section>
      )}

      <section className="container-page py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Top rated products</h2>
          <Link to="/products" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <ProductGrid products={featured} isLoading={featuredLoading} isError={featuredError} />
      </section>
    </div>
  )
}

function Perk({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}
