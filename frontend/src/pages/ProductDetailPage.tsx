import { useState } from 'react'
import { Heart, PackageSearch, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useGetProductQuery, useGetRelatedProductsQuery } from '@/api/productsApi'
import { useGetProductReviewsQuery } from '@/api/reviewsApi'
import { addToCart } from '@/features/cart/cartSlice'
import { selectIsWishlisted, toggleWishlistItem } from '@/features/wishlist/wishlistSlice'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ReviewForm } from '@/components/product/ReviewForm'
import { ReviewItem } from '@/components/product/ReviewItem'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductImage } from '@/components/ui/ProductImage'
import { QuantityInput } from '@/components/ui/QuantityInput'
import { Rating } from '@/components/ui/Rating'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { cn, discountPercent, formatCurrency, hasDiscount } from '@/lib/utils'

export default function ProductDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const dispatch = useAppDispatch()
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  const { data: product, isLoading, isError } = useGetProductQuery(slug)
  const { data: related } = useGetRelatedProductsQuery(slug, { skip: !product })
  const { data: reviewsData } = useGetProductReviewsQuery({ productId: product?.id ?? 0 }, { skip: !product })
  const isWishlisted = useAppSelector(selectIsWishlisted(product?.id ?? -1))
  const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken)

  if (isLoading) return <FullPageSpinner />

  if (isError || !product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<PackageSearch className="size-10" />}
          title="Product not found"
          description="This product may have been removed or is temporarily unavailable."
          action={
            <Link to="/products" className="text-sm font-medium text-brand-600 hover:underline">
              Back to shop
            </Link>
          }
        />
      </div>
    )
  }

  const onSale = hasDiscount(product.price, product.current_price)
  const outOfStock = product.stock <= 0
  const images = product.images.length > 0 ? product.images : [{ id: 0, image: '', alt_text: product.name, is_primary: true }]

  function handleAddToCart() {
    if (!product) return
    dispatch(
      addToCart({
        item: {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: images[activeImage]?.image ?? null,
          price: Number.parseFloat(product.current_price),
          stock: product.stock,
        },
        quantity,
      }),
    )
    toast.success(`${product.name} added to cart`)
  }

  function handleToggleWishlist() {
    if (!product) return
    dispatch(
      toggleWishlistItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: images[0]?.image ?? null,
        price: Number.parseFloat(product.current_price),
        addedAt: new Date().toISOString(),
      }),
    )
  }

  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { label: 'Shop', to: '/products' },
          ...(product.category ? [{ label: product.category.name, to: `/products?category=${product.category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50">
            <ProductImage src={images[activeImage]?.image} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'size-16 overflow-hidden rounded-lg border-2',
                    activeImage === i ? 'border-brand-600' : 'border-transparent',
                  )}
                >
                  <ProductImage src={img.image} alt={img.alt_text || product.name} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && <p className="text-sm text-gray-400">{product.category.name}</p>}
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">{product.name}</h1>

          <div className="mt-3">
            <Rating value={product.average_rating} count={product.review_count} size="md" />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.current_price)}</span>
            {onSale && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
                <Badge tone="red">-{discountPercent(product.price, product.current_price)}%</Badge>
              </>
            )}
          </div>

          <div className="mt-4">
            {outOfStock ? (
              <Badge tone="red">Out of stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge tone="amber">Only {product.stock} left in stock</Badge>
            ) : (
              <Badge tone="green">In stock</Badge>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-gray-600">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <QuantityInput value={quantity} max={Math.max(1, product.stock)} onChange={setQuantity} />
            <Button onClick={handleAddToCart} disabled={outOfStock} className="flex-1">
              <ShoppingCart className="size-4" />
              {outOfStock ? 'Out of stock' : 'Add to cart'}
            </Button>
            <Button variant="outline" onClick={handleToggleWishlist} aria-label="Toggle wishlist">
              <Heart className={cn('size-4', isWishlisted && 'fill-red-500 text-red-500')} />
            </Button>
          </div>

          <div className="mt-6 space-y-3 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <Truck className="size-4 text-brand-600" />
              Free shipping on orders over $100
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <ShieldCheck className="size-4 text-brand-600" />
              Secure payment & buyer protection
            </div>
          </div>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="text-lg font-semibold text-gray-900">
          Reviews {product.review_count > 0 && `(${product.review_count})`}
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {reviewsData && reviewsData.results.length > 0 ? (
              <div>
                {reviewsData.results.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product.</p>
            )}
          </div>

          <div>
            {isAuthenticated ? (
              <ReviewForm productId={product.id} />
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                <Link to={`/login?redirect=/products/${product.slug}`} className="font-medium text-brand-600 hover:underline">
                  Sign in
                </Link>{' '}
                to write a review.
              </div>
            )}
          </div>
        </div>
      </section>

      {related && related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">You might also like</h2>
          <ProductGrid products={related} isLoading={false} isError={false} />
        </section>
      )}
    </div>
  )
}
