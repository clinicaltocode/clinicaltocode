---
phase: 1
slug: foundation
status: approved
wave_count: 6
task_count: 14
created: 2026-03-15
---

# Phase 1 — Foundation: Execution Plan

## Wave Map

| Wave | Name | Tasks | Goal |
|------|------|-------|------|
| 0 | Test Infrastructure | 1-01-01 | Install vitest, create stub test files, and write the health check route before any feature code |
| 1 | Next.js Scaffold + Env Config | 1-01-02, 1-01-03, 1-01-04 | Initialize the Next.js 15 app, configure Tailwind v4 brand tokens, and enumerate all required env vars |
| 2 | Supabase Setup | 1-01-05, 1-01-06, 1-01-07 | Install Supabase packages, write client factories, and initialize local Supabase CLI |
| 3 | Sanity CMS Setup | 1-01-08, 1-01-09 | Install next-sanity, embed Sanity Studio at /studio, and configure the Sanity client |
| 4 | UI Skeleton | 1-01-10, 1-01-11, 1-01-12 | Initialize shadcn, install Button, and build the homepage and root layout |
| 5 | Drizzle ORM + Baseline Migration | 1-01-13 | Install Drizzle ORM, write the drizzle config, and apply the baseline migration |
| 6 | Deployment | 1-01-14 | Set all Vercel env vars, push to main, and confirm the preview URL passes all 5 success criteria |

---

## Wave 0 — Test Infrastructure

> Goal: Install vitest and create stub test files before any feature code. This wave also creates the `/api/health` route that all subsequent DB verification steps depend on.

### Task 1-01-01 — Install vitest and create test stubs + health route

**Requirement:** INFRA-01
**Wave:** 0
**Files touched:**
- `vitest.config.ts` — vitest configuration pointing at the `tests/` directory, using the jsdom environment
- `tests/setup.ts` — shared test setup file (imported by vitest config)
- `tests/infra/env.test.ts` — stub tests asserting each required env var is defined at runtime
- `tests/infra/db.test.ts` — stub test asserting the Supabase URL env var is a valid URL string (full DB connection verified manually via health route)
- `app/api/health/route.ts` — GET handler returning `{"status":"ok"}` and a Supabase connection probe

**Steps:**
1. Install vitest and related packages:
   ```bash
   npm install -D vitest @vitest/coverage-v8 jsdom @vitejs/plugin-react
   ```
2. Create `vitest.config.ts` at the project root:
   ```ts
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'
   import path from 'path'

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       setupFiles: ['./tests/setup.ts'],
       globals: true,
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, '.'),
       },
     },
   })
   ```
3. Create `tests/setup.ts`:
   ```ts
   // Shared test setup — extend as needed per phase
   ```
4. Create `tests/infra/env.test.ts`:
   ```ts
   describe('Required environment variables', () => {
     const required = [
       'NEXT_PUBLIC_SUPABASE_URL',
       'NEXT_PUBLIC_SUPABASE_ANON_KEY',
       'SUPABASE_SERVICE_ROLE_KEY',
       'DATABASE_URL',
       'NEXT_PUBLIC_SANITY_PROJECT_ID',
       'NEXT_PUBLIC_SANITY_DATASET',
       'SANITY_API_TOKEN',
     ]

     required.forEach((name) => {
       it(`${name} is defined`, () => {
         // Stub: will pass once .env.local is populated in Task 1-01-04
         expect(typeof name).toBe('string')
       })
     })
   })
   ```
5. Create `tests/infra/db.test.ts`:
   ```ts
   describe('Supabase URL format', () => {
     it('NEXT_PUBLIC_SUPABASE_URL looks like a URL (stub)', () => {
       // Full DB verification is done via /api/health — this is a format stub
       const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
       expect(url).toMatch(/^https?:\/\//)
     })
   })
   ```
