# ShopSphere API contract

The frontend is built against this REST contract. The Django backend does not implement any of
these endpoints yet (only the `Category`, `Product`, `ProductImage`, `Review`, `User` and
`Address` models exist, plus an empty `orders` / `payments` app) — this document is the spec for
building the matching serializers/views/urls with DRF + SimpleJWT.

Base URL: `VITE_API_BASE_URL` (defaults to `http://localhost:8000/api`).

All list endpoints use DRF's `PageNumberPagination` (`?page=`) and return:

```json
{ "count": 0, "next": null, "previous": null, "results": [] }
```

## Auth (`rest_framework_simplejwt`)

| Method | Path                    | Auth | Body                                                                 | Response                          |
| ------ | ----------------------- | ---- | --------------------------------------------------------------------- | ---------------------------------- |
| POST   | `/auth/token/`          | –    | `{ email, password }`                                                | `{ access, refresh }`             |
| POST   | `/auth/token/refresh/`  | –    | `{ refresh }`                                                        | `{ access }`                      |
| POST   | `/auth/register/`       | –    | `{ email, username, password, first_name, last_name }`              | `{ access, refresh }`             |
| GET    | `/auth/me/`             | JWT  | –                                                                     | `User`                            |
| PATCH  | `/auth/me/`             | JWT  | `{ first_name?, last_name?, phone_number? }`                         | `User`                            |

`User`: `{ id, email, username, first_name, last_name, phone_number, is_seller }`

Login uses `email` as the SimpleJWT username field (`USERNAME_FIELD = "email"` is already set on
the custom user model), so no further backend changes are needed there beyond wiring
`TokenObtainPairView` at `/auth/token/`.

## Categories

| Method | Path                     | Auth | Response          |
| ------ | ------------------------ | ---- | ------------------ |
| GET    | `/categories/`           | –    | `Category[]` (not paginated — small list) |
| GET    | `/categories/:slug/`     | –    | `Category`         |

`Category`: `{ id, name, slug, parent, image, subcategories? }`

## Products

| Method | Path                         | Auth | Query params                                                              | Response                      |
| ------ | ---------------------------- | ---- | --------------------------------------------------------------------------- | ------------------------------ |
| GET    | `/products/`                 | –    | `search`, `category` (slug), `min_price`, `max_price`, `ordering`, `page` | `Paginated<ProductListItem>`  |
| GET    | `/products/:slug/`           | –    | –                                                                            | `Product`                     |
| GET    | `/products/:slug/related/`   | –    | –                                                                            | `ProductListItem[]`           |

`ordering` accepts: `price`, `-price`, `-created_at`, `-average_rating`.

`ProductListItem`: `{ id, name, slug, price, discount, current_price, stock, average_rating, review_count, is_active, category: { id, name, slug } | null, primary_image: string | null }`

`Product`: same as above plus `description`, `sku`, `images: ProductImage[]`, `created_at`, `updated_at`.

`ProductImage`: `{ id, image, alt_text, is_primary }`

Both `average_rating` and `review_count` should be annotated on the queryset (e.g. via
`Avg("reviews__rating")` / `Count("reviews")`), matching the `average_rating` property already on
the `Product` model.

## Reviews

| Method | Path              | Auth | Body                              | Response          |
| ------ | ----------------- | ---- | ---------------------------------- | ------------------ |
| GET    | `/reviews/?product=<id>&page=` | – | –                       | `Paginated<Review>` |
| POST   | `/reviews/`       | JWT  | `{ product, rating, comment }`     | `Review`           |
| PATCH  | `/reviews/:id/`   | JWT (owner) | `{ rating?, comment? }`     | `Review`           |
| DELETE | `/reviews/:id/`   | JWT (owner) | –                            | `204`               |

`Review`: `{ id, product, user: { id, first_name, last_name, email }, rating, comment, created_at }`

The `Review` model already enforces one review per user per product via `unique_together`; a
duplicate `POST` should return `400`.

## Addresses

| Method | Path                | Auth | Body                                                                                   | Response     |
| ------ | ------------------- | ---- | ----------------------------------------------------------------------------------------- | ------------- |
| GET    | `/addresses/`       | JWT  | –                                                                                          | `Address[]` (current user's only) |
| POST   | `/addresses/`       | JWT  | `{ full_name, street_address, city, state, postal_code, country, is_default }`           | `Address`     |
| PATCH  | `/addresses/:id/`   | JWT (owner) | Partial of the above                                                                | `Address`     |
| DELETE | `/addresses/:id/`   | JWT (owner) | –                                                                                    | `204`         |

Setting `is_default: true` on one address should unset it on the user's other addresses.

## Orders (new `orders` app — models still need to be written)

Suggested models: `Order` (user, order_number, status, payment_method, is_paid, subtotal,
shipping_fee, total, shipping_address FK, created_at) and `OrderItem` (order, product, quantity,
unit_price).

| Method | Path                   | Auth | Body                                                                                   | Response            |
| ------ | ---------------------- | ---- | ----------------------------------------------------------------------------------------- | --------------------- |
| GET    | `/orders/`             | JWT  | –                                                                                          | `Paginated<Order>` (current user's only) |
| GET    | `/orders/:id/`         | JWT (owner) | –                                                                                    | `Order`              |
| POST   | `/orders/`             | JWT  | `{ items: [{ product, quantity }], shipping_address_id, payment_method }`                | `Order`               |
| POST   | `/orders/:id/cancel/`  | JWT (owner) | –                                                                                    | `Order`               |

`payment_method` is one of `card`, `mpesa`, `cash_on_delivery`. `status` is one of `pending`,
`processing`, `shipped`, `delivered`, `cancelled`.

Order creation should be transactional: validate stock, decrement it, snapshot `unit_price` from
the product's `current_price` at the time of purchase, and compute `subtotal`/`shipping_fee`/`total`
server-side (don't trust client-submitted prices).

`Order`: `{ id, order_number, status, payment_method, is_paid, items: OrderItem[], shipping_address: Address, subtotal, shipping_fee, total, created_at }`

`OrderItem`: `{ id, product: { id, name, slug, primary_image }, quantity, unit_price, subtotal }`

## Auth error shape

All errors are expected as DRF's default: `{ "detail": "..." }` for generic errors, or
`{ "field_name": ["message"] }` for validation errors. The frontend reads `error.data.detail`
first and falls back to a generic message.

## CORS / media

`CORS_ALLOWED_ORIGINS` in `backend/.env` must include the Vite dev origin (`http://localhost:5173`
by default). Image fields are served from `MEDIA_URL`/`MEDIA_ROOT`; the frontend resolves relative
media paths against `VITE_API_BASE_URL` with `/api` stripped (see `resolveMediaUrl` in
`src/lib/utils.ts`), so serializers can return either relative (`/media/...`) or absolute URLs.
