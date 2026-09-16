import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalCount, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  if (totalPages <= 1) return null

  const pages = getPageWindow(page, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex size-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex size-9 items-center justify-center rounded-lg text-sm font-medium',
              p === page ? 'bg-brand-600 text-white' : 'text-gray-700 hover:bg-gray-100',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex size-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}

function getPageWindow(current: number, total: number): (number | 'ellipsis')[] {
  const delta = 1
  const range: (number | 'ellipsis')[] = []
  const start = Math.max(2, current - delta)
  const end = Math.min(total - 1, current + delta)

  range.push(1)
  if (start > 2) range.push('ellipsis')
  for (let i = start; i <= end; i++) range.push(i)
  if (end < total - 1) range.push('ellipsis')
  if (total > 1) range.push(total)

  return range
}