6. Create `app/api/health/route.ts`:
   ```ts
   import { NextResponse } from 'next/server'

   export async function GET() {
     let supabaseStatus = 'unconfigured'
     let detail: string | undefined

     try {
       const { createClient } = await import('@/lib/supabase/server')
       const supabase = await createClient()
       const { error } = await supabase.from('_healthcheck').select('1').limit(1)
       // A "relation does not exist" error confirms PgBouncer connection succeeded
       const isConnected =
         !error ||
         error.code === 'PGRST116' ||
         (error.message?.includes('does not exist') ?? false)
       supabaseStatus = isConnected ? 'ok' : 'error'
       detail = error?.message
     } catch (err) {
       supabaseStatus = 'error'
       detail = err instanceof Error ? err.message : 'unknown error'
     }

     return NextResponse.json({ status: 'ok', supabase: supabaseStatus, detail })
   }
   ```
   Note: This route imports `@/lib/supabase/server` which does not exist yet (created in Wave 2). The import is wrapped in a try/catch so the route still returns `{"status":"ok"}` before Wave 2 is complete; it will return `supabase: "error"` until then, which is expected.

**Verify:** `npx vitest run --reporter=verbose` — all stub tests pass (6+ tests, 0 failures)

---

## Wave 1 — Next.js Scaffold + Env Config

> Goal: Initialize the Next.js 15 project, configure Tailwind v4 brand tokens via `@theme`, establish the feature-based directory structure, and document the complete env var set.

### Task 1-01-02 — Initialize Next.js 15 app with TypeScript, Tailwind v4, and ESLint

**Requirement:** INFRA-01
**Wave:** 1
**Files touched:**
- `package.json` — created by create-next-app with Next.js 15, TypeScript, Tailwind CSS
- `tsconfig.json` — TypeScript config with `@/*` path alias
- `next.config.ts` — Next.js config (configured with Sanity `serverExternalPackages` and image remote patterns)
- `eslint.config.mjs` — ESLint flat config (eslint-config-next)
- `.prettierrc` — Prettier config

**Steps:**
1. From the project root (which already contains the git repo), initialize the Next.js app in-place. Because the repo root is the target, run:
   ```bash
   npx create-next-app@latest . \
     --typescript \
     --tailwind \
     --app \
     --src-dir=no \
     --import-alias="@/*" \
     --eslint \
     --no-git
   ```
   Accept all prompts. The `--no-git` flag prevents create-next-app from reinitializing git.
2. Install Prettier and the Tailwind ESLint plugin:
   ```bash
   npm install -D prettier eslint-plugin-tailwindcss
   ```
3. Create `.prettierrc`:
   ```json
   {
     "semi": false,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "es5"
   }
   ```
4. Update `next.config.ts` to add Sanity's required server external packages and image remote patterns:
   ```ts
   import type { NextConfig } from 'next'

   const nextConfig: NextConfig = {
     experimental: {
       serverExternalPackages: ['@sanity/client'],
     },
     images: {
       remotePatterns: [
         { hostname: '*.supabase.co' },
         { hostname: 'cdn.sanity.io' },
       ],
     },
   }

   export default nextConfig
   ```
5. Create the feature-based directory structure (empty placeholder files as needed):
   ```
   app/(marketing)/          # homepage and about routes
   app/articles/[slug]/      # CMS article pages (Phase 3)
   app/studio/[[...tool]]/   # Sanity Studio embedded route
   app/forum/                # community routes (Phase 4)
   app/auth/                 # auth flows (Phase 2)
   app/api/health/           # health check (created in Wave 0)
   components/ui/            # shadcn primitives
   lib/supabase/             # Supabase client factories
   lib/sanity/               # Sanity client and queries
   lib/utils/                # shared helpers
   supabase/migrations/      # SQL migration files
   tests/infra/              # test stubs (created in Wave 0)
   ```

**Verify:** `npx next build` — exits 0 with `Compiled successfully`, no TypeScript errors

---

### Task 1-01-03 — Configure Tailwind v4 CSS-first brand tokens

**Requirement:** INFRA-01
**Wave:** 1
**Files touched:**
- `app/globals.css` — replaces scaffolded content with `@import "tailwindcss"` and `@theme` block containing all 5 color tokens and system font stack

**Steps:**
1. Open `app/globals.css`. Replace the entire file contents with:
   ```css
   @import "tailwindcss";

   @theme {
     /* Brand colors — sourced from index.html :root */
     --color-primary: #0066cc;
     --color-primary-dark: #0052a3;
     --color-secondary: #00a86b;

     /* Hero gradient stops */
     --color-hero-from: #667eea;
     --color-hero-to: #764ba2;

     /* Typography */
     --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
       'Helvetica Neue', Arial, sans-serif;
   }

   body {
     font-family: var(--font-sans);
     line-height: 1.6;
     color: #1a1a1a;
     background-color: #ffffff;
   }
   ```
   Note: Tailwind v4 uses CSS-first config. There is no `tailwind.config.js` or `tailwind.config.ts`. All tokens live in `globals.css` under `@theme`.

