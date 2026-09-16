import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useGetCurrentUserQuery, useUpdateProfileMutation } from '@/api/authApi'
import { updateUser } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FullPageSpinner } from '@/components/ui/Spinner'
import type { ApiError } from '@/types'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const cachedUser = useAppSelector((state) => state.auth.user)
  const { data: user, isLoading } = useGetCurrentUserQuery()
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: cachedUser?.first_name ?? '',
      last_name: cachedUser?.last_name ?? '',
      phone_number: cachedUser?.phone_number ?? '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({ first_name: user.first_name, last_name: user.last_name, phone_number: user.phone_number })
    }
  }, [user, reset])

  async function onSubmit(values: ProfileValues) {
    setServerError(null)
    try {
      const updated = await updateProfile(values).unwrap()
      dispatch(updateUser(updated))
      toast.success('Profile updated')
    } catch (err) {
      const apiError = err as ApiError
      setServerError(apiError.data?.detail ?? 'Could not update your profile.')
    }
  }

  if (isLoading && !cachedUser) return <FullPageSpinner />

  return (
    <div className="max-w-lg rounded-2xl border border-gray-200 bg-white p-6">
      <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
      <p className="mt-1 text-sm text-gray-500">Update your personal information.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Last name" error={errors.last_name?.message} {...register('last_name')} />
        </div>
        <Input label="Email" value={user?.email ?? cachedUser?.email ?? ''} disabled />
        <Input label="Phone number" error={errors.phone_number?.message} {...register('phone_number')} />

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <Button type="submit" isLoading={isSaving}>
          Save changes
        </Button>
      </form>
    </div>
  )
}
