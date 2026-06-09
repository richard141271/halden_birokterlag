export type Publishable = {
  id: string;
  site_key: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
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
};

export type AlbumRecord = Publishable & {
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  cover_image_url?: string | null;
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
};

export type SettingRecord = {
  id: string;
  site_key: string;
  key: string;
  value: unknown;
  type: string;
  group_name: string;
  label: string | null;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};
