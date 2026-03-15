# Phase 1 Research: Foundation

**Phase:** 01-foundation
**Requirement:** INFRA-01
**Researched:** 2026-03-15

---

## Step-by-Step Setup Sequence

The order matters. Each step unlocks the next and avoids rework.

1. **Create Supabase cloud project first.** You need the Supabase project URL, anon key, service role key, and the PgBouncer pooler connection string before any code can be written that references them. Creating the project early gives you the exact env var values that go into `.env.local` and Vercel.

2. **Create Sanity project second.** You need the Sanity project ID and dataset name (`production`) before configuring `next-sanity`. Creating it here gives you those two values.

3. **Init Next.js 15 app.** With both service credentials in hand, you can configure `.env.local` correctly from the start — no going back to add missing vars.

4. **Configure Tailwind brand tokens.** Do this immediately after init, before writing any components. Everything downstream depends on the `primary` and `secondary` token names being present.

5. **Install and configure Supabase dependencies.** Install `@supabase/supabase-js`, `@supabase/ssr`, and `drizzle-orm` + `postgres` driver. Write `lib/supabase/server.ts` and `lib/supabase/client.ts` factory files.

6. **Install and configure Sanity.** Run the Sanity CLI to embed the studio at `/studio`, write `lib/sanity/client.ts`, and configure `next-sanity`.

7. **Run local Supabase CLI + Docker.** Start the local stack with `supabase start`. Create the baseline migration (`supabase migration new baseline`). Apply it with `supabase db push`. This proves the migration workflow before any schema complexity exists.

8. **Verify the skeleton locally.** Run `npm run dev`. Confirm: homepage loads, `/studio` loads Sanity Studio, a test server component can execute a Supabase query via PgBouncer port 6543.

9. **Deploy to Vercel.** Connect repo, set all env vars, trigger the first deploy. Confirm the preview URL passes all 5 success criteria.

---

## Next.js 15 Init

**Command:**

```bash
npx create-next-app@latest clinicaltocode \
  --typescript \
  --tailwind \
  --app \
  --src-dir=no \
  --import-alias="@/*" \
  --eslint
```

**What each flag does:**
- `--typescript` — TypeScript project with `tsconfig.json` configured
- `--tailwind` — installs Tailwind CSS v4 and writes `tailwind.config.ts` + imports in `globals.css`
- `--app` — enables App Router (required; Pages Router is not the target)
- `--src-dir=no` — keeps `app/` at project root, not inside `src/` — matches the feature-based directory structure in the architecture doc
- `--import-alias="@/*"` — enables `@/components/...` style imports throughout
- `--eslint` — scaffolds ESLint config using `eslint-config-next`

**What to exclude:** Do not select "customize import alias" at the prompt if it deviates from `@/*`. Do not choose Pages Router when prompted.

**What to add after init:**
- `prettier` + `eslint-plugin-tailwindcss` (for Tailwind class sorting/linting)
- `eslint-plugin-tailwindcss` config in `.eslintrc` or `eslint.config.mjs`

**Resulting directory structure to establish immediately after init:**

```
app/
  (marketing)/        # homepage, about — Sanity-backed
  articles/           # CMS routes
    [slug]/
  studio/             # Sanity Studio embedded
  forum/              # Supabase-backed community
  auth/               # Supabase Auth flows
  api/
    revalidate/       # Sanity ISR webhook
components/
  ui/                 # shadcn/ui primitives (added via CLI)
lib/
  supabase/
    server.ts         # createServerClient factory
    client.ts         # createBrowserClient factory
  sanity/
    client.ts         # sanityClient + createClient config
    queries.ts        # GROQ query strings
  utils/              # shared helpers (cn(), date formatting, etc.)
supabase/
  migrations/         # SQL migration files (version-controlled)
```

---

## Supabase Setup

### 1. Create the Cloud Project

- Go to supabase.com → New Project
- Note the **Project URL** (`https://[ref].supabase.co`), **Anon Key**, and **Service Role Key** from Settings → API
- Go to **Settings → Database → Connection pooling** — copy the **Transaction mode** connection string. It looks like:
  ```
  postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
  ```
  This is `DATABASE_URL`. It uses **port 6543** — the PgBouncer pooler. This is the critical value.
- Also copy the **Direct connection** string from Settings → Database:
  ```
  postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
  ```
  This is `DIRECT_URL`. Used only for migrations, never for application queries.

