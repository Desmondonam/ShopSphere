import { useState } from 'react'
import { Banknote, CreditCard, MapPin, Plus, Smartphone } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useCreateAddressMutation, useGetAddressesQuery } from '@/api/addressesApi'
import { useCreateOrderMutation } from '@/api/ordersApi'
import { AddressForm } from '@/components/account/AddressForm'
import { Button } from '@/components/ui/Button'
import { clearCart, selectCartItems, selectCartSubtotal } from '@/features/cart/cartSlice'
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import type { ApiError, PaymentMethod } from '@/types'

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof CreditCard; description: string }[] = [
  { value: 'card', label: 'Credit / debit card', icon: CreditCard, description: 'Pay securely with your card' },
  { value: 'mpesa', label: 'M-Pesa', icon: Smartphone, description: 'Pay via mobile money' },
  { value: 'cash_on_delivery', label: 'Cash on delivery', icon: Banknote, description: 'Pay when your order arrives' },
]

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const items = useAppSelector(selectCartItems)
  const subtotal = useAppSelector(selectCartSubtotal)

  const { data: addresses, isLoading: addressesLoading } = useGetAddressesQuery()
  const [createAddress, { isLoading: creatingAddress }] = useCreateAddressMutation()
  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation()

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [error, setError] = useState<string | null>(null)

  const effectiveAddressId = selectedAddressId ?? addresses?.find((a) => a.is_default)?.id ?? addresses?.[0]?.id ?? null
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
  const total = subtotal + shipping

  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  async function handlePlaceOrder() {
    setError(null)
    if (!effectiveAddressId) {
      setError('Please select or add a shipping address.')
      return
    }

    try {
      const order = await createOrder({
        items: items.map((item) => ({ product: item.productId, quantity: item.quantity })),
        shipping_address_id: effectiveAddressId,
        payment_method: paymentMethod,
      }).unwrap()

      dispatch(clearCart())
      navigate(`/order-success/${order.id}`, { replace: true })
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.data?.detail ?? 'Could not place your order. Please try again.')
    }
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MapPin className="size-4" />
              Shipping address
            </h2>

            {addressesLoading ? (
              <p className="text-sm text-gray-500">Loading addresses…</p>
            ) : (
              <div className="space-y-2">
                {addresses?.map((address) => (
                  <label
                    key={address.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-4',
                      effectiveAddressId === address.id ? 'border-brand-600 ring-1 ring-brand-600' : 'border-gray-200',
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1"
                      checked={effectiveAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                    />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{address.full_name}</p>
                      <p className="text-gray-500">
                        {address.street_address}, {address.city}, {address.state} {address.postal_code},{' '}
                        {address.country}
                      </p>
                    </div>
                  </label>
                ))}

                {!showAddressForm ? (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 p-4 text-sm font-medium text-brand-600 hover:bg-brand-50"
                  >
                    <Plus className="size-4" />
                    Add a new address
                  </button>
                ) : (
                  <div className="rounded-xl border border-gray-200 p-4">
                    <AddressForm
                      isSubmitting={creatingAddress}
                      onCancel={() => setShowAddressForm(false)}
                      onSubmit={async (values) => {
                        const created = await createAddress(values).unwrap()
                        setSelectedAddressId(created.id)
                        setShowAddressForm(false)
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Payment method</h2>
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-4',
                    paymentMethod === option.value ? 'border-brand-600 ring-1 ring-brand-600' : 'border-gray-200',
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                  />
                  <option.icon className="size-5 text-gray-500" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-gray-500">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between text-gray-600">
                <span className="line-clamp-1 pr-2">
                  {item.name} × {item.quantity}
                </span>
                <span className="shrink-0">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="my-3 h-px bg-gray-100" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <div className="my-2 h-px bg-gray-100" />
            <div className="flex justify-between text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <Button className="mt-5 w-full" onClick={() => void handlePlaceOrder()} isLoading={placingOrder}>
            Place order
          </Button>
        </div>
      </div>
    </div>
  )
}
