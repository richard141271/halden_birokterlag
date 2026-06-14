export type AdminRole =
  | "superadmin"
  | "organization_admin"
  | "editor"
  | "moderator"
  | "member";

export type SubscriptionType = "free" | "standard" | "premium" | "partner";

export type TenantScoped = {
  id: string;
  site_key: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Publishable = TenantScoped & {
  is_published: boolean;
};

export type OrganizationRecord = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  subdomain: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  website: string | null;
  subscription_type: SubscriptionType;
  active: boolean;
  primary_color: string | null;
  secondary_color: string | null;
  header_name: string | null;
  admin_panel_name: string | null;
  enabled_modules: string[];
  created_at: string;
  updated_at: string;
  admin_count?: number;
  news_count?: number;
  event_count?: number;
  document_count?: number;
  image_count?: number;
  last_activity_at?: string | null;
  resolved_hostname?: string | null;
};

export type AdminUserRecord = {
  id: string;
  organization_id: string | null;
  username: string;
  display_name: string | null;
  password_hash: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PageRecord = Publishable & {
  slug: string;
  title: string;
  page_type: string;
  body: string;
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_homepage: boolean;
  show_in_nav: boolean;
  nav_order: number;
};

export type NewsRecord = Publishable & {
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  published_at: string | null;
  author_name: string;
  cover_image_url?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
};

export type EventRecord = Publishable & {
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  registration_url: string | null;
  cover_image_url?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
};

export type DocumentRecord = Publishable & {
  title: string;
  slug: string;
  description: string | null;
  folder_path: string;
  bucket: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number | null;
  organization_name?: string | null;
  organization_slug?: string | null;
};

export type AlbumRecord = Publishable & {
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  cover_image_url?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
};

export type ImageRecord = Publishable & {
  album_id: string | null;
  bucket: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  alt_text: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  sort_order: number;
  public_url?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
};

export type SettingRecord = TenantScoped & {
  key: string;
  value: unknown;
  type: string;
  group_name: string;
  label: string | null;
  description: string | null;
  is_public: boolean;
};

export type FeedbackRecord = TenantScoped & {
  name: string;
  email: string | null;
  message: string;
  status: string;
};

export type VoteRecord = TenantScoped & {
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: string;
};
