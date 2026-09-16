import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-10',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return <Loader2 className={cn('animate-spin text-current', sizeMap[size], className)} aria-hidden="true" />
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" className="text-brand-600" />
    </div>
  )
}
