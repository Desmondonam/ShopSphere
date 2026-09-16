import { useState } from 'react'
import type { ReactNode } from 'react'
import { Heart, LogOut, Menu, Package, MapPin, ShoppingBag, User, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useGetCategoriesQuery } from '@/api/categoriesApi'
import { logout } from '@/features/auth/authSlice'
import { selectCartCount } from '@/features/cart/cartSlice'
import { selectWishlistItems } from '@/features/wishlist/wishlistSlice'
import { SearchBar } from '@/components/layout/SearchBar'
import { SITE_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn('text-sm font-medium transition-colors hover:text-brand-600', isActive ? 'text-brand-600' : 'text-gray-600')

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const user = useAppSelector((state) => state.auth.user)
  const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken)
  const cartCount = useAppSelector(selectCartCount)
  const wishlistCount = useAppSelector(selectWishlistItems).length
  const { data: categories } = useGetCategoriesQuery()

  function handleLogout() {
    dispatch(logout())
    setAccountOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <button
          className="-ml-2 flex size-10 items-center justify-center rounded-lg text-gray-600 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-1.5 text-xl font-bold text-gray-900">
          <ShoppingBag className="size-6 text-brand-600" />
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <NavLink to="/products" className={navLinkClass} end>
            Shop
          </NavLink>
          {categories?.slice(0, 4).map((category) => (
            <NavLink key={category.id} to={`/products?category=${category.slug}`} className={navLinkClass}>
              {category.name}
            </NavLink>
          ))}
        </nav>

        <div className="hidden flex-1 md:block">
          <SearchBar className="mx-auto max-w-md" />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/account/wishlist"
            className="relative flex size-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Wishlist"
          >
            <Heart className="size-5" />
            {wishlistCount > 0 && (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative flex size-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Cart"
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              className="flex size-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setAccountOpen((v) => !v)}
              aria-label="Account menu"
            >
              <User className="size-5" />
            </button>

            {accountOpen && (
              <>
                <button
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setAccountOpen(false)}
                  aria-label="Close menu"
                  tabIndex={-1}
                />
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 text-sm">
                        <p className="font-medium text-gray-900">
                          {user?.first_name || user?.email || 'Account'}
                        </p>
                        <p className="truncate text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="my-1 h-px bg-gray-100" />
                      <MenuLink to="/account/orders" icon={<Package className="size-4" />} onClick={() => setAccountOpen(false)}>
                        Orders
                      </MenuLink>
                      <MenuLink to="/account/addresses" icon={<MapPin className="size-4" />} onClick={() => setAccountOpen(false)}>
                        Addresses
                      </MenuLink>
                      <MenuLink to="/account/wishlist" icon={<Heart className="size-4" />} onClick={() => setAccountOpen(false)}>
                        Wishlist
                      </MenuLink>
                      <MenuLink to="/account/profile" icon={<User className="size-4" />} onClick={() => setAccountOpen(false)}>
                        Profile
                      </MenuLink>
                      <div className="my-1 h-px bg-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <div className="space-y-1 p-1">
                      <Link
                        to="/login"
                        onClick={() => setAccountOpen(false)}
                        className="block rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setAccountOpen(false)}
                        className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Create account
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 p-3 md:hidden">
        <SearchBar />
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            <MobileLink to="/products" onClick={() => setMobileOpen(false)}>
              Shop all
            </MobileLink>
            {categories?.map((category) => (
              <MobileLink key={category.id} to={`/products?category=${category.slug}`} onClick={() => setMobileOpen(false)}>
                {category.name}
              </MobileLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

function MenuLink({
  to,
  icon,
  children,
  onClick,
}: {
  to: string
  icon: ReactNode
  children: ReactNode
  onClick: () => void
}) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
      {icon}
      {children}
    </Link>
  )
}

function MobileLink({ to, children, onClick }: { to: string; children: ReactNode; onClick: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn('rounded-lg px-3 py-2.5 text-sm font-medium', isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50')
      }
    >
      {children}
    </NavLink>
  )
}
