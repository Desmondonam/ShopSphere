import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { z } from 'zod'

import { useAppDispatch } from '@/app/hooks'
import { authApi, useRegisterMutation } from '@/api/authApi'
import { setCredentials } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { ApiError } from '@/types'

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [registerUser, { isLoading }] = useRegisterMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: RegisterValues) {
    setServerError(null)
    try {
      const { access, refresh } = await registerUser({
        email: values.email,
        username: values.username,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
      }).unwrap()
      dispatch(setCredentials({ user: null, accessToken: access, refreshToken: refresh }))
      const user = await dispatch(authApi.endpoints.getCurrentUser.initiate()).unwrap()
      dispatch(setCredentials({ user, accessToken: access, refreshToken: refresh }))
      navigate('/', { replace: true })
    } catch (err) {
      const apiError = err as ApiError
      setServerError(apiError.data?.detail ?? 'Could not create your account. Please check your details.')
    }
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <ShoppingBag className="size-8 text-brand-600" />
          <h1 className="mt-3 text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Join ShopSphere and start shopping</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" error={errors.first_name?.message} {...register('first_name')} />
            <Input label="Last name" error={errors.last_name?.message} {...register('last_name')} />
          </div>
          <Input label="Username" error={errors.username?.message} {...register('username')} />
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
