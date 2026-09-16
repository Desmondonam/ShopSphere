import { useState } from 'react'
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from '@/api/addressesApi'
import { AddressForm, addressToFormValues } from '@/components/account/AddressForm'
import type { AddressFormValues } from '@/components/account/AddressForm'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { FullPageSpinner } from '@/components/ui/Spinner'
import type { Address } from '@/types'

export default function AddressesPage() {
  const { data: addresses, isLoading } = useGetAddressesQuery()
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation()
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation()
  const [deleteAddress] = useDeleteAddressMutation()

  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  async function handleCreate(values: AddressFormValues) {
    await createAddress(values).unwrap()
    toast.success('Address added')
    setShowForm(false)
  }

  async function handleUpdate(values: AddressFormValues) {
    if (!editingAddress) return
    await updateAddress({ id: editingAddress.id, ...values }).unwrap()
    toast.success('Address updated')
    setEditingAddress(null)
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Remove this address?')) return
    await deleteAddress(id).unwrap()
    toast.success('Address removed')
  }

  async function handleSetDefault(address: Address) {
    await updateAddress({ id: address.id, is_default: true }).unwrap()
  }

  if (isLoading) return <FullPageSpinner />

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Addresses</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
          >
            <Plus className="size-4" />
            Add address
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">New address</h2>
          <AddressForm isSubmitting={isCreating} onCancel={() => setShowForm(false)} onSubmit={handleCreate} />
        </div>
      )}

      {!addresses || addresses.length === 0 ? (
        !showForm && (
          <div className="mt-4">
            <EmptyState icon={<MapPin className="size-10" />} title="No addresses yet" description="Add a shipping address to speed up checkout." />
          </div>
        )
      ) : (
        <div className="mt-4 space-y-3">
          {addresses.map((address) =>
            editingAddress?.id === address.id ? (
              <div key={address.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold text-gray-900">Edit address</h2>
                <AddressForm
                  defaultValues={addressToFormValues(address)}
                  isSubmitting={isUpdating}
                  onCancel={() => setEditingAddress(null)}
                  onSubmit={handleUpdate}
                  submitLabel="Update address"
                />
              </div>
            ) : (
              <div key={address.id} className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{address.full_name}</p>
                    {address.is_default && <Badge tone="brand">Default</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {address.street_address}, {address.city}, {address.state} {address.postal_code}, {address.country}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!address.is_default && (
                    <button
                      onClick={() => void handleSetDefault(address)}
                      title="Set as default"
                      className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand-600"
                    >
                      <Star className="size-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingAddress(address)}
                    title="Edit"
                    className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => void handleDelete(address.id)}
                    title="Delete"
                    className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}
