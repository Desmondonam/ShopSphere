import { Rating } from '@/components/ui/Rating'
import { formatDate, initials } from '@/lib/utils'
import type { Review } from '@/types'

export function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="flex gap-3 border-b border-gray-100 py-5 last:border-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
        {initials(review.user.first_name, review.user.last_name)}
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-900">
            {review.user.first_name || review.user.email} {review.user.last_name}
          </p>
          <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
        </div>
        <Rating value={review.rating} className="mt-1" />
        {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
      </div>
    </div>
  )
}
