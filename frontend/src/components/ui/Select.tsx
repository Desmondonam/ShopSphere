import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id ?? generatedId

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          className={cn(
            'block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            error && 'border-red-400',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'
