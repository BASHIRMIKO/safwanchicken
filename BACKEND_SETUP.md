# Supabase backend setup

The site uses Supabase Auth and Postgres for customer accounts, profiles, menu data, carts, orders, and contact messages. Orders use cash on delivery; the checkout function calculates prices from the database and currently sets delivery to ₦0.

## 1. Set Vercel environment variables

In the Vercel project settings, add these variables for the deployments you use:

- `SUPABASE_URL` — the project URL, for example `https://your-project.supabase.co`
- `SUPABASE_ANON_KEY` — the project's anon/publishable key

The `/api/config` Vercel function exposes only those public values to the site. Do not expose `SUPABASE_SERVICE_ROLE_KEY` to browser code or rename it to a `NEXT_PUBLIC_`/`VITE_` variable. The site does not need the service-role key.

## 2. Create the database schema

In Supabase **SQL Editor**, run [`supabase-schema.sql`](./supabase-schema.sql). It creates the tables and row-level security policies, the signup profile trigger, the `place_order` checkout function, and the starter menu. The script can be rerun; it does not overwrite existing menu-item prices or availability.

## 3. Configure customer sign-in

In Supabase **Authentication → Providers**, enable Email sign-in. Set the site's deployed URL in **Authentication → URL Configuration** and add any local development URL you use to the redirect allow list. If email confirmation is enabled, customers must confirm before they can sign in.

## 4. Deploy and verify

Redeploy from Vercel after setting environment variables. Open the deployed site, confirm that the menu loads, create a test account, add an item to the cart, and place a cash-on-delivery test order. Contact-form submissions are stored in `public.contact_messages`.

If testing outside Vercel, the static site cannot serve `/api/config`; use the deployed Vercel site or run the project with a local server that provides the same endpoint.
