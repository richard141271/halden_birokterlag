create extension if not exists pgcrypto;

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

alter table public.organizations add column if not exists subdomain text;
alter table public.organizations add column if not exists favicon_url text;
alter table public.organizations add column if not exists website text;
alter table public.organizations add column if not exists subscription_type text not null default 'standard';
alter table public.organizations add column if not exists active boolean not null default true;
alter table public.organizations add column if not exists primary_color text;
alter table public.organizations add column if not exists secondary_color text;
alter table public.organizations add column if not exists header_name text;
alter table public.organizations add column if not exists admin_panel_name text;
alter table public.organizations add column if not exists enabled_modules jsonb not null default '["news","events","documents","gallery"]'::jsonb;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'organizations'
      and column_name = 'is_active'
  ) then
    execute 'update public.organizations set active = coalesce(active, is_active, true)';
  else
    execute 'update public.organizations set active = coalesce(active, true)';
  end if;
end
$$;

update public.organizations
set subscription_type = coalesce(nullif(subscription_type, ''), 'standard');

update public.organizations
set enabled_modules = coalesce(enabled_modules, '["news","events","documents","gallery"]'::jsonb);

update public.organizations
set header_name = coalesce(nullif(header_name, ''), name),
    admin_panel_name = coalesce(nullif(admin_panel_name, ''), name || ' CMS'),
    primary_color = coalesce(nullif(primary_color, ''), '#0f172a'),
    secondary_color = coalesce(nullif(secondary_color, ''), '#e2e8f0'),
    subdomain = coalesce(nullif(subdomain, ''), slug)
where true;

alter table public.organizations drop constraint if exists organizations_subscription_type_check;
alter table public.organizations
  add constraint organizations_subscription_type_check
  check (subscription_type in ('free', 'standard', 'premium', 'partner'));

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

alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('superadmin', 'organization_admin', 'editor', 'moderator', 'member'));

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

alter table public.pages add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.news add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.events add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.documents add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.albums add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.images add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.settings add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

with halden_org as (
  select id from public.organizations where slug = 'halden' limit 1
)
update public.pages
set organization_id = coalesce(
  organization_id,
  (select o.id from public.organizations o where o.slug = public.pages.site_key limit 1),
  (select id from halden_org)
)
where organization_id is null;

with halden_org as (
  select id from public.organizations where slug = 'halden' limit 1
)
update public.news
set organization_id = coalesce(
  organization_id,
  (select o.id from public.organizations o where o.slug = public.news.site_key limit 1),
  (select id from halden_org)
)
where organization_id is null;

with halden_org as (
  select id from public.organizations where slug = 'halden' limit 1
)
update public.events
set organization_id = coalesce(
  organization_id,
  (select o.id from public.organizations o where o.slug = public.events.site_key limit 1),
  (select id from halden_org)
)
where organization_id is null;

with halden_org as (
  select id from public.organizations where slug = 'halden' limit 1
)
update public.documents
set organization_id = coalesce(
  organization_id,
  (select o.id from public.organizations o where o.slug = public.documents.site_key limit 1),
  (select id from halden_org)
)
where organization_id is null;

with halden_org as (
  select id from public.organizations where slug = 'halden' limit 1
)
update public.albums
set organization_id = coalesce(
  organization_id,
  (select o.id from public.organizations o where o.slug = public.albums.site_key limit 1),
  (select id from halden_org)
)
where organization_id is null;

with halden_org as (
  select id from public.organizations where slug = 'halden' limit 1
)
update public.images
set organization_id = coalesce(
  organization_id,
  (select o.id from public.organizations o where o.slug = public.images.site_key limit 1),
  (select id from halden_org)
)
where organization_id is null;

with halden_org as (
  select id from public.organizations where slug = 'halden' limit 1
)
update public.settings
set organization_id = coalesce(
  organization_id,
  (select o.id from public.organizations o where o.slug = public.settings.site_key limit 1),
  (select id from halden_org)
)
where organization_id is null;

alter table public.pages alter column organization_id set not null;
alter table public.news alter column organization_id set not null;
alter table public.events alter column organization_id set not null;
alter table public.documents alter column organization_id set not null;
alter table public.albums alter column organization_id set not null;
alter table public.images alter column organization_id set not null;
alter table public.settings alter column organization_id set not null;

alter table public.pages drop constraint if exists pages_site_slug_unique;
alter table public.news drop constraint if exists news_site_slug_unique;
alter table public.events drop constraint if exists events_site_slug_unique;
alter table public.documents drop constraint if exists documents_site_slug_unique;
alter table public.albums drop constraint if exists albums_site_slug_unique;
alter table public.settings drop constraint if exists settings_site_key_unique;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pages_organization_slug_unique'
  ) then
    alter table public.pages
      add constraint pages_organization_slug_unique unique (organization_id, slug);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'news_organization_slug_unique'
  ) then
    alter table public.news
      add constraint news_organization_slug_unique unique (organization_id, slug);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'events_organization_slug_unique'
  ) then
    alter table public.events
      add constraint events_organization_slug_unique unique (organization_id, slug);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'documents_organization_slug_unique'
  ) then
    alter table public.documents
      add constraint documents_organization_slug_unique unique (organization_id, slug);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'albums_organization_slug_unique'
  ) then
    alter table public.albums
      add constraint albums_organization_slug_unique unique (organization_id, slug);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'settings_organization_key_unique'
  ) then
    alter table public.settings
      add constraint settings_organization_key_unique unique (organization_id, key);
  end if;
end
$$;

create index if not exists organizations_slug_idx on public.organizations(slug);
create index if not exists organizations_domain_idx on public.organizations(domain);
create unique index if not exists organizations_subdomain_idx on public.organizations(subdomain);
create index if not exists admin_users_organization_idx on public.admin_users(organization_id);
create index if not exists pages_organization_idx on public.pages(organization_id);
create index if not exists news_organization_idx on public.news(organization_id);
create index if not exists events_organization_idx on public.events(organization_id);
create index if not exists documents_organization_idx on public.documents(organization_id);
create index if not exists albums_organization_idx on public.albums(organization_id);
create index if not exists images_organization_idx on public.images(organization_id);
create index if not exists settings_organization_idx on public.settings(organization_id);
create index if not exists feedback_organization_idx on public.feedback(organization_id);
create index if not exists votes_organization_idx on public.votes(organization_id);

drop trigger if exists trg_organizations_updated_at on public.organizations;
create trigger trg_organizations_updated_at before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at before update on public.admin_users
for each row execute function public.set_updated_at();

drop trigger if exists trg_feedback_updated_at on public.feedback;
create trigger trg_feedback_updated_at before update on public.feedback
for each row execute function public.set_updated_at();

drop trigger if exists trg_votes_updated_at on public.votes;
create trigger trg_votes_updated_at before update on public.votes
for each row execute function public.set_updated_at();
