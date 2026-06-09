create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  slug text not null,
  title text not null,
  page_type text not null default 'static',
  body text not null default '',
  excerpt text,
  seo_title text,
  seo_description text,
  is_homepage boolean not null default false,
  is_published boolean not null default true,
  show_in_nav boolean not null default true,
  nav_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pages_site_slug_unique unique (site_key, slug)
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  slug text not null,
  title text not null,
  description text,
  cover_image_id uuid,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint albums_site_slug_unique unique (site_key, slug)
);

create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  album_id uuid references public.albums(id) on delete set null,
  bucket text not null default 'media',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  alt_text text,
  caption text,
  width integer,
  height integer,
  size_bytes bigint,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint images_bucket_path_unique unique (bucket, storage_path)
);

alter table public.albums
  add constraint albums_cover_image_fk
  foreign key (cover_image_id) references public.images(id) on delete set null;

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  slug text not null,
  title text not null,
  summary text,
  body text not null default '',
  cover_image_id uuid references public.images(id) on delete set null,
  author_name text not null default 'Admin',
  seo_title text,
  seo_description text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_site_slug_unique unique (site_key, slug)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  slug text not null,
  title text not null,
  summary text,
  body text not null default '',
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  registration_url text,
  cover_image_id uuid references public.images(id) on delete set null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_site_slug_unique unique (site_key, slug)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  title text not null,
  slug text not null,
  description text,
  folder_path text not null default '/',
  bucket text not null default 'documents',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_site_slug_unique unique (site_key, slug),
  constraint documents_bucket_path_unique unique (bucket, storage_path)
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  key text not null,
  value jsonb not null default 'null'::jsonb,
  type text not null default 'text',
  group_name text not null default 'general',
  label text,
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint settings_site_key_unique unique (site_key, key)
);

create index if not exists pages_site_key_idx on public.pages(site_key);
create index if not exists news_site_key_idx on public.news(site_key);
create index if not exists events_site_key_idx on public.events(site_key);
create index if not exists documents_site_key_idx on public.documents(site_key);
create index if not exists albums_site_key_idx on public.albums(site_key);
create index if not exists images_site_key_idx on public.images(site_key);
create index if not exists settings_site_key_idx on public.settings(site_key);

drop trigger if exists trg_pages_updated_at on public.pages;
create trigger trg_pages_updated_at before update on public.pages
for each row execute function public.set_updated_at();

drop trigger if exists trg_albums_updated_at on public.albums;
create trigger trg_albums_updated_at before update on public.albums
for each row execute function public.set_updated_at();

drop trigger if exists trg_images_updated_at on public.images;
create trigger trg_images_updated_at before update on public.images
for each row execute function public.set_updated_at();

drop trigger if exists trg_news_updated_at on public.news;
create trigger trg_news_updated_at before update on public.news
for each row execute function public.set_updated_at();

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists trg_documents_updated_at on public.documents;
create trigger trg_documents_updated_at before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at before update on public.settings
for each row execute function public.set_updated_at();
