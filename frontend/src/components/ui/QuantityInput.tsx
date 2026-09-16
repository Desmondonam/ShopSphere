import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

interface QuantityInputProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  size?: 'sm' | 'md'
}

export function QuantityInput({ value, min = 1, max = 99, onChange, size = 'md' }: QuantityInputProps) {
  const buttonSize = size === 'sm' ? 'size-8' : 'size-10'

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-300">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(buttonSize, 'flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40')}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-8 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(buttonSize, 'flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40')}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
