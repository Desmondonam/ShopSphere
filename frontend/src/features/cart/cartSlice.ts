import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { STORAGE_KEYS } from '@/lib/constants'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
}

function loadInitialState(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.cart)
    return { items: raw ? (JSON.parse(raw) as CartItem[]) : [] }
  } catch {
    return { items: [] }
  }
}

function persist(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items))
}

const initialState: CartState = loadInitialState()

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ item: Omit<CartItem, 'quantity'>; quantity?: number }>) => {
      const { item, quantity = 1 } = action.payload
      const existing = state.items.find((i) => i.productId === item.productId)

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, existing.stock)
      } else {
        state.items.push({ ...item, quantity: Math.min(quantity, item.stock) })
      }
      persist(state.items)
    },
    updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const { productId, quantity } = action.payload
      const item = state.items.find((i) => i.productId === productId)
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock))
      }
      persist(state.items)
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload)
      persist(state.items)
    },
    clearCart: (state) => {
      state.items = []
      persist(state.items)
    },
  },
})

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions
export default cartSlice.reducer

export const selectCartItems = (state: { cart: CartState }) => state.cart.items
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
