import type { MouseEvent } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { addToCart } from '@/features/cart/cartSlice'
import { selectIsWishlisted, toggleWishlistItem } from '@/features/wishlist/wishlistSlice'
import { Badge } from '@/components/ui/Badge'
import { ProductImage } from '@/components/ui/ProductImage'
import { Rating } from '@/components/ui/Rating'
import { cn, discountPercent, formatCurrency, hasDiscount } from '@/lib/utils'
import type { ProductListItem } from '@/types'

export function ProductCard({ product }: { product: ProductListItem }) {
  const dispatch = useAppDispatch()
  const isWishlisted = useAppSelector(selectIsWishlisted(product.id))
  const onSale = hasDiscount(product.price, product.current_price)
  const outOfStock = product.stock <= 0

  function handleAddToCart(e: MouseEvent) {
    e.preventDefault()
    dispatch(
      addToCart({
        item: {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.primary_image,
          price: Number.parseFloat(product.current_price),
          stock: product.stock,
        },
      }),
    )
    toast.success(`${product.name} added to cart`)
  }

  function handleToggleWishlist(e: MouseEvent) {
    e.preventDefault()
    dispatch(
      toggleWishlistItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.primary_image,
        price: Number.parseFloat(product.current_price),
        addedAt: new Date().toISOString(),
      }),
    )
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <ProductImage
          src={product.primary_image}
          alt={product.name}
          className="transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {onSale && <Badge tone="red">-{discountPercent(product.price, product.current_price)}%</Badge>}
          {outOfStock && <Badge tone="gray">Out of stock</Badge>}
        </div>

        <button
          onClick={handleToggleWishlist}
          aria-label="Toggle wishlist"
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm hover:text-red-500"
        >
          <Heart className={cn('size-4', isWishlisted && 'fill-red-500 text-red-500')} />
        </button>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="absolute inset-x-2 bottom-2 flex translate-y-10 items-center justify-center gap-1.5 rounded-lg bg-gray-900 py-2 text-xs font-medium text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <ShoppingCart className="size-3.5" />
          {outOfStock ? 'Unavailable' : 'Quick add'}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        {product.category && <span className="text-xs text-gray-400">{product.category.name}</span>}
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{product.name}</h3>
        <Rating value={product.average_rating} count={product.review_count} />
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-semibold text-gray-900">{formatCurrency(product.current_price)}</span>
          {onSale && <span className="text-sm text-gray-400 line-through">{formatCurrency(product.price)}</span>}
        </div>
      </div>
    </Link>
  )
}
