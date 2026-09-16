import { ShoppingBag, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCart, removeFromCart, selectCartItems, selectCartSubtotal, updateQuantity } from '@/features/cart/cartSlice'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductImage } from '@/components/ui/ProductImage'
import { QuantityInput } from '@/components/ui/QuantityInput'
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

export default function CartPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const items = useAppSelector(selectCartItems)
  const subtotal = useAppSelector(selectCartSubtotal)

  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<ShoppingBag className="size-10" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={
            <Link to="/products">
              <Button>Start shopping</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Your cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4">
              <Link to={`/products/${item.slug}`} className="size-20 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                <ProductImage src={item.image} alt={item.name} />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/products/${item.slug}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="text-gray-400 hover:text-red-500"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityInput
                    value={item.quantity}
                    max={item.stock}
                    size="sm"
                    onChange={(quantity) => dispatch(updateQuantity({ productId: item.productId, quantity }))}
                  />
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="p-4">
            <button onClick={() => dispatch(clearCart())} className="text-xs font-medium text-gray-400 hover:text-red-500">
              Clear cart
            </button>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>
          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-gray-400">
                Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
              </p>
            )}
            <div className="my-2 h-px bg-gray-100" />
            <div className="flex justify-between text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Button className="mt-5 w-full" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
