
create table public.lp_shop (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  shop_phone_number text,
  shop_email text,
  banner_url_1 text,
  banner_url_2 text,
  created_at timestamptz not null default now()
);

create table public.lp_products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.lp_shop(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  rate numeric not null default 0,
  original_price numeric,
  banner_url_1 text,
  banner_url_2 text,
  category text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.lp_offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.lp_products(id) on delete cascade,
  discount_price numeric not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.lp_shop enable row level security;
alter table public.lp_products enable row level security;
alter table public.lp_offers enable row level security;

create policy "Public read shops" on public.lp_shop for select using (true);
create policy "Public read products" on public.lp_products for select using (true);
create policy "Public read offers" on public.lp_offers for select using (true);

create index on public.lp_products(shop_id);
create index on public.lp_offers(product_id);

-- Seed demo shop
with s as (
  insert into public.lp_shop (name, slug, shop_phone_number, shop_email, banner_url_1, banner_url_2)
  values (
    'Rohan Electronics',
    'rohan-electronics',
    '+916380691764',
    'roopesh5roopesh555@gmail.com',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1920&q=80'
  ) returning id
),
p as (
  insert into public.lp_products (shop_id, name, slug, description, rate, original_price, banner_url_1, category, sort_order)
  select s.id, x.name, x.slug, x.description, x.rate, x.original_price, x.banner_url_1, x.category, x.sort_order
  from s, (values
    ('Wireless Noise-Cancel Headphones', 'wnc-headphones', 'Studio-grade over-ear headphones with adaptive noise cancellation and 40-hour battery life.', 12999, 18999, 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=1200&q=80', 'Audio', 1),
    ('Smart 4K OLED Television 55"', 'smart-oled-55', 'Cinema-grade OLED panel with Dolby Vision IQ and built-in voice assistants.', 89999, 119999, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&q=80', 'Television', 2),
    ('Pro Mirrorless Camera', 'pro-mirrorless-cam', 'Full-frame 45MP sensor, 8K video, weather-sealed magnesium body.', 184999, 199999, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80', 'Camera', 3),
    ('Mechanical Gaming Keyboard', 'mech-keyboard', 'Hot-swap switches, per-key RGB, aluminum chassis.', 8499, 11999, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=80', 'Accessories', 4),
    ('Ultra-Slim Laptop 14"', 'ultra-laptop-14', '14" 2.8K OLED display, 32GB RAM, 1TB SSD, all-day battery.', 134999, 149999, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80', 'Computing', 5)
  ) x(name, slug, description, rate, original_price, banner_url_1, category, sort_order)
  returning id, slug
)
insert into public.lp_offers (product_id, discount_price, expires_at)
select p.id,
  case p.slug
    when 'wnc-headphones' then 9999
    when 'smart-oled-55' then 74999
  end,
  now() + interval '3 days'
from p
where p.slug in ('wnc-headphones', 'smart-oled-55');
