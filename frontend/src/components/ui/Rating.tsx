import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

interface RatingProps {
  value: number | null
  count?: number
  size?: 'sm' | 'md'
  className?: string
}

export function Rating({ value, count, size = 'sm', className }: RatingProps) {
  const rating = value ?? 0
  const starSize = size === 'sm' ? 'size-3.5' : 'size-5'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200',
            )}
          />
        ))}
      </div>
      {value !== null && (
        <span className="text-xs font-medium text-gray-600">
          {value.toFixed(1)}
          {typeof count === 'number' && <span className="text-gray-400"> ({count})</span>}
        </span>
      )}
      {value === null && <span className="text-xs text-gray-400">No reviews yet</span>}
    </div>
  )
}

interface RatingInputProps {
  value: number
  onChange: (value: number) => void
}

export function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            className="p-0.5"
            aria-label={`Rate ${starValue} out of 5`}
          >
            <Star
              className={cn(
                'size-6 transition-colors',
                starValue <= value ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 hover:fill-amber-200',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