### 2. Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

Verify:
```bash
supabase --version
```

### 3. Initialize Local Supabase

From the project root:

```bash
supabase init
```

This creates a `supabase/` directory with `config.toml`. The `supabase/migrations/` subdirectory is where all migration files live — commit this to git.

### 4. Start Local Stack (Docker required)

```bash
supabase start
```

This pulls Postgres, GoTrue (Auth), PostgREST, and the Supabase Studio container. On first run it takes a few minutes. After start, the CLI prints local env var values:

```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Anon key: eyJ...
Service role key: eyJ...
```

Use these local values in `.env.local` for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` during development.

**Local PgBouncer:** The local stack also runs a local PgBouncer on port `54329`. For the `DATABASE_URL` in local dev, use:
```
postgresql://postgres:postgres@127.0.0.1:54329/postgres?pgbouncer=true
```

### 5. Create Baseline Migration

```bash
supabase migration new baseline
```

This creates `supabase/migrations/[timestamp]_baseline.sql`. For Phase 1 the baseline is minimal — just a schema version comment or an empty migration to establish the migration chain:

```sql
-- baseline migration: Phase 1 Foundation
-- No tables yet — forum schema added in Phase 4
```

Apply it locally:
```bash
supabase db reset
```

This applies all migrations from scratch against the local Postgres instance.

### 6. PgBouncer Connection — Critical Detail

The `DATABASE_URL` must use port **6543** (pooler), not 5432 (direct). When using Drizzle ORM with the `postgres` npm driver, set `prepare: false`:

```ts
// lib/supabase/drizzle.ts (add later when ORM is used)
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // REQUIRED for PgBouncer transaction mode
})
export const db = drizzle(client)
```

PgBouncer transaction mode does not support prepared statements. Without `prepare: false`, every query will fail with a cryptic protocol error.

### 7. Install npm Packages

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

### 8. Supabase Client Factories

`lib/supabase/server.ts` — call inside every server component, server action, and API route:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

`lib/supabase/client.ts` — use in client components only:

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Never instantiate clients at module level.** Always call the factory inside the component or function — this is a critical pitfall that causes auth context leakage between requests (see PITFALLS.md Pitfall 2).

---

## Sanity Setup

### 1. Create the Sanity Project

```bash
npx create-sanity@latest
```

When prompted:
- Project name: `clinicaltocode`
- Dataset: `production`
- Template: **Clean project with no predefined schemas**
- Output path: a separate `sanity-studio/` directory (you will embed it, but scaffolding separately first avoids conflicts)

Or use the Sanity web dashboard at sanity.io to create the project and get the project ID without running the CLI scaffold.

Note the **Project ID** (e.g., `abc123xyz`) and **Dataset** (`production`).

### 2. Embed Sanity Studio at /studio

Install the Next.js integration:

```bash
npm install next-sanity @sanity/vision
```

Create the studio route:

```
app/studio/[[...tool]]/page.tsx
```

Content of that file:

```tsx
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export const dynamic = 'force-dynamic'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

Create `sanity.config.ts` at the project root:

```ts
import { defineConfig } from 'sanity'
import { structuredContent } from '@sanity/desk-tool' // or 'sanity/desk'

export default defineConfig({
  name: 'clinicaltocode',
  title: 'Clinical to Code',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  plugins: [structuredContent()],
  schema: {
    types: [], // schemas added in Phase 3
  },
})
```

**Important:** The `[[...tool]]` catch-all route is required for Sanity Studio's internal routing to work. Without the double bracket, navigating between Studio tools will 404.

### 3. Sanity Client for Data Fetching

`lib/sanity/client.ts`:

```ts
import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01', // use a fixed date, not 'latest'
  useCdn: process.env.NODE_ENV === 'production', // CDN in prod, live in dev
})
```

For Phase 1 the client is just configured — no GROQ queries needed until Phase 3.

### 4. Add Sanity to next.config.ts

Sanity Studio requires `serverExternalPackages` in Next.js 15:

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    serverExternalPackages: ['@sanity/client'],
  },
}
export default nextConfig
```

Also configure the Supabase image hostname if avatar images will be served from Supabase Storage:

```ts
images: {
  remotePatterns: [
    { hostname: '*.supabase.co' },
    { hostname: 'cdn.sanity.io' },
  ],
},
```

---

## Tailwind Config

Tailwind CSS v4 uses CSS-first configuration rather than a `tailwind.config.ts` file. Brand tokens go directly in `globals.css` using CSS custom properties with the `@theme` directive.

**`app/globals.css`:**

```css
@import "tailwindcss";

