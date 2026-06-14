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

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  domain text unique,
  subdomain text unique,
  logo_url text,
  favicon_url text,
  description text,
  contact_email text,
  contact_phone text,
  address text,
  website text,
  subscription_type text not null default 'standard' check (subscription_type in ('free', 'standard', 'premium', 'partner')),
  active boolean not null default true,
  primary_color text,
  secondary_color text,
  header_name text,
  admin_panel_name text,
  enabled_modules jsonb not null default '["news","events","documents","gallery"]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.organizations (name, slug, domain, subdomain, description, website, subscription_type, active, header_name, admin_panel_name)
values
  ('Halden Birøkterlag', 'halden', 'haldenbi.no', 'halden', 'Halden Birøkterlag', 'https://haldenbi.no', 'standard', true, 'Halden Birøkterlag', 'Halden Birøkterlag CMS'),
  ('Fredrikstad Birøkterlag', 'fredrikstad', 'fredrikstadbirokterlag.no', 'fredrikstad', 'Fredrikstad Birøkterlag', 'https://fredrikstadbirokterlag.no', 'standard', true, 'Fredrikstad Birøkterlag', 'Fredrikstad Birøkterlag CMS'),
  ('Sarpsborg Birøkterlag', 'sarpsborg', 'sarpsborgbirokterlag.no', 'sarpsborg', 'Sarpsborg Birøkterlag', 'https://sarpsborgbirokterlag.no', 'standard', true, 'Sarpsborg Birøkterlag', 'Sarpsborg Birøkterlag CMS')
on conflict (slug) do nothing;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  username text not null unique,
  display_name text,
  password_hash text not null,
  role text not null check (role in ('superadmin', 'organization_admin', 'editor', 'moderator', 'member')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  organization_id uuid references public.organizations(id) on delete cascade,
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
  constraint pages_organization_slug_unique unique (organization_id, slug)
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  organization_id uuid references public.organizations(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  cover_image_id uuid,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint albums_organization_slug_unique unique (organization_id, slug)
);

create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  organization_id uuid references public.organizations(id) on delete cascade,
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
  organization_id uuid references public.organizations(id) on delete cascade,
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
  constraint news_organization_slug_unique unique (organization_id, slug)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  organization_id uuid references public.organizations(id) on delete cascade,
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
  constraint events_organization_slug_unique unique (organization_id, slug)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  organization_id uuid references public.organizations(id) on delete cascade,
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
  constraint documents_organization_slug_unique unique (organization_id, slug),
  constraint documents_bucket_path_unique unique (bucket, storage_path)
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  organization_id uuid references public.organizations(id) on delete cascade,
  key text not null,
  value jsonb not null default 'null'::jsonb,
  type text not null default 'text',
  group_name text not null default 'general',
  label text,
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint settings_organization_key_unique unique (organization_id, key)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  email text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'default',
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organizations_slug_idx on public.organizations(slug);
create index if not exists organizations_domain_idx on public.organizations(domain);
create index if not exists organizations_subdomain_idx on public.organizations(subdomain);
create index if not exists admin_users_organization_idx on public.admin_users(organization_id);
create index if not exists pages_site_key_idx on public.pages(site_key);
create index if not exists pages_organization_idx on public.pages(organization_id);
create index if not exists news_site_key_idx on public.news(site_key);
create index if not exists news_organization_idx on public.news(organization_id);
create index if not exists events_site_key_idx on public.events(site_key);
create index if not exists events_organization_idx on public.events(organization_id);
create index if not exists documents_site_key_idx on public.documents(site_key);
create index if not exists documents_organization_idx on public.documents(organization_id);
create index if not exists albums_site_key_idx on public.albums(site_key);
create index if not exists albums_organization_idx on public.albums(organization_id);
create index if not exists images_site_key_idx on public.images(site_key);
create index if not exists images_organization_idx on public.images(organization_id);
create index if not exists settings_site_key_idx on public.settings(site_key);
create index if not exists settings_organization_idx on public.settings(organization_id);
create index if not exists feedback_organization_idx on public.feedback(organization_id);
create index if not exists votes_organization_idx on public.votes(organization_id);

alter table public.pages alter column organization_id set not null;
alter table public.albums alter column organization_id set not null;
alter table public.images alter column organization_id set not null;
alter table public.news alter column organization_id set not null;
alter table public.events alter column organization_id set not null;
alter table public.documents alter column organization_id set not null;
alter table public.settings alter column organization_id set not null;

drop trigger if exists trg_organizations_updated_at on public.organizations;
create trigger trg_organizations_updated_at before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at before update on public.admin_users
for each row execute function public.set_updated_at();

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

drop trigger if exists trg_feedback_updated_at on public.feedback;
create trigger trg_feedback_updated_at before update on public.feedback
for each row execute function public.set_updated_at();

drop trigger if exists trg_votes_updated_at on public.votes;
create trigger trg_votes_updated_at before update on public.votes
for each row execute function public.set_updated_at();