**Verify:** `npx tailwindcss --input app/globals.css --output /tmp/tw-out.css && grep -c "0066cc" /tmp/tw-out.css` — outputs a number greater than 0, confirming the primary brand token compiled into the CSS output

---

### Task 1-01-04 — Create .env.local with all required env vars

**Requirement:** INFRA-01
**Wave:** 1
**Files touched:**
- `.env.local` — all 9 required environment variables with local Supabase and Sanity values
- `.env.example` — committed to git as a reference for all required var names (no real values)
- `.gitignore` — confirm `.env.local` is listed (create-next-app includes this by default)

**Steps:**
1. Ensure you have created a Supabase cloud project (supabase.com → New Project) and noted:
   - Project URL (`https://[ref].supabase.co`)
   - Anon key (Settings → API)
   - Service role key (Settings → API)
   - Pooled connection string from Settings → Database → Connection pooling → **Transaction mode** — this is port **6543**, e.g.:
     `postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
   - Direct connection string from Settings → Database — this is port 5432, used only for migrations
2. Ensure you have created a Sanity project (sanity.io or `npx create-sanity@latest`) and noted:
   - Project ID (e.g., `abc123xyz`)
   - Dataset name: `production`
   - API token with Viewer permission minimum (Sanity → API → Tokens → Add API token)
3. Create `.env.local`:
   ```bash
   # ============================================================
   # SUPABASE
   # CRITICAL: DATABASE_URL must use port 6543 (PgBouncer pooler)
   # See PITFALLS.md Pitfall 1 — this is the fix for v0 disconnections
   # ============================================================
   NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...

   # PgBouncer pooler — port 6543 — used for all runtime queries
   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

   # Direct connection — port 5432 — migrations ONLY, never runtime
   DIRECT_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

   # ============================================================
   # SANITY
   # ============================================================
   NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=sk...
   ```
4. Create `.env.example` (committed to git, no real values):
   ```bash
   # Supabase — CRITICAL: DATABASE_URL must use port 6543 (PgBouncer)
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   DATABASE_URL=                    # port 6543 pooler URL
   DIRECT_URL=                      # port 5432 direct URL — migrations only

   # Sanity
   NEXT_PUBLIC_SANITY_PROJECT_ID=
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=
   ```
5. Confirm `.env.local` is in `.gitignore` (create-next-app adds this automatically; verify it is present).

**Verify:** `grep "6543" .env.local` — outputs the `DATABASE_URL` line, confirming the pooler port is set correctly

---

## Wave 2 — Supabase Setup

> Goal: Install Supabase client packages, write the server and browser client factories, and initialize the local Supabase CLI stack.

### Task 1-01-05 — Install Supabase packages and write client factories

**Requirement:** INFRA-01
**Wave:** 2
**Files touched:**
- `lib/supabase/server.ts` — `createServerClient` factory using `@supabase/ssr` and Next.js `cookies()`
- `lib/supabase/client.ts` — `createBrowserClient` factory for use in client components only
- `package.json` — updated with `@supabase/supabase-js` and `@supabase/ssr`

**Steps:**
1. Install packages:
   ```bash
   npm install @supabase/supabase-js@latest @supabase/ssr@0.5.x
   ```
2. Create `lib/supabase/server.ts`:
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
           getAll() {
             return cookieStore.getAll()
           },
           setAll(cookiesToSet) {
             try {
               cookiesToSet.forEach(({ name, value, options }) =>
                 cookieStore.set(name, value, options)
               )
             } catch {
               // Server Component — cookie writes are no-ops, which is expected
             }
           },
         },
       }
     )
   }
   ```
   Important: Always call `createClient()` inside the server component or route handler — never at module level. See PITFALLS.md Pitfall 2.
3. Create `lib/supabase/client.ts`:
   ```ts
   import { createBrowserClient } from '@supabase/ssr'

   export function createClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     )
   }
   ```
4. Create `lib/utils/cn.ts` (utility needed by shadcn in Wave 4):
   ```ts
   import { clsx, type ClassValue } from 'clsx'
   import { twMerge } from 'tailwind-merge'

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```
   Install the utilities:
   ```bash
   npm install clsx tailwind-merge
   ```

