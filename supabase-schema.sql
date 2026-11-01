create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text not null default '' check (char_length(phone) <= 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_ngn integer not null check (price_ngn > 0),
  image_path text not null default '',
  is_active boolean not null default true,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete restrict,
  quantity integer not null check (quantity between 1 and 20),
  created_at timestamptz not null default now(),
  unique (cart_id, menu_item_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending'
    check (status in (
      'pending', 'confirmed', 'preparing', 'ready',
      'out_for_delivery', 'delivered', 'cancelled'
    )),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  subtotal_ngn integer not null check (subtotal_ngn >= 0),
  delivery_fee_ngn integer not null default 0 check (delivery_fee_ngn >= 0),
  total_ngn integer not null check (total_ngn >= 0),
  delivery_address text not null,
  phone text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  unit_price_ngn integer not null check (unit_price_ngn >= 0),
  quantity integer not null check (quantity between 1 and 20),
  line_total_ngn integer not null check (line_total_ngn >= 0)
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 1 and 120),
  email text not null check (char_length(trim(email)) between 3 and 254),
  message text not null check (char_length(trim(message)) between 5 and 5000),
  created_at timestamptz not null default now()
);

create index if not exists menu_items_active_idx
  on public.menu_items (is_active, is_available, created_at);
create index if not exists cart_items_cart_id_idx
  on public.cart_items (cart_id);
create index if not exists orders_user_created_idx
  on public.orders (user_id, created_at desc);
create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();
revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can view active categories" on public.menu_categories;
create policy "Anyone can view active categories"
on public.menu_categories for select
to anon, authenticated
using (is_active);

drop policy if exists "Anyone can view active menu items" on public.menu_items;
create policy "Anyone can view active menu items"
on public.menu_items for select
to anon, authenticated
using (is_active and is_available);

drop policy if exists "Users can view their profile" on public.profiles;
create policy "Users can view their profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can manage their cart" on public.carts;
create policy "Users can manage their cart"
on public.carts for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage items in their cart" on public.cart_items;
create policy "Users can manage items in their cart"
on public.cart_items for all
to authenticated
using (
  exists (
    select 1
    from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can view their orders" on public.orders;
create policy "Users can view their orders"
on public.orders for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can view items in their orders" on public.order_items;
create policy "Users can view items in their orders"
on public.order_items for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = (select auth.uid())
  )
);

drop policy if exists "Visitors can submit contact messages" on public.contact_messages;
create policy "Visitors can submit contact messages"
on public.contact_messages for insert
to anon, authenticated
with check (
  char_length(trim(full_name)) between 1 and 120
  and char_length(trim(email)) between 3 and 254
  and char_length(trim(message)) between 5 and 5000
);

revoke all on public.profiles, public.menu_categories, public.menu_items,
  public.carts, public.cart_items, public.orders, public.order_items,
  public.contact_messages from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.menu_categories, public.menu_items to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.carts, public.cart_items to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant insert on public.contact_messages to anon, authenticated;

create or replace function public.place_order(
  p_delivery_address text,
  p_phone text,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_cart_count integer;
  v_available_count integer;
  v_subtotal integer;
  v_order_id uuid;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to place an order.';
  end if;

  if length(trim(coalesce(p_delivery_address, ''))) < 5
    or length(trim(coalesce(p_delivery_address, ''))) > 500 then
    raise exception 'Please provide a valid delivery address.';
  end if;

  if length(trim(coalesce(p_phone, ''))) < 5
    or length(trim(coalesce(p_phone, ''))) > 32 then
    raise exception 'Please provide a valid phone number.';
  end if;

  if length(trim(coalesce(p_notes, ''))) > 500 then
    raise exception 'Order notes must be 500 characters or fewer.';
  end if;

  select carts.id
  into v_cart_id
  from public.carts
  where carts.user_id = v_user_id
  for update;

  if v_cart_id is null then
    raise exception 'Your cart is empty.';
  end if;

  select count(*)
  into v_cart_count
  from public.cart_items
  where cart_items.cart_id = v_cart_id;

  if v_cart_count = 0 then
    raise exception 'Your cart is empty.';
  end if;

  select count(*), coalesce(sum(menu_items.price_ngn * cart_items.quantity), 0)
  into v_available_count, v_subtotal
  from public.cart_items
  join public.menu_items on menu_items.id = cart_items.menu_item_id
  where cart_items.cart_id = v_cart_id
    and menu_items.is_active
    and menu_items.is_available;

  if v_available_count <> v_cart_count then
    raise exception 'One or more items in your cart are no longer available.';
  end if;

  insert into public.orders (
    user_id, subtotal_ngn, delivery_fee_ngn, total_ngn,
    delivery_address, phone, notes
  )
  values (
    v_user_id, v_subtotal, 0, v_subtotal,
    trim(p_delivery_address), trim(p_phone), nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id, menu_item_id, item_name, unit_price_ngn, quantity, line_total_ngn
  )
  select
    v_order_id,
    menu_items.id,
    menu_items.name,
    menu_items.price_ngn,
    cart_items.quantity,
    menu_items.price_ngn * cart_items.quantity
  from public.cart_items
  join public.menu_items on menu_items.id = cart_items.menu_item_id
  where cart_items.cart_id = v_cart_id
    and menu_items.is_active
    and menu_items.is_available;

  delete from public.cart_items
  where cart_items.cart_id = v_cart_id;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(text, text, text) from public, anon, authenticated;
grant execute on function public.place_order(text, text, text) to authenticated;

insert into public.menu_categories (name, slug, sort_order)
values
  ('Chicken', 'chicken', 1),
  ('Burgers and wraps', 'burgers-and-wraps', 2),
  ('Sides', 'sides', 3)
on conflict (slug) do nothing;

insert into public.menu_items (
  category_id, name, slug, description, price_ngn, image_path
)
values
  ((select id from public.menu_categories where slug = 'chicken'),
   'Golden Tenders Box', 'golden-tenders-box',
   'With house honey-mustard', 2000,
   'images/WhatsApp Image 2026-10-28 at 1.30.37 PM (1).jpeg'),
  ((select id from public.menu_categories where slug = 'chicken'),
   'Crispy Broast Bucket', 'crispy-broast-bucket',
   'Garlic dip, butter buns and fries', 3000,
   'images/WhatsApp Image 2026-10-28 at 1.30.47 PM.jpeg'),
  ((select id from public.menu_categories where slug = 'burgers-and-wraps'),
   'Spicy Zinger Stack', 'spicy-zinger-stack',
   'Double crispy fillet with slaw', 2500,
   'images/WhatsApp Image 2026-10-28 at 1.30.36 PM.jpeg'),
  ((select id from public.menu_categories where slug = 'chicken'),
   'Spicy Popcorn Bites', 'spicy-popcorn-bites',
   'Cajun seasoning and dip', 1000,
   'images/WhatsApp Image 2026-10-28 at 1.30.49 PM.jpeg'),
  ((select id from public.menu_categories where slug = 'burgers-and-wraps'),
   'Crispy Twister Roll', 'crispy-twister-roll',
   'Tortilla, sauce, slaw and crunchy bites', 2000,
   'images/WhatsApp Image 2026-10-28 at 1.30.44 PM.jpeg'),
  ((select id from public.menu_categories where slug = 'sides'),
   'Loaded Fries Combo', 'loaded-fries-combo',
   'Cajun fries, soda and dip', 1000,
   'images/WhatsApp Image 2026-10-28 at 1.30.37 PM (1).jpeg')
on conflict (slug) do nothing;
