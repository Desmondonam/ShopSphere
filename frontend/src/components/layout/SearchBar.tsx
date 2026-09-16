import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function SearchBar({ className }: { className?: string }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [value, setValue] = useState(searchParams.get('search') ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = value.trim()
    navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : '/products')
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)} role="search">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products, brands and categories…"
        aria-label="Search products"
        className="block w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </form>
  )
}
