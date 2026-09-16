import { CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { useGetOrderQuery } from '@/api/ordersApi'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/lib/utils'

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading } = useGetOrderQuery(Number(orderId))

  if (isLoading) return <FullPageSpinner />

  return (
    <div className="container-page flex flex-col items-center py-16 text-center">
      <CheckCircle2 className="size-16 text-green-500" />
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Order placed successfully!</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Thank you for your purchase. We&apos;ve sent a confirmation to your email and we&apos;ll notify you when your
        order ships.
      </p>

      {order && (
        <div className="mt-6 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Order number</span>
            <span className="font-medium text-gray-900">{order.order_number}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-gray-500">Total</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.total)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link to="/account/orders">
          <Button variant="outline">View orders</Button>
        </Link>
        <Link to="/products">
          <Button>Continue shopping</Button>
        </Link>
      </div>
    </div>
  )
}
