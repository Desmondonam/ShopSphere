import { type ClassValue, clsx } from 'clsx'

import { API_ORIGIN, CURRENCY } from '@/lib/constants'
import type { OrderStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number | string): string {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value
  if (Number.isNaN(amount)) return '—'
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
  }).format(amount)
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat(CURRENCY.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export function hasDiscount(price: string, currentPrice: string): boolean {
  return Number.parseFloat(currentPrice) < Number.parseFloat(price)
}

export function discountPercent(price: string, currentPrice: string): number {
  const original = Number.parseFloat(price)
  const current = Number.parseFloat(currentPrice)
  if (!original || original <= current) return 0
  return Math.round(((original - current) / original) * 100)
}

export function resolveMediaUrl(src: string | null | undefined): string | null {
  if (!src) return null
  if (/^https?:\/\//.test(src)) return src
  return `${API_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`
}

export function getPrimaryImage(images: { image: string; is_primary: boolean }[] | undefined): string | null {
  if (!images || images.length === 0) return null
  return images.find((img) => img.is_primary)?.image ?? images[0].image
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'
}

export function orderStatusTone(status: OrderStatus): 'gray' | 'brand' | 'green' | 'amber' | 'red' {
  switch (status) {
    case 'pending':
      return 'amber'
    case 'processing':
      return 'brand'
    case 'shipped':
      return 'brand'
    case 'delivered':
      return 'green'
    case 'cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delayMs)
  }
}
