import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { useCreateReviewMutation } from '@/api/reviewsApi'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { RatingInput } from '@/components/ui/Rating'
import type { ApiError } from '@/types'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().max(1000, 'Keep it under 1000 characters').optional(),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

export function ReviewForm({ productId, onSuccess }: { productId: number; onSuccess?: () => void }) {
  const [createReview, { isLoading }] = useCreateReviewMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })

  async function onSubmit(values: ReviewFormValues) {
    setServerError(null)
    try {
      await createReview({ product: productId, rating: values.rating, comment: values.comment ?? '' }).unwrap()
      toast.success('Thanks for your review!')
      reset({ rating: 0, comment: '' })
      onSuccess?.()
    } catch (err) {
      const apiError = err as ApiError
      setServerError(apiError.data?.detail ?? 'Could not submit your review. You may have already reviewed this product.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900">Write a review</h3>

      <div className="mt-3">
        <Controller
          control={control}
          name="rating"
          render={({ field }) => <RatingInput value={field.value} onChange={field.onChange} />}
        />
        {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>}
      </div>

      <Textarea
        {...register('comment')}
        placeholder="Share your thoughts about this product…"
        rows={3}
        className="mt-3"
        error={errors.comment?.message}
      />

      {serverError && <p className="mt-2 text-xs text-red-600">{serverError}</p>}

      <Button type="submit" size="sm" className="mt-3" isLoading={isLoading}>
        Submit review
      </Button>
    </form>
  )
}
