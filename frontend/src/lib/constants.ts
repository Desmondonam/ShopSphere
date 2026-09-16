export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')
export const SITE_NAME = import.meta.env.VITE_SITE_NAME ?? 'ShopSphere'

export const STORAGE_KEYS = {
  accessToken: 'shopsphere_access_token',
  refreshToken: 'shopsphere_refresh_token',
  user: 'shopsphere_user',
  cart: 'shopsphere_cart',
  wishlist: 'shopsphere_wishlist',
} as const

export const CURRENCY = {
  code: 'USD',
  locale: 'en-US',
} as const

export const FREE_SHIPPING_THRESHOLD = 100
export const STANDARD_SHIPPING_FEE = 7.99

export const PRODUCT_SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-average_rating', label: 'Top Rated' },
] as const

export type ProductSortValue = (typeof PRODUCT_SORT_OPTIONS)[number]['value']
