-- ═══════════════════════════════════════════════════════════════════════════
-- GS RELOJES — Schema completo
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- búsqueda fuzzy en productos


-- ═══════════════════════════════════════════════════════════════════════════
-- SECCIÓN 1: CONFIGURACIÓN DEL SITIO
-- ═══════════════════════════════════════════════════════════════════════════

-- Hero Section (fila única)
create table hero_settings (
  id         smallint   primary key default 1,
  badge      text       not null default 'ESTABLISHED 1892',
  title      text       not null default 'TIMELESS\nPRECISION',
  subtitle   text       not null default '',
  cta1_label text       not null default 'DISCOVER THE COLLECTION',
  cta2_label text       not null default 'OUR HERITAGE',
  bg_image   text       not null default '',
  updated_at timestamptz not null default now(),
  constraint hero_single_row check (id = 1)
);

-- Navbar (fila única + links separados)
create table navbar_settings (
  id          smallint  primary key default 1,
  brand_name  text      not null default 'HOROLOGICAL EXCELLENCE',
  updated_at  timestamptz not null default now(),
  constraint navbar_single_row check (id = 1)
);

create table nav_links (
  id       uuid    primary key default uuid_generate_v4(),
  label    text    not null,
  href     text    not null default '#',
  position smallint not null default 0,
  active   boolean not null default true,
  created_at timestamptz default now()
);

-- Footer (fila única + links separados)
create table footer_settings (
  id          smallint  primary key default 1,
  brand_name  text      not null default 'HOROLOGICAL EXCELLENCE',
  copyright   text      not null default '',
  updated_at  timestamptz not null default now(),
  constraint footer_single_row check (id = 1)
);

create table footer_links (
  id       uuid    primary key default uuid_generate_v4(),
  label    text    not null,
  href     text    not null default '#',
  position smallint not null default 0,
  active   boolean not null default true,
  created_at timestamptz default now()
);


-- ═══════════════════════════════════════════════════════════════════════════
-- SECCIÓN 2: JERARQUÍA DE CATEGORÍAS
-- ═══════════════════════════════════════════════════════════════════════════

