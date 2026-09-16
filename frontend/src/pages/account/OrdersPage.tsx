import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

import { useGetOrdersQuery } from '@/api/ordersApi'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { formatCurrency, formatDate, orderStatusTone } from '@/lib/utils'

const PAGE_SIZE = 10

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useGetOrdersQuery({ page })

  if (isLoading) return <FullPageSpinner />

  if (!data || data.results.length === 0) {
    return (
      <EmptyState
        icon={<Package className="size-10" />}
        title="No orders yet"
        description="Your past orders will show up here once you place one."
        action={
          <Link to="/products" className="text-sm font-medium text-brand-600 hover:underline">
            Start shopping
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Orders</h1>

      <div className="mt-4 space-y-3">
        {data.results.map((order) => (
          <Link
            key={order.id}
            to={`/account/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
              <p className="text-xs text-gray-500">
                Placed on {formatDate(order.created_at)} · {order.items.length} item{order.items.length !== 1 && 's'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={orderStatusTone(order.status)}>{order.status}</Badge>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Pagination page={page} totalCount={data.count} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>
    </div>
  )
}
