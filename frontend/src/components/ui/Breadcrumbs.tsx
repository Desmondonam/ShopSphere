import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500">
      <Link to="/" className="flex items-center hover:text-brand-600">
        <Home className="size-3.5" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5 text-gray-300" />
          {item.to ? (
            <Link to={item.to} className="hover:text-brand-600">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
