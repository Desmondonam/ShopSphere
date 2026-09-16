import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { addToCart } from '@/features/cart/cartSlice'
import { removeFromWishlist, selectWishlistItems } from '@/features/wishlist/wishlistSlice'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductImage } from '@/components/ui/ProductImage'
import { formatCurrency } from '@/lib/utils'

export default function WishlistPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectWishlistItems)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="size-10" />}
        title="Your wishlist is empty"
        description="Save products you love to find them here later."
        action={
          <Link to="/products" className="text-sm font-medium text-brand-600 hover:underline">
            Explore products
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Wishlist</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4">
            <Link to={`/products/${item.slug}`} className="size-20 shrink-0 overflow-hidden rounded-lg bg-gray-50">
              <ProductImage src={item.image} alt={item.name} />
            </Link>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link to={`/products/${item.slug}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    dispatch(
                      addToCart({
                        item: { productId: item.productId, slug: item.slug, name: item.name, image: item.image, price: item.price, stock: 99 },
                      }),
                    )
                    toast.success(`${item.name} added to cart`)
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                >
                  <ShoppingCart className="size-3.5" />
                  Add to cart
                </button>
                <button
                  onClick={() => dispatch(removeFromWishlist(item.productId))}
                  className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-500"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
