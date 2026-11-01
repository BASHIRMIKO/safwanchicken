# Supabase backend setup

The site uses Supabase Auth and Postgres for customer accounts, profiles, menu data, carts, orders, and contact messages. Customers pay online through Paystack; the checkout function calculates prices from the database and currently sets delivery to ₦0. The owner dashboard is available at `/admin.html`.

## 1. Set Vercel environment variables

In the Vercel project settings, add these variables for the deployments you use:

- `SUPABASE_URL` — the project URL, for example `https://your-project.supabase.co`
- `SUPABASE_ANON_KEY` — the project's anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY` — server-only Supabase service role key, used by payment verification; never expose it to browser code
- `PAYSTACK_SECRET_KEY` — server-only Paystack secret key
- `PUBLIC_SITE_URL` — deployed site origin, for example `https://safwanchicken.example`

The `/api/config` Vercel function exposes only the public Supabase URL and anon key to the site. Keep both secret keys server-side; do not expose them to browser code or rename them to `NEXT_PUBLIC_`/`VITE_` variables.

## 2. Create the database schema

In Supabase **SQL Editor**, run [`supabase-schema.sql`](./supabase-schema.sql). It creates the tables and row-level security policies, the signup profile trigger, order/payment functions, and the starter menu. The script can be rerun; it does not overwrite existing menu-item prices or availability.

## 3. Configure customer sign-in

In Supabase **Authentication → Providers**, enable Email sign-in. Set the site's deployed URL in **Authentication → URL Configuration** and add any local development URL you use to the redirect allow list. If email confirmation is enabled, customers must confirm before they can sign in.

## 4. Grant owner access

Sign up for the owner account, then promote that user from Supabase **SQL Editor** (replace the email):

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'owner@example.com';
```

Sign out and back in so the account receives a refreshed token. The dashboard reads `app_metadata`; customers cannot assign themselves this role. Order-reading policies and the accept/reject function enforce the owner role in Postgres as well as in the interface.

## 5. Configure Paystack

In the Paystack dashboard, configure the webhook URL as `https://YOUR_SITE/api/payments/webhook`. The webhook validates Paystack's signature and confirms payment server-side; the payment-return page also performs a server-side verification.

## 6. Deploy and verify

Redeploy from Vercel after setting environment variables. Open the deployed site, confirm that the menu loads, create a test customer account, add an item to the cart, and complete a Paystack test payment. Sign in as the owner at `/admin.html` and accept or reject the paid test order. Contact-form submissions are stored in `public.contact_messages`.

If testing outside Vercel, the static site cannot serve `/api/config`; use the deployed Vercel site or run the project with a local server that provides the same endpoint.