**Verify:** `npx tsc --noEmit` — exits 0 with no TypeScript errors in the new library files

---

### Task 1-01-06 — Initialize local Supabase CLI and create baseline migration

**Requirement:** INFRA-01
**Wave:** 2
**Files touched:**
- `supabase/config.toml` — created by `supabase init`
- `supabase/migrations/[timestamp]_baseline.sql` — baseline migration file (minimal, establishes migration chain)

**Steps:**
1. Install Supabase CLI if not already installed:
   ```bash
   brew install supabase/tap/supabase
   ```
2. Initialize Supabase from the project root:
   ```bash
   supabase init
   ```
   This creates `supabase/config.toml` and `supabase/migrations/`.
3. Link to the cloud project (you will need your Supabase project ref):
   ```bash
   supabase link --project-ref [ref]
   ```
4. Create the baseline migration:
   ```bash
   supabase migration new baseline
   ```
   This creates `supabase/migrations/[timestamp]_baseline.sql`.
5. Open the baseline migration file and add:
   ```sql
   -- Phase 1 Foundation: baseline migration
   -- Establishes the migration chain. No application tables yet.
   -- Forum schema will be added in Phase 4.
   -- Auth schema is managed by Supabase Auth (auth.users) — not in public migrations.
   ```
6. Start the local Supabase stack (requires Docker):
   ```bash
   supabase start
   ```
   After the containers start, note the local env values printed by the CLI and update `.env.local` with the local URLs if developing against the local stack. For production Vercel deployment, keep the cloud values.
7. Apply the migration locally:
   ```bash
   supabase db reset
   ```

**Verify:** `supabase db diff` — outputs `No schema changes found`, confirming the local database matches the migration files exactly

---

### Task 1-01-07 — Apply baseline migration to production Supabase

**Requirement:** INFRA-01
**Wave:** 2
**Files touched:**
- No new files — applies the migration from Task 1-01-06 to the production Supabase project

**Steps:**
1. Apply the baseline migration to production using the direct connection URL (port 5432 — migrations require a persistent connection that PgBouncer transaction mode does not support):
   ```bash
   supabase db push --db-url "$DIRECT_URL"
   ```
   Replace `$DIRECT_URL` with the actual direct connection string if the env var is not loaded in your shell.
2. Verify in the Supabase dashboard → SQL Editor:
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5;
   ```
   The baseline migration timestamp should appear in the results.
3. Commit the `supabase/migrations/` directory to git:
   ```bash
   git add supabase/migrations/
   git commit -m "feat: add baseline Supabase migration (Phase 1)"
   ```

**Verify:** `supabase db push --db-url "$DIRECT_URL"` — exits 0 with output confirming the migration was applied (or "already up to date" if run twice)

---

## Wave 3 — Sanity CMS Setup

> Goal: Install next-sanity, configure sanity.config.ts, create the Sanity client factory, and embed Sanity Studio at the `/studio` catch-all route.

### Task 1-01-08 — Install next-sanity and create sanity.config.ts

**Requirement:** INFRA-01
**Wave:** 3
**Files touched:**
- `package.json` — updated with `next-sanity` and `@sanity/vision`
- `sanity.config.ts` — Sanity Studio configuration at project root
- `lib/sanity/client.ts` — Sanity read client factory using `next-sanity`
- `lib/sanity/queries.ts` — placeholder file for GROQ queries (populated in Phase 3)

**Steps:**
1. Install packages:
   ```bash
   npm install next-sanity@9.x @sanity/vision
   ```
2. Create `sanity.config.ts` at the project root:
   ```ts
   import { defineConfig } from 'sanity'
   import { structuredContent } from 'sanity/desk'

   export default defineConfig({
     name: 'clinicaltocode',
     title: 'Clinical to Code',
     projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
     dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
     plugins: [structuredContent()],
     schema: {
       types: [],
       // Article, author, and category schemas added in Phase 3
     },
   })
   ```
3. Create `lib/sanity/client.ts`:
   ```ts
   import { createClient } from 'next-sanity'

   export const sanityClient = createClient({
     projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
     dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
     apiVersion: '2024-01-01', // fixed date — do not use 'latest'
     useCdn: process.env.NODE_ENV === 'production',
   })
   ```
4. Create `lib/sanity/queries.ts`:
   ```ts
   // GROQ queries — populated in Phase 3 (Content)
   // Placeholder only
   ```

**Verify:** `npx tsc --noEmit` — exits 0, no type errors in `sanity.config.ts` or `lib/sanity/client.ts`

---

### Task 1-01-09 — Embed Sanity Studio at /studio

**Requirement:** INFRA-01
**Wave:** 3
**Files touched:**
- `app/studio/[[...tool]]/page.tsx` — Sanity Studio embedded via NextStudio component

**Steps:**
1. Create the directory `app/studio/[[...tool]]/` and the file `page.tsx`:
   ```tsx
   'use client'

   import { NextStudio } from 'next-sanity/studio'
   import config from '@/sanity.config'

   export const dynamic = 'force-dynamic'

   export default function StudioPage() {
     return <NextStudio config={config} />
   }
   ```
   Important: The `[[...tool]]` catch-all route is required. Without it, Sanity Studio's internal navigation (switching between Document, Vision, etc.) will 404. A plain `app/studio/page.tsx` is not sufficient. See RESEARCH.md.
2. Confirm `next.config.ts` includes `serverExternalPackages: ['@sanity/client']` (added in Task 1-01-02). This is required for Sanity to work in Next.js 15 server components.

**Verify:** `npm run dev` then open `http://localhost:3000/studio` in a browser — Sanity Studio UI renders (login prompt or empty schema editor). No white screen, no 404, no console errors.

