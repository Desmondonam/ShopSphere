import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Address } from '@/types'

const addressSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  street_address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State / region is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  is_default: z.boolean(),
})

export type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>
  onSubmit: (values: AddressFormValues) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function AddressForm({ defaultValues, onSubmit, onCancel, isSubmitting, submitLabel = 'Save address' }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: '',
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full name" error={errors.full_name?.message} {...register('full_name')} />
      <Input label="Street address" error={errors.street_address?.message} {...register('street_address')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" error={errors.city?.message} {...register('city')} />
        <Input label="State / region" error={errors.state?.message} {...register('state')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Postal code" error={errors.postal_code?.message} {...register('postal_code')} />
        <Input label="Country" error={errors.country?.message} {...register('country')} />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" className="size-4 rounded border-gray-300 text-brand-600" {...register('is_default')} />
        Set as default address
      </label>

      <div className="flex gap-2 pt-1">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export function addressToFormValues(address: Address): AddressFormValues {
  return {
    full_name: address.full_name,
    street_address: address.street_address,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country,
    is_default: address.is_default,
  }
}
