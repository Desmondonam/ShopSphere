import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { STORAGE_KEYS } from '@/lib/constants'
import type { WishlistItem } from '@/types'

interface WishlistState {
  items: WishlistItem[]
}

function loadInitialState(): WishlistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.wishlist)
    return { items: raw ? (JSON.parse(raw) as WishlistItem[]) : [] }
  } catch {
    return { items: [] }
  }
}

function persist(items: WishlistItem[]) {
  localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(items))
}

const initialState: WishlistState = loadInitialState()

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlistItem: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.some((i) => i.productId === action.payload.productId)
      state.items = exists
        ? state.items.filter((i) => i.productId !== action.payload.productId)
        : [...state.items, action.payload]
      persist(state.items)
    },
    removeFromWishlist: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload)
      persist(state.items)
    },
    clearWishlist: (state) => {
      state.items = []
      persist(state.items)
    },
  },
})

export const { toggleWishlistItem, removeFromWishlist, clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer

export const selectWishlistItems = (state: { wishlist: WishlistState }) => state.wishlist.items
export const selectIsWishlisted = (productId: number) => (state: { wishlist: WishlistState }) =>
  state.wishlist.items.some((i) => i.productId === productId)