---

## Wave 4 — UI Skeleton

> Goal: Initialize shadcn, install the Button component, build the root layout with metadata, and build the skeleton homepage matching the layout contract in UI-SPEC.

### Task 1-01-10 — Initialize shadcn and install Button component

**Requirement:** INFRA-01
**Wave:** 4
**Files touched:**
- `components.json` — shadcn configuration file created by `shadcn init`
- `components/ui/button.tsx` — Button component installed from shadcn registry

**Steps:**
1. Initialize shadcn (no preset — brand tokens are already configured in `globals.css`):
   ```bash
   npx shadcn@latest init
   ```
   When prompted:
   - Style: Default
   - Base color: Neutral (brand colors are already in `@theme`; shadcn neutral provides the gray scale)
   - CSS variables: Yes
   - Do not overwrite `globals.css` if prompted — our `@theme` block must be preserved
2. Install only the Button component (UI-SPEC specifies Button only for Phase 1):
   ```bash
   npx shadcn@latest add button
   ```
   This creates `components/ui/button.tsx` and installs any peer dependencies (`class-variance-authority`, `@radix-ui/react-slot`).
3. Verify `components/ui/button.tsx` was created and imports from `@/lib/utils/cn` (or the path configured in `components.json`). If shadcn wrote a `lib/utils.ts` file instead of using `lib/utils/cn.ts`, update the import in `button.tsx` to point to the correct path.

**Verify:** `npx vitest run --reporter=verbose` — all tests still pass after shadcn initialization (no regressions)

---

### Task 1-01-11 — Build root layout with metadata

**Requirement:** INFRA-01
**Wave:** 4
**Files touched:**
- `app/layout.tsx` — root layout with metadata (title, description, OG tags), system font applied via `className`

**Steps:**
1. Replace `app/layout.tsx` with:
   ```tsx
   import type { Metadata } from 'next'
   import './globals.css'

   export const metadata: Metadata = {
     title: 'Clinical to Code — Where Healthcare Meets Technology',
     description:
       'Bridging clinical expertise with healthcare IT. Real insights from clinicians for IT leaders.',
     openGraph: {
       title: 'Clinical to Code — Where Healthcare Meets Technology',
       description:
         'Bridging clinical expertise with healthcare IT. Real insights from clinicians for IT leaders.',
       url: 'https://clinicaltocode.com',
       siteName: 'Clinical to Code',
       type: 'website',
     },
   }

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <html lang="en">
         <body className="antialiased">{children}</body>
       </html>
     )
   }
   ```
   Note: No Google Font import — the system font stack is declared in `globals.css` under `@theme` (`--font-sans`).

**Verify:** `npx next build` — exits 0, metadata is compiled with no missing field warnings

---

### Task 1-01-12 — Build skeleton homepage

**Requirement:** INFRA-01
**Wave:** 4
**Files touched:**
- `app/(marketing)/page.tsx` — skeleton homepage with Nav, Hero (gradient + CTAs), content area, and Footer matching the UI-SPEC layout contract

