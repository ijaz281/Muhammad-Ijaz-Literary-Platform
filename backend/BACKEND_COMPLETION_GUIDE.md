# Backend completion handoff

This patch completes the API layer around the existing Django models. Existing model
definitions and migration files are intentionally preserved. No database file or
real `.env` file is included in this patch.

## Apply safely

1. Stop the Django development server.
2. Make a backup copy of your current `backend` folder and `db.sqlite3`.
3. Extract this patch into the project root (the folder that contains `manage.py`),
   allowing the included `backend/...` paths to overwrite only the listed files.
4. Keep your existing `.env` file. Do not replace it with `.env.example`.
5. Activate your existing virtual environment and install `requirements.txt`.
6. Run `python manage.py check`, then `python manage.py migrate`, then
   `python manage.py runserver`.

No model fields or database schema were changed by this patch. `migrate` is included
as a safe check/apply step for migrations already present in your project; do not
delete `db.sqlite3`, recreate migrations, or run `flush`.

## Implemented endpoints

All routes are rooted at `/api/`.

### Authentication
- `POST /api/auth/register/` — create an account (`username`, `email`, `password`,
  `password_confirm`, optional first/last name).
- `POST /api/auth/token/` — obtain JWT using Django's username/password fields.
- `POST /api/auth/token/refresh/` — refresh a token.
- `GET/PATCH /api/auth/me/` — authenticated account details/update.

For protected endpoints send `Authorization: Bearer <access-token>`.

### Literature and author profiles
- `GET /api/literature/publications/`
- `GET /api/literature/publications/<slug>/`
- Supports `search`, `category`, `language`, `featured`, `ordering`, `page`, `page_size`.
- `GET /api/authors/` and `GET /api/authors/<id>/`

Only published literature and active author profiles are public.

### Bookstore
- `GET /api/books/`, `GET /api/books/<slug>/`
- `GET /api/categories/`, `GET /api/categories/<slug>/`
- Book query parameters: `search`, `category` (category slug), `language`,
  `format`, `featured=true`, `in_stock=true`, `ordering`, `page`, `page_size`.

The public bookstore endpoints are read-only. Manage catalogue entries, pricing,
stock and categories through Django Admin.

### Reader engagement
- `POST/DELETE /api/publications/<slug>/like/`
- `POST/DELETE /api/publications/<slug>/bookmark/`
- `GET /api/bookmarks/`
- `GET/POST /api/publications/<publication_id>/comments/`

Likes, bookmarks and comment creation require authentication. New comments remain
pending moderation until approved in Django Admin.

### Store, checkout and orders
- `GET/POST /api/store/addresses/`
- `GET/PUT/PATCH/DELETE /api/store/addresses/<id>/`
- `GET/POST /api/store/cart/` — POST body: `{"book_id": 1, "quantity": 1}`
- `PATCH/DELETE /api/store/cart/items/<item_id>/`
- `POST /api/store/checkout/`
- `GET /api/store/orders/`
- `GET /api/store/orders/<order-uuid>/`
- `POST /api/store/orders/<order-uuid>/cancel/`

Checkout accepts either `shipping_address_id`, or `full_name`, `phone`,
`address_line_1`, `city` and optional address fields. Shipping charges are controlled
by the server through `LITERARY_SHIPPING_FEE`, not by the browser. Stock is checked
and reserved transactionally when an order is placed. Only unpaid pending orders
can be cancelled through the customer API.

### Payments and refunds
- `POST /api/payments/create/` — body: `{"order_number": "<order-uuid>"}`
- `GET /api/payments/my/`
- `POST /api/payments/refunds/` — body: `{"payment": 1, "amount": "100.00", "reason": "..."}`
- `GET /api/payments/refunds/my/`

**Payment gateway limitation:** this backend creates and tracks pending payment
records, but does not yet perform a live JazzCash charge or verify a JazzCash
callback. Real-money payment activation requires merchant credentials, the current
JazzCash integration specification, signed request/response verification, and
sandbox testing. Do not represent a pending payment as paid. Admin payment status
updates synchronize the related order status.

Refund requests are recorded for staff review; they are not automatically sent to
a payment gateway.

### Contact, newsletter and analytics
- `POST /api/contact/` — `name`, `email`, `subject`, `message`
- `POST /api/newsletter/subscribe/` — `email`
- `POST /api/newsletter/unsubscribe/` — `email`
- `GET /api/analytics/dashboard/` — staff/superuser only.

## Django Admin

Visit `/admin/`. Create an administrator with:

```powershell
python manage.py createsuperuser
```

Use Admin to publish literature, manage authors/books/stock, approve comments,
review messages/subscribers, manage orders, and review payment/refund records.

## Final verification

```powershell
python manage.py check
python manage.py showmigrations
python manage.py migrate
python manage.py test
python manage.py runserver
```

This patch was syntax-compiled, but a live Django check/test run must be performed
inside your Windows virtual environment because the uploaded archive's local
environment is not portable to this execution environment.
