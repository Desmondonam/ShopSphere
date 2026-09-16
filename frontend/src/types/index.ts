// ---------------------------------------------------------------------------
// Core domain types. These mirror the Django REST Framework serializers the
// backend is expected to expose (see frontend/API_CONTRACT.md). Keep these in
// sync with the backend serializers as they're implemented.
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Category {
  id: number
  name: string
  slug: string
  parent: number | null
  image: string | null
  subcategories?: Category[]
}

export interface ProductImage {
  id: number
  image: string
  alt_text: string
  is_primary: boolean
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  sku: string
  price: string
  discount: string | null
  current_price: string
  stock: number
  category: Category | null
  images: ProductImage[]
  average_rating: number | null
  review_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductListItem
  extends Pick<
    Product,
    | 'id'
    | 'name'
    | 'slug'
    | 'price'
    | 'discount'
    | 'current_price'
    | 'stock'
    | 'average_rating'
    | 'review_count'
    | 'is_active'
  > {
  category: Pick<Category, 'id' | 'name' | 'slug'> | null
  primary_image: string | null
}

export interface Review {
  id: number
  product: number
  user: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>
  rating: number
  comment: string
  created_at: string
}

export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  phone_number: string
  is_seller: boolean
}

export interface Address {
  id: number
  full_name: string
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'card' | 'cash_on_delivery' | 'mpesa'

export interface OrderItem {
  id: number
  product: Pick<Product, 'id' | 'name' | 'slug'> & { primary_image: string | null }
  quantity: number
  unit_price: string
  subtotal: string
}

export interface Order {
  id: number
  order_number: string
  status: OrderStatus
  payment_method: PaymentMethod
  is_paid: boolean
  items: OrderItem[]
  shipping_address: Address
  subtotal: string
  shipping_fee: string
  total: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Client-side only types (not persisted on the backend yet)
// ---------------------------------------------------------------------------

export interface CartItem {
  productId: number
  slug: string
  name: string
  image: string | null
  price: number
  stock: number
  quantity: number
}

export interface WishlistItem {
  productId: number
  slug: string
  name: string
  image: string | null
  price: number
  addedAt: string
}

export interface ApiError {
  status: number
  data: {
    detail?: string
    [field: string]: unknown
  }
}