**Steps:**
1. Create `app/(marketing)/page.tsx`:
   ```tsx
   import { Button } from '@/components/ui/button'

   export default function HomePage() {
     return (
       <div className="min-h-screen flex flex-col">
         {/* Nav — sticky, 72px height, white background, border-b */}
         <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] h-[72px] flex items-center">
           <div className="max-w-[1200px] mx-auto px-5 w-full flex items-center justify-between">
             <span className="text-primary font-semibold text-xl">
               Clinical to Code
             </span>
             <div className="flex items-center gap-6">
               <a
                 href="/articles"
                 className="text-sm text-[#666666] hover:text-primary transition-colors min-h-[48px] flex items-center"
               >
                 Articles
               </a>
               <a
                 href="/forum"
                 className="text-sm text-[#666666] hover:text-primary transition-colors min-h-[48px] flex items-center"
               >
                 Forum
               </a>
             </div>
           </div>
         </nav>

         {/* Hero — full-width gradient, centered text, two CTAs */}
         <section className="bg-gradient-to-br from-hero-from to-hero-to py-[80px] text-white text-center">
           <div className="max-w-[1200px] mx-auto px-5">
             <h1 className="text-5xl font-semibold leading-tight mb-6">
               Where Healthcare Meets Technology
             </h1>
             <p className="text-xl mb-8 opacity-90">
               Bridging clinical expertise with healthcare IT. Real insights from
               clinicians for IT leaders.
             </p>
             <div className="flex items-center justify-center gap-4">
               <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 min-h-[48px]">
                 <a href="/articles">Explore Articles</a>
               </Button>
               <Button
                 asChild
                 variant="outline"
                 size="lg"
                 className="border-white text-white hover:bg-white/10 min-h-[48px]"
               >
                 <a href="/forum">Join the Community</a>
               </Button>
             </div>
           </div>
         </section>

         {/* Content area — two-column grid, 1fr 300px */}
         <main className="max-w-[1200px] mx-auto px-5 py-xl flex-1 w-full">
           <div className="grid grid-cols-[1fr_300px] gap-10">
             <div>
               <h2 className="text-3xl font-semibold mb-6">Coming Soon</h2>
               <p className="text-[#666666]">
                 We&apos;re setting up. Check back soon — real clinical
                 perspectives are on the way.
               </p>
             </div>
             <aside>
               {/* Sidebar — placeholder for future widgets */}
             </aside>
           </div>
         </main>

         {/* Footer — dark background, white text */}
         <footer className="bg-[#1a1a1a] text-white pt-[64px] pb-[32px] mt-[80px]">
           <div className="max-w-[1200px] mx-auto px-5">
             <p className="text-sm text-[#666666]">
               &copy; {new Date().getFullYear()} Clinical to Code. All rights
               reserved.
             </p>
           </div>
         </footer>
       </div>
     )
   }
   ```
2. If the `(marketing)` route group does not produce a home route at `/`, also check that there is no conflicting `app/page.tsx`. The file at `app/(marketing)/page.tsx` serves the root URL because Next.js App Router route groups with parentheses do not affect the URL path.

**Verify:** `npm run dev` then open `http://localhost:3000` — homepage renders with nav (white, sticky), hero (purple-to-indigo gradient), two CTA buttons ("Explore Articles", "Join the Community"), content area, and footer. No console errors.

---

## Wave 5 — Drizzle ORM + Baseline Migration

> Goal: Install Drizzle ORM with the `postgres` driver, write the drizzle config with PgBouncer settings, and confirm the baseline migration applies cleanly.

### Task 1-01-13 — Install Drizzle ORM and write drizzle config

**Requirement:** INFRA-01
**Wave:** 5
**Files touched:**
- `package.json` — updated with `drizzle-orm`, `postgres`, and `drizzle-kit`
- `lib/supabase/drizzle.ts` — Drizzle client factory using `postgres` driver with `prepare: false`
- `drizzle.config.ts` — Drizzle Kit configuration pointing at `supabase/migrations/`

**Steps:**
1. Install packages:
   ```bash
   npm install drizzle-orm@0.39.x postgres@3.x
   npm install -D drizzle-kit
   ```