-- Marcas (ej: "vacheron-constantin")
create table watch_brands (
  id         text        primary key,  -- slug-style ID
  name       text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Colecciones (ej: "patrimony" dentro de "vacheron-constantin")
create table watch_collections (
  id         text        not null,
  brand_id   text        not null references watch_brands(id) on delete cascade,
  name       text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (brand_id, id)
);

-- Modelos (ej: "moon-phase" dentro de "patrimony")
create table watch_models (
  id            text        not null,
  collection_id text        not null,
  brand_id      text        not null,
  name          text        not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (brand_id, collection_id, id),
  foreign key (brand_id, collection_id)
    references watch_collections(brand_id, id) on delete cascade
);


-- ═══════════════════════════════════════════════════════════════════════════
-- SECCIÓN 3: PRODUCTOS
-- ═══════════════════════════════════════════════════════════════════════════

create table products (
  id                      uuid         primary key default uuid_generate_v4(),
  sku                     text         not null unique,
  slug                    text         not null unique,
  brand                   text         not null,  -- nombre display (desnormalizado)
  name                    text         not null,
  price                   numeric(12,2) not null check (price > 0),
  sale_price              numeric(12,2) check (sale_price > 0 and sale_price < price),
  image                   text         not null default '',  -- imagen principal / portada
  -- Categoría jerárquica (FK a 3 niveles)
  category_brand_id       text         references watch_brands(id) on delete set null,
  category_collection_id  text,
  category_model_id       text,
  description             text         not null default '',
  active                  boolean      not null default true,
  created_at              timestamptz  not null default now(),
  updated_at              timestamptz  not null default now(),
  -- FK a colección
  foreign key (category_brand_id, category_collection_id)
    references watch_collections(brand_id, id) on delete set null
    deferrable initially deferred,
  -- FK a modelo
  foreign key (category_brand_id, category_collection_id, category_model_id)
    references watch_models(brand_id, collection_id, id) on delete set null
    deferrable initially deferred
);

-- Galería de imágenes adicionales (la portada va en products.image)
create table product_images (
  id         uuid     primary key default uuid_generate_v4(),
  product_id uuid     not null references products(id) on delete cascade,
  url        text     not null,
  position   smallint not null default 0,
  created_at timestamptz default now()
);


-- ═══════════════════════════════════════════════════════════════════════════
-- SECCIÓN 4: PEDIDOS
-- ═══════════════════════════════════════════════════════════════════════════

create type order_status as enum (
  'pending',     -- recién creado, sin pago confirmado
  'confirmed',   -- pago confirmado
  'processing',  -- en preparación
  'shipped',     -- enviado
  'delivered',   -- entregado
  'cancelled',   -- cancelado
  'refunded'     -- reembolsado
);

create sequence orders_number_seq start with 1001 increment by 1;

create table orders (
  id               uuid         primary key default uuid_generate_v4(),
  order_number     text         not null unique,
  customer_name    text         not null,
  customer_email   text         not null,
  customer_phone   text,
  -- Dirección completa como JSONB para máxima flexibilidad
  shipping_address jsonb        not null default '{}'::jsonb,
  /*  Estructura esperada de shipping_address:
      {
        "line1": "Calle 123",
        "line2": "Piso 2",
        "city": "Buenos Aires",
        "state": "CABA",
        "postal_code": "1425",
        "country": "AR"
      }
  */
  status           order_status not null default 'pending',
  subtotal         numeric(12,2) not null check (subtotal >= 0),
  shipping_cost    numeric(12,2) not null default 0 check (shipping_cost >= 0),
  total            numeric(12,2) not null check (total >= 0),
  notes            text,
  created_at       timestamptz  not null default now(),
  updated_at       timestamptz  not null default now()
);

create table order_items (
  id               uuid          primary key default uuid_generate_v4(),
  order_id         uuid          not null references orders(id) on delete cascade,
  product_id       uuid          references products(id) on delete set null,
  -- Snapshot del producto en el momento de la compra (precio, nombre, imagen)
  product_snapshot jsonb         not null,
  /*  Estructura esperada de product_snapshot:
      {
        "sku": "VC-PMO-001",
        "brand": "VACHERON CONSTANTIN",
        "name": "Patrimony Moon Phase",
        "image": "https://...",
        "price": 32500.00,
        "sale_price": null
      }
  */
  quantity         smallint      not null check (quantity > 0),
  unit_price       numeric(12,2) not null check (unit_price >= 0),
  created_at       timestamptz   not null default now()
);

-- Genera el número de pedido legible al insertar
create or replace function set_order_number()
returns trigger language plpgsql as $$
begin
  new.order_number := 'GS-' || to_char(now(), 'YYYYMMDD') || '-' ||
                      lpad(nextval('orders_number_seq')::text, 4, '0');
  return new;
end;
$$;

create trigger trg_set_order_number
  before insert on orders
  for each row execute function set_order_number();


-- ═══════════════════════════════════════════════════════════════════════════
-- SECCIÓN 5: ÍNDICES
-- ═══════════════════════════════════════════════════════════════════════════

-- Productos
create index idx_products_slug         on products(slug);
create index idx_products_active       on products(active) where active = true;
create index idx_products_category     on products(category_brand_id, category_collection_id);
create index idx_products_sale         on products(sale_price) where sale_price is not null;
create index idx_products_name_search  on products using gin(to_tsvector('spanish', name || ' ' || brand));
create index idx_products_sku_trgm     on products using gin(sku gin_trgm_ops);

-- Galería
create index idx_product_images_pid    on product_images(product_id, position);

-- Pedidos
create index idx_orders_email          on orders(customer_email);
create index idx_orders_status         on orders(status);
create index idx_orders_created        on orders(created_at desc);
create index idx_order_items_order     on order_items(order_id);
create index idx_order_items_product   on order_items(product_id);

-- Jerarquía
create index idx_collections_brand     on watch_collections(brand_id);
create index idx_models_brand_col      on watch_models(brand_id, collection_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- SECCIÓN 6: TRIGGERS updated_at
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_products_updated_at
  before update on products
  for each row execute function update_updated_at();

create trigger trg_orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

create trigger trg_watch_brands_updated_at
  before update on watch_brands
  for each row execute function update_updated_at();

create trigger trg_watch_collections_updated_at
  before update on watch_collections
  for each row execute function update_updated_at();

create trigger trg_hero_updated_at
  before update on hero_settings
  for each row execute function update_updated_at();

create trigger trg_navbar_updated_at
  before update on navbar_settings
  for each row execute function update_updated_at();

create trigger trg_footer_updated_at
  before update on footer_settings
  for each row execute function update_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════
-- SECCIÓN 7: ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

alter table hero_settings     enable row level security;
alter table navbar_settings   enable row level security;
alter table nav_links         enable row level security;
alter table footer_settings   enable row level security;
alter table footer_links      enable row level security;
alter table watch_brands      enable row level security;
alter table watch_collections enable row level security;
alter table watch_models      enable row level security;
alter table products          enable row level security;
alter table product_images    enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;

-- ── Lectura pública (catálogo y configuración del sitio) ─────────────────

create policy "public: read hero"
  on hero_settings for select to anon, authenticated using (true);

create policy "public: read navbar"
  on navbar_settings for select to anon, authenticated using (true);

create policy "public: read nav_links"
  on nav_links for select to anon, authenticated using (active = true);

create policy "public: read footer"
  on footer_settings for select to anon, authenticated using (true);

create policy "public: read footer_links"
  on footer_links for select to anon, authenticated using (active = true);

create policy "public: read brands"
  on watch_brands for select to anon, authenticated using (true);

create policy "public: read collections"
  on watch_collections for select to anon, authenticated using (true);

create policy "public: read models"
  on watch_models for select to anon, authenticated using (true);

create policy "public: read active products"
  on products for select to anon, authenticated using (active = true);

create policy "public: read product images"
  on product_images for select to anon, authenticated using (true);

-- ── Pedidos: cualquiera puede crear (checkout anónimo) ───────────────────

create policy "public: create order"
  on orders for insert to anon, authenticated with check (true);

create policy "public: create order items"
  on order_items for insert to anon, authenticated with check (true);

-- ── El dueño puede ver sus propios pedidos (por email) ───────────────────

create policy "user: read own orders"
  on orders for select to anon, authenticated
  using (customer_email = current_setting('request.jwt.claims', true)::jsonb->>'email');


-- ═══════════════════════════════════════════════════════════════════════════
-- SECCIÓN 8: DATOS INICIALES (Seed)
-- ═══════════════════════════════════════════════════════════════════════════

-- Hero
insert into hero_settings (badge, title, subtitle, cta1_label, cta2_label, bg_image)
values (
  'ESTABLISHED 1892',
  'TIMELESS\nPRECISION',
  'Experience the apex of Swiss engineering and artisanal craftsmanship. A legacy forged in gold and steel.',
  'DISCOVER THE COLLECTION',
  'OUR HERITAGE',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBo4r2_nOlvLyUYR78UCo-5gnURHuFH6W7_IN62TozeHNnXriEATlWYBQMiOFPzW45e1s9wRD1xB44GqC-A7IjpuCU0Vx04edqzCfsS3M3bP5vcxojq6fkmK6AU-jpLD3pesd9F64NKagTZH-2lacDzCycxM_iQO3VHSAMA9FkW517Lu9PXqnVXqsYPIAfef_w4ZDMqYkMDGzMrjvBXAfcQ3MVM8SkouCFZcSymLW7NPs3fV633X63xUEJLtoqsC4RnlsHak__gWyt4'
);

-- Navbar
insert into navbar_settings (brand_name) values ('HOROLOGICAL EXCELLENCE');

insert into nav_links (label, href, position) values
  ('Heritage',      '#', 0),
  ('Collections',   '#', 1),
  ('Complications', '#', 2),
  ('Bespoke',       '#', 3),
  ('Service',       '#', 4);

-- Footer
insert into footer_settings (brand_name, copyright)
values ('HOROLOGICAL EXCELLENCE', '© 2024 GS Relojes. Todos los derechos reservados.');

-- ── Marcas ────────────────────────────────────────────────────────────────

insert into watch_brands (id, name) values
  ('vacheron-constantin', 'Vacheron Constantin'),
  ('patek-philippe',      'Patek Philippe'),
  ('audemars-piguet',     'Audemars Piguet'),
  ('omega',               'Omega'),
  ('cartier',             'Cartier'),
  ('iwc',                 'IWC Schaffhausen'),
  ('jaeger-lecoultre',    'Jaeger-LeCoultre'),
  ('tudor',               'Tudor'),
  ('grand-seiko',         'Grand Seiko');

-- ── Colecciones ───────────────────────────────────────────────────────────

insert into watch_collections (brand_id, id, name) values
  ('vacheron-constantin', 'patrimony',       'Patrimony'),
  ('vacheron-constantin', 'overseas',        'Overseas'),
  ('vacheron-constantin', 'traditionnelle',  'Traditionnelle'),
  ('patek-philippe',      'calatrava',       'Calatrava'),
  ('patek-philippe',      'nautilus',        'Nautilus'),
  ('patek-philippe',      'aquanaut',        'Aquanaut'),
  ('audemars-piguet',     'royal-oak',       'Royal Oak'),
  ('audemars-piguet',     'royal-oak-offshore', 'Royal Oak Offshore'),
  ('omega',               'speedmaster',     'Speedmaster'),
  ('omega',               'seamaster',       'Seamaster'),
  ('omega',               'constellation',   'Constellation'),
  ('cartier',             'tank',            'Tank'),
  ('cartier',             'santos',          'Santos'),
  ('cartier',             'ballon-bleu',     'Ballon Bleu'),
  ('iwc',                 'pilots-watch',    'Pilot''s Watch'),
  ('iwc',                 'portugieser',     'Portugieser'),
  ('jaeger-lecoultre',    'reverso',         'Reverso'),
  ('jaeger-lecoultre',    'master',          'Master'),
  ('tudor',               'black-bay',       'Black Bay'),
  ('tudor',               'pelagos',         'Pelagos'),
  ('grand-seiko',         'heritage',        'Heritage'),
  ('grand-seiko',         'evolution-9',     'Evolution 9'),
  ('grand-seiko',         'elegance',        'Elegance');

-- ── Modelos ───────────────────────────────────────────────────────────────

insert into watch_models (brand_id, collection_id, id, name) values
  ('vacheron-constantin', 'patrimony',      'moon-phase',          'Moon Phase'),
  ('vacheron-constantin', 'patrimony',      'ultra-thin',          'Ultra-Thin'),
  ('vacheron-constantin', 'patrimony',      'traditional',         'Traditional'),
  ('vacheron-constantin', 'overseas',       'chronograph',         'Chronograph'),
  ('vacheron-constantin', 'overseas',       'perpetual-calendar',  'Perpetual Calendar'),
  ('vacheron-constantin', 'traditionnelle', 'minute-repeater',     'Minute Repeater'),
  ('vacheron-constantin', 'traditionnelle', 'tourbillon',          'Tourbillon'),
  ('patek-philippe',      'calatrava',      '5227g',               '5227G'),
  ('patek-philippe',      'calatrava',      '6119g',               '6119G'),
  ('patek-philippe',      'nautilus',       '5711',                '5711'),
  ('patek-philippe',      'nautilus',       '5726a',               '5726A Annual Calendar'),
  ('patek-philippe',      'aquanaut',       '5167a',               '5167A'),
  ('audemars-piguet',     'royal-oak',      'jumbo',               'Jumbo Extra-Thin'),
  ('audemars-piguet',     'royal-oak',      'chronograph',         'Chronograph'),
  ('audemars-piguet',     'royal-oak-offshore', 'diver',           'Diver'),
  ('omega',               'speedmaster',    'moonwatch',           'Moonwatch'),
  ('omega',               'speedmaster',    'racing',              'Racing'),
  ('omega',               'seamaster',      '300m',                '300M Diver'),
  ('omega',               'seamaster',      'planet-ocean',        'Planet Ocean'),
  ('omega',               'constellation',  'co-axial',            'Co-Axial'),
  ('cartier',             'tank',           'must',                'Must de Cartier'),
  ('cartier',             'tank',           'louis',               'Louis Cartier'),
  ('cartier',             'santos',         'medium',              'Santos Medium'),
  ('cartier',             'ballon-bleu',    '36mm',                '36mm'),
  ('iwc',                 'pilots-watch',   'petit-prince',        'Petit Prince'),
  ('iwc',                 'pilots-watch',   'chronograph',         'Chronograph'),
  ('iwc',                 'portugieser',    'automatic',           'Automatic'),
  ('jaeger-lecoultre',    'reverso',        'classic',             'Classic Medium Thin'),
  ('jaeger-lecoultre',    'reverso',        'tribute',             'Tribute Chronograph'),
  ('jaeger-lecoultre',    'master',         'ultra-thin-moon',     'Ultra Thin Moon'),
  ('tudor',               'black-bay',      'burgundy',            'Burgundy'),
  ('tudor',               'black-bay',      '58',                  '58'),
  ('tudor',               'black-bay',      'gmt',                 'GMT'),
  ('tudor',               'black-bay',      'chrono',              'Chrono'),
  ('tudor',               'pelagos',        'lhd',                 'LHD'),
  ('tudor',               'pelagos',        '39',                  '39'),
  ('grand-seiko',         'heritage',       'snowflake',           'Snowflake SBGA211'),
  ('grand-seiko',         'heritage',       'shizukuishi',         'Shizukuishi'),
  ('grand-seiko',         'evolution-9',    'hi-beat',             'Hi-Beat 36000'),
  ('grand-seiko',         'elegance',       'slim',                'Slim');

-- ── Productos ─────────────────────────────────────────────────────────────

insert into products (sku, slug, brand, name, price, sale_price, image, category_brand_id, category_collection_id, category_model_id, description)
values
  (
    'VC-PMO-001', 'vacheron-constantin-patrimony-moon-phase',
    'VACHERON CONSTANTIN', 'Patrimony Moon Phase',
    32500.00, null,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCegT7LNqYGF3O3K7cRv86qfdk5DsCHaLqR2bcR8g1bxzE_llNxLzx-H2aiUoVu0hCg5tY6UywCmtf5dhkbIf3wDspMssa6oG9AXT5_BQcZhcrvvns2-3VWJwFp6RLwoOpomRAJVLmbmzmVX3SGF9i5MmCTR3soXsCzW-nsH_c8jkFtiYOBeYSI_ZrYcLyHU6qXWi22kqO9quq3Ob18-aVXXOYAgnGceHxCHlP_XUDsv_uYm3wOQ6F5ChVgkXKFvie-3FfGYzTd1Io',
    'vacheron-constantin', 'patrimony', 'moon-phase',
    'An exquisite expression of haute horlogerie, featuring a captivating moonphase complication in 18k rose gold.'
  ),
  (
    'PP-CAL-001', 'patek-philippe-calatrava-5227g',
    'PATEK PHILIPPE', 'Calatrava 5227G',
    38200.00, null,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDXjUg5OTY2FLFlnUdwdhM5XVlFq5UwKEw1qx7TP678avj0xpj0rMvO2KNSYEacPIT8U3BAqssUEassZOBkObC21LupAyBpK6vIWrMVwOuCGAm_CFMoAREvVC1Y5uGNqHL6qujSanVsYDnxiB20Efa5cuNo0MRL4V_xjXYTXkrCpoydyfRqWZzsR2u8eh8yhRyxwaRLSLvilCdmw-ck_L1N-Uk2q-zhtCNjaGUwnPlF0gnj7uvV9s0ugnCZRaMTEhIAIP-hA_NWxxA',
    'patek-philippe', 'calatrava', '5227g',
    'The quintessential dress watch, refined over generations with its hallmark of understated elegance.'
  ),
  (
    'AP-ROJ-001', 'audemars-piguet-royal-oak-jumbo',
    'AUDEMARS PIGUET', 'Royal Oak Jumbo',
    45000.00, null,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDfcw8tuC7IcvwRNcMSYMzgEAWCiP-KxFI0F6z1Wp-a1aprS0WtrqxfPV-oIXq9fnObm2PlBhpFyQ9hvEWBYSKgWYeZz4Xx8DLQaoIenyxgvDVVmJf2SiKetsApZr6wqerfGvzCN2jwd76OfSiuZ7MuGZ8K1NjDjKfTjIWRJNLeuIrpXipxh6d0uzk4-83Nuuv7uTDHFDQNlK9yAp7QRR86eQKFgHD2ZP4RCm9GGl-SYEQVNqzrqxMi40H0PEJ9hpKqS-j3nyIf7w4',
    'audemars-piguet', 'royal-oak', 'jumbo',
    'The original luxury sports watch. The iconic octagonal case in 18k white gold with the legendary tapisserie dial.'
  ),
  (
    'OM-SPM-001', 'omega-speedmaster-moonwatch',
    'OMEGA', 'Speedmaster Moonwatch',
    6400.00, null,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD-zKnwiAcI99-jEdYBm9oS9A9JBFPY9j128-juNL9UjmrlM5av46l_guoKtQKZJj1SrXtFBH1zZMTwYEqAvjOaaNzvmsqEi3UNHtBjppQHmWNnvs9PNgwLW5G014pu1-vYaBYPsd-Hj1qqMR2kD7BlClcAI2v3iov19HXf5eeBdbsqZKoM3u1_R6em8QkncuICsw6NP8pRE1D5qVLvM5WU9vQZlNt8f72pfx3umAkvTpTc-npiMIrfBcWHdIPc',
    'omega', 'speedmaster', 'moonwatch',
    'The watch that accompanied man to the moon. A horological legend with the iconic reverse panda dial.'
  ),
  (
    'CT-TMU-001', 'cartier-tank-must-de-cartier',
    'CARTIER', 'Tank Must de Cartier',
    4200.00, 3650.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDLE8jUYYhTjTWAAeevCNRjbyzYvW6zp81zdJC8tCv69bmVecGtXchDm1LjSmgapBxxS9-QXDcl5vs3fNGJ9Eqx_og_DdztFJCRnXQ7owltTpPEQDIzmOmbR3AOlrKr511gPrO046KagsfNc5UkQWn-ILwwFSaU9yyZOk3KGPXNu9FFnWPWFKFW_qCuUiERykZfiU0f5T2ZdIV_Ng8ih0agMkyoRAGdlJWEBAN6iTOhWiLfTCLil7Usy3tPtglKX3C6I5lSBib51yI',
    'cartier', 'tank', 'must',
    'An icon of style since 1917. The Tank''s architectural lines remain the benchmark for elegant watches.'
  ),
  (
    'IW-PPP-001', 'iwc-pilots-watch-petit-prince',
    'IWC SCHAFFHAUSEN', 'Pilot''s Watch Petit Prince',
    5800.00, null,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBPO_wXcPgNNJasPiJ4cPX_W97xaXy9f4K3nmCl_LF1LiL97QeGHmkA8KgBMBnQHlrq1lOG90Sn3zWbHiGxGtaBHiuvBl1gA4cK36SbnuHt39sNMqz3MiLf1J9jk0mfbfE4eL7OEIG8NfpW5wbK_wgCxqiF_5RiPJxDxhfPNEz6C4Zef3NX0e5q5E9i_RL7yX24WezSHRfb0UjH8Ak3vGlGYgqCMh8N2SzR_bnEh2oMcnPFH2VVrTa4o',
    'iwc', 'pilots-watch', 'petit-prince',
    'Inspired by the beloved novella, this pilot''s chronograph features a distinctive blue dial with refined complications.'
  ),
  (
    'JL-RVS-001', 'jaeger-lecoultre-reverso-classic',
    'JAEGER-LECOULTRE', 'Reverso Classic Medium Thin',
    7200.00, null,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCpxI4p0Y8xMQ_v-3qEfyRfYZO5I1UVXwobHCq26l_HYJJv8xtfNxoFa_7lLt4y3VJLo0VqKRa6TJrGxOVp-rh7fJN1_MV1ZElS7i4UBa7j-QAfBFWfkBhWGsyiH9EEVSm4v9J5BW-d6oAetGm7mMMaZU2LBaRcqZj5QFGlp6YMyCiF7l2MxnBZXPkUz4pREGnqaEKrdxp-Ij8ggxqHDxHaA3r7E0-5Y2JxHhLs0O4ij8bISbPxrxGo',
    'jaeger-lecoultre', 'reverso', 'classic',
    'The Art Deco masterpiece with its signature swiveling case, allowing the wearer to protect the dial when desired.'
  ),
  (
    'TD-BBB-001', 'tudor-black-bay-58',
    'TUDOR', 'Black Bay 58',
    3800.00, null,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCF3q8R4xROE8HEKEi8Xh0rWAi7T8LoUiT_HMwW6FZ5Qr7Q1ZrVLxYQxcg3uiqMIX91Ws-GpymKaSQHEpjqDGpUHUi5w-a3-8VknzCNhC5nVFPP8ETEO9Kfq9C_K1J8Lmfpf3gqLSSKhEXFWkzNpzl1llW8P5BM6Y2Wn0hP4YqEcMidLY8JllN7M9UwJaY6k7rV2ZHFw5BIiVFLN3hEQkJsJaDBaJ3K4yqQF8Jxk6oe5ikfHLxBH0mU',
    'tudor', 'black-bay', '58',
    'Vintage-inspired dive watch with 39mm case, inspired by reference 7924 from 1958. Heritage meets modernity.'
  ),
  (
    'GS-HER-001', 'grand-seiko-heritage-snowflake',
    'GRAND SEIKO', 'Snowflake SBGA211',
    6500.00, 5850.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCb3TSoSHKaExTB6CpqoH4dMNjmIhG7Fc98qUzD5DEOarJz8f3oCPFVJKgNzB6XMtdOtUiePYXRY-1i84B5iKGjQfbMWXY7DoxqioFOJLBjJe9pQz3oZPIPZq72cvjNWS6QqY0gnnEjcgYcxX7gRAJdJ4d3V1M5E-4Z3WN7vbvUWfZ38lEpuqLST2Qs5n8mLFXgz6nCcFJT7sXiCRqiGJVBGi6J-F9d7a2Rra5eVPGnEAoB0oe3aAMRlM',
    'grand-seiko', 'heritage', 'snowflake',
    'The legendary Snowflake dial, inspired by the winter forests of Shinshu. Spring Drive movement with unmatched precision.'
  );
