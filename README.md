# LEK-Systemet(TM) CMS

LEK-Systemet(TM) CMS er et modulært og gjenbrukbart grunnlag for organisasjonsnettsteder bygget med `Next.js 15`, `TypeScript`, `Tailwind CSS`, `Supabase` og `Vercel`.

## Teknologistakk

- `Next.js 15` med `App Router`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`-inspirert komponentlag
- `Supabase` for database og storage
- `Vercel` for deploy

## Struktur

```text
/app
/components
/features
/lib
/hooks
/types
/supabase
```

## Innhold i MVP

- Offentlige sider for forside, om oss, kontakt, nyheter, arrangementer, dokumenter og galleri
- `/admin` med felles innlogging via miljøvariabler
- CRUD-grunnlag for nyheter, arrangementer og statiske sider
- Opplasting av PDF og bilder via Supabase Storage
- Globalt innstillingssystem
- `site_key` på datamodellen for senere multisite-støtte

## Oppstart

1. Kopier `.env.example` til `.env.local`
2. Fyll inn:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
3. Kjør SQL fra [schema.sql](file:///Users/jornsmackbookpro/Documents/trae_projects/halden_birokterlag/supabase/schema.sql)
4. Opprett buckets i Supabase:
   - `media`
   - `documents`
5. Start lokalt:

```bash
npm install
npm run dev
```

## Deploy

- Koble GitHub-repoet til Vercel
- Legg inn samme miljøvariabler i Vercel
- Deploy fra `main`

## Videre utvidelser

- Multisite via `site_key`
- Medlemsområde
- Kalender
- Forum
- Kursportal
- Nettbutikk
- LEK-integrasjon
- AI-assistent
- Birøkter-app