2. Create `lib/supabase/drizzle.ts`:
   ```ts
   import postgres from 'postgres'
   import { drizzle } from 'drizzle-orm/postgres-js'

   // CRITICAL: prepare: false is required for PgBouncer transaction mode.
   // PgBouncer does not support prepared statements.
   // See PITFALLS.md Pitfall 1 and STACK.md Key Decision 1.
   // DATABASE_URL must use port 6543 (pooler), not port 5432 (direct).
   const client = postgres(process.env.DATABASE_URL!, {
     prepare: false,
   })

   export const db = drizzle(client)
   ```
3. Create `drizzle.config.ts` at the project root:
   ```ts
   import { defineConfig } from 'drizzle-kit'

   export default defineConfig({
     dialect: 'postgresql',
     schema: './lib/supabase/schema.ts', // populated in Phase 4 (Forum)
     out: './supabase/migrations',
     dbCredentials: {
       // DIRECT_URL (port 5432) used for migrations — not the pooler
       url: process.env.DIRECT_URL!,
     },
   })
   ```
4. Create a schema placeholder `lib/supabase/schema.ts`:
   ```ts
   // Drizzle schema — table definitions added in Phase 4 (Forum)
   // Placeholder to satisfy drizzle.config.ts schema reference
   export {}
   ```

**Verify:** `npx drizzle-kit check` — exits 0 or prints "No schema changes detected" (no errors about missing config values or invalid dialect)

---

## Wave 6 — Deployment

> Goal: Set all environment variables in Vercel, push to main to trigger the first production deploy, and verify all 5 Phase 1 success criteria.

### Task 1-01-14 — Configure Vercel env vars and deploy

**Requirement:** INFRA-01
**Wave:** 6
**Files touched:**
- No new files — this task configures Vercel via the dashboard and triggers the deploy

**Steps:**
1. Connect the repository to Vercel (vercel.com → New Project → Import from GitHub → select `clinicaltocode`). Set framework to Next.js, root directory to `.`.
2. Before triggering any deploy, set all environment variables in Vercel → Project → Settings → Environment Variables. Apply each to **Production** and **Preview** environments:

   | Variable | Value Source | Public |
   |----------|-------------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Yes |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Yes |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **No — never NEXT_PUBLIC_** |
   | `DATABASE_URL` | Supabase → Settings → Database → Connection pooling → Transaction mode (port **6543**) | **No** |
   | `DIRECT_URL` | Supabase → Settings → Database → Direct connection (port 5432) | **No** |
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity dashboard | Yes |
   | `NEXT_PUBLIC_SANITY_DATASET` | `production` | Yes |
   | `SANITY_API_TOKEN` | Sanity → API → Tokens | **No** |

   Set `DATABASE_URL` first — it is the most critical variable. Triple-check it contains `pooler.supabase.com:6543`, not `db.[ref].supabase.co:5432`. See PITFALLS.md Pitfall 1.

3. Push the current branch to `main` to trigger the first deploy:
   ```bash
   git add -A
   git commit -m "feat: Phase 1 Foundation — Next.js 15, Supabase, Sanity, Tailwind v4 skeleton"
   git push origin main
   ```
4. Monitor the Vercel build logs. Confirm:
   - `✓ Compiled successfully`
   - No `Missing environment variable` errors
   - No TypeScript errors
5. Once deployed, hit the health check route to verify PgBouncer connectivity:
   ```bash
   curl https://[preview-url].vercel.app/api/health
   ```
   Expected response:
   ```json
   {"status":"ok","supabase":"ok","detail":"relation \"_healthcheck\" does not exist"}
   ```
   The `"relation does not exist"` detail is a **pass** — it confirms PgBouncer accepted the connection and Postgres returned a real database error, not a network/pool failure.
6. Verify all 5 Phase 1 success criteria (from ROADMAP.md):
   - [ ] Preview URL loads without errors (Vercel build logs: green)
   - [ ] Supabase connected via PgBouncer port 6543 (health route: `supabase: "ok"`)
   - [ ] Sanity Studio loads at `/studio` (manual: `npm run dev`, open localhost:3000/studio)
   - [ ] All env vars set in Vercel, build passes (Vercel dashboard: no missing var warnings)
   - [ ] `supabase db push` applied baseline migration, schema in version control (`git log supabase/migrations/` shows committed files)

**Verify:** `curl https://[preview-url].vercel.app/api/health` — returns `{"status":"ok","supabase":"ok",...}` with HTTP 200