@theme {
  /* Brand colors from index.html */
  --color-primary: #0066cc;
  --color-primary-dark: #0052a3;
  --color-secondary: #00a86b;
  --color-secondary-dark: #008055;

  /* Hero gradient stops */
  --color-hero-from: #667eea;
  --color-hero-to: #764ba2;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

These tokens are then available as Tailwind utilities:
- `bg-primary` → `background-color: #0066cc`
- `text-secondary` → `color: #00a86b`
- `bg-hero-from` / `bg-hero-to` for gradient use

**Hero gradient usage:**

```tsx
<div className="bg-gradient-to-r from-[#667eea] to-[#764ba2]">
```

Or with the theme tokens:
```tsx
<div className="bg-gradient-to-br from-hero-from to-hero-to">
```

**Verify token availability** by running `npx tailwindcss --input app/globals.css --output /tmp/out.css` and checking the output includes the token values.

---

## Environment Variables

### `.env.local` (local development)

```bash
# ============================================================
# SUPABASE — CRITICAL: use port 6543 (PgBouncer) for DATABASE_URL
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # from supabase start output
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # from supabase start output — NEVER NEXT_PUBLIC_

# PgBouncer pooler — port 6543, prepare: false required
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54329/postgres?pgbouncer=true

# Direct connection — migrations only, never used at runtime
DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# ============================================================
# SANITY
# ============================================================
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz   # from Sanity dashboard
NEXT_PUBLIC_SANITY_DATASET=production

# Server-only tokens — NO NEXT_PUBLIC_ prefix
SANITY_API_READ_TOKEN=sk...               # from Sanity → API → Tokens
SANITY_WEBHOOK_SECRET=your-webhook-secret # generate: openssl rand -base64 32
```

### Production `.env` (Vercel)

Replace local values with production Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # from Supabase dashboard → API
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # from Supabase dashboard → API — keep in Vercel secrets

# PgBouncer pooler — port 6543
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Direct — for migration runs from CI only
DIRECT_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=sk...
SANITY_WEBHOOK_SECRET=...
```

### Variable classification

| Variable | Public (`NEXT_PUBLIC_`) | Vercel required |
|----------|------------------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Yes |
| `DATABASE_URL` | **No** | Yes |
| `DIRECT_URL` | **No** | Yes (or CI only) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Yes |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | Yes |
| `SANITY_API_READ_TOKEN` | **No** | Yes |
| `SANITY_WEBHOOK_SECRET` | **No** | Yes |

**Rule:** `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. It must never appear in any `NEXT_PUBLIC_` variable or client-side code. If this key leaks, any user can read/write any row in the database.

---

## Vercel Deployment

### 1. Connect the Repository

- Go to vercel.com → New Project → Import from GitHub
- Select the `clinicaltocode` repo
- Framework: **Next.js** (auto-detected)
- Root directory: `.` (project root, not a subdirectory)

### 2. Set Environment Variables Before First Deploy

In the Vercel project settings → Environment Variables, add every variable from the production list above. Set each to apply to **Production** and **Preview** environments. This must happen before the first deploy — a deploy without `NEXT_PUBLIC_SUPABASE_URL` will build but crash at runtime.

Set `DATABASE_URL` with the PgBouncer port 6543 URL **first**, before any other Supabase variable. This is the first env var to configure per the project decision.

### 3. First Deploy

Push to `main` (or trigger via Vercel dashboard). Vercel will:
1. Install dependencies
2. Run `next build` — TypeScript type checking + static generation
3. Deploy to a preview URL like `clinicaltocode-[hash].vercel.app`

### 4. Apply Migrations to Production

After first deploy, apply the baseline migration to the production Supabase project:

```bash
supabase db push --db-url "$DIRECT_URL"
```

This uses the **direct** connection (port 5432), not the pooler — migrations require a persistent connection that PgBouncer transaction mode does not support.

### 5. Verify Build

Check Vercel build logs for:
- No TypeScript errors
- No "Missing environment variable" errors
- `✓ Compiled successfully`

---

## Validation Architecture

How to prove each of the 5 success criteria is met.

### Criterion 1: vercel.app preview URL loads without errors

**Check:**
1. Open the Vercel preview URL in an incognito browser tab
2. Open DevTools → Console — no red errors
3. Open DevTools → Network — no 500 or 404 responses on page load
4. Vercel → Deployments → click the deployment → Functions tab — no runtime errors on first load

**What would cause failure:** Missing env vars, Tailwind config errors, import errors in `app/layout.tsx`.

### Criterion 2: Supabase connected via PgBouncer port 6543, test query executes from Server Component

**Check:**
Add a temporary test to `app/page.tsx` (remove before final commit):

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('_test').select('1').limit(1)
  // Even if the table doesn't exist, no error means the connection worked
  // A connection error (not a "relation does not exist" error) means PgBouncer is broken

  console.log('Supabase connection test:', error?.message ?? 'connected')
  return <div>Foundation ready</div>
}
```

A `relation "_test" does not exist` error is a **pass** — it means the connection to Postgres via PgBouncer worked and returned a real database error. A `connect ECONNREFUSED` or `sorry, too many clients` error is a **fail** — the pooler URL or port is wrong.

**Alternatively**, add a dedicated `/api/health` route:

```ts
// app/api/health/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { error } = await supabase.from('_nonexistent').select('1').limit(1)
  const connected = !error || error.code === 'PGRST116' || error.message.includes('does not exist')
  return NextResponse.json({ supabase: connected ? 'ok' : 'error', detail: error?.message })
}
```

Curl the deployed URL: `curl https://[preview].vercel.app/api/health`

