import { useState } from 'react'
import { ImageOff } from 'lucide-react'

import { cn, resolveMediaUrl } from '@/lib/utils'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
  className?: string
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [errored, setErrored] = useState(false)
  const resolved = resolveMediaUrl(src)

  if (!resolved || errored) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 text-gray-300', className)}>
        <ImageOff className="size-8" />
      </div>
    )
  }

  return (
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
