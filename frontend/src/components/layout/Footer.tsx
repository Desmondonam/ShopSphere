import { Camera, Globe, MessageCircle, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SITE_NAME } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link to="/" className="flex items-center gap-1.5 text-lg font-bold text-gray-900">
            <ShoppingBag className="size-5 text-brand-600" />
            {SITE_NAME}
          </Link>
          <p className="mt-3 text-sm text-gray-500">Everything you need, delivered to your door.</p>
          <div className="mt-4 flex gap-3 text-gray-400">
            <a href="#" aria-label="Facebook" className="hover:text-brand-600">
              <Globe className="size-4" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-brand-600">
              <Camera className="size-4" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-brand-600">
              <MessageCircle className="size-4" />
            </a>
          </div>
        </div>

        <FooterColumn
          title="Shop"
          links={[
            { label: 'All products', to: '/products' },
            { label: 'New arrivals', to: '/products?ordering=-created_at' },
            { label: 'Top rated', to: '/products?ordering=-average_rating' },
          ]}
        />
        <FooterColumn
          title="Account"
          links={[
            { label: 'My orders', to: '/account/orders' },
            { label: 'Wishlist', to: '/account/wishlist' },
            { label: 'Addresses', to: '/account/addresses' },
          ]}
        />
        <FooterColumn
          title="Support"
          links={[
            { label: 'Contact us', to: '/' },
            { label: 'Shipping info', to: '/' },
            { label: 'Returns', to: '/' },
          ]}
        />
      </div>

      <div className="border-t border-gray-100 py-6">
        <p className="container-page text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="text-sm text-gray-500 hover:text-brand-600">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