Expected response: `{"supabase":"ok","detail":"relation \"_nonexistent\" does not exist"}`

### Criterion 3: Sanity Studio loads at /studio in development

**Check:**
```bash
npm run dev
```
Open `http://localhost:3000/studio` in the browser. Expected: Sanity Studio UI renders with login prompt or empty schema editor — no white screen, no 404, no "undefined is not an object" errors.

**What would cause failure:** Missing `[[...tool]]` route catch-all, wrong project ID in `sanity.config.ts`, `next-sanity` not installed, missing `serverExternalPackages` in `next.config.ts`.

### Criterion 4: All env vars set in Vercel, build passes

**Check:**
1. Go to Vercel project → Settings → Environment Variables — verify all 9 variables from the production list are present
2. Go to Vercel → Deployments → latest deployment — verify Build Logs show `✓ Compiled successfully` with no warnings about missing env vars
3. Run `next build` locally (`npm run build`) against the production env vars to replicate the build check:

```bash
# Copy .env.local to .env.production.local temporarily, or use:
npx dotenv -e .env.local -- next build
```

A clean build with `0 errors` is the pass condition.

### Criterion 5: supabase db push applies baseline migration, schema version-controlled

**Check:**
```bash
# Apply to local
supabase db reset

# Verify the migration was applied
supabase db diff
```

`supabase db diff` should show no diff — the local database matches the migration files.

Apply to production:
```bash
supabase db push --db-url "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
```

Expected output: `Applying migration [timestamp]_baseline.sql... done`

Verify in Supabase dashboard → SQL Editor:
```sql
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5;
```

The baseline migration timestamp should appear in the results. **Version control check:** `supabase/migrations/` directory exists in git with at least one `.sql` file committed.

---

## Key Risks to Mitigate During Implementation

1. **PgBouncer port 6543 vs 5432** — triple-check every occurrence of `DATABASE_URL`. The pooler URL contains `pooler.supabase.com:6543`. If you see `db.[ref].supabase.co:5432` in `DATABASE_URL`, it's wrong.

2. **`SUPABASE_SERVICE_ROLE_KEY` leaking to client** — search the codebase for `SUPABASE_SERVICE_ROLE_KEY` before every deploy and confirm it appears only in server-side files (server components, API routes, server actions, middleware).

3. **Sanity Studio `[[...tool]]` route** — the double bracket catch-all is required. `app/studio/page.tsx` alone is not sufficient; Studio's internal navigation will 404.

4. **`prepare: false` for Drizzle** — when Drizzle is configured in a later phase, this flag is non-negotiable with PgBouncer transaction mode.

5. **Migration discipline from day one** — never use the Supabase dashboard SQL editor to create tables. Every schema change goes through `supabase migration new` → commit the file → `supabase db push`.

---

*Phase: 01-foundation*
*Research authored: 2026-03-15*
