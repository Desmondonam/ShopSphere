import type { PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'

type Tone = 'gray' | 'brand' | 'green' | 'amber' | 'red'

const toneClasses: Record<Tone, string> = {
  gray: 'bg-gray-100 text-gray-700',
  brand: 'bg-brand-100 text-brand-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
}

export function Badge({ tone = 'gray', children }: PropsWithChildren<{ tone?: Tone }>) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', toneClasses[tone])}>
      {children}
    </span>
  )
}
