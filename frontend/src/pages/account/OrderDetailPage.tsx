import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useCancelOrderMutation, useGetOrderQuery } from '@/api/ordersApi'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductImage } from '@/components/ui/ProductImage'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { formatCurrency, formatDate, orderStatusTone } from '@/lib/utils'
import type { ApiError } from '@/types'

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading } = useGetOrderQuery(Number(orderId))
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation()
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return <FullPageSpinner />

  if (!order) {
    return <EmptyState title="Order not found" description="This order doesn't exist or you don't have access to it." />
  }

  async function handleCancel() {
    if (!order || !window.confirm('Cancel this order?')) return
    setError(null)
    try {
      await cancelOrder(order.id).unwrap()
      toast.success('Order cancelled')
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.data?.detail ?? 'Could not cancel this order.')
    }
  }

  const canCancel = order.status === 'pending' || order.status === 'processing'

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Orders', to: '/account/orders' }, { label: order.order_number }]} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{order.order_number}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
        </div>
        <Badge tone={orderStatusTone(order.status)}>{order.status}</Badge>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-gray-200 bg-white">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 border-b border-gray-100 p-4 last:border-0">
              <Link to={`/products/${item.product.slug}`} className="size-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                <ProductImage src={item.product.primary_image} alt={item.product.name} />
              </Link>
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <Link to={`/products/${item.product.slug}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    Qty {item.quantity} × {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Shipping address</h2>
            <p className="mt-2 text-sm text-gray-600">
              {order.shipping_address.full_name}
              <br />
              {order.shipping_address.street_address}, {order.shipping_address.city}, {order.shipping_address.state}{' '}
              {order.shipping_address.postal_code}, {order.shipping_address.country}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Method</span>
                <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatCurrency(order.shipping_fee)}</span>
              </div>
              <div className="my-2 h-px bg-gray-100" />
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {canCancel && (
            <Button variant="danger" className="w-full" onClick={() => void handleCancel()} isLoading={isCancelling}>
              Cancel order
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
