# Phase 1: Foundation - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold the complete tech stack (Next.js 15 + TypeScript + Tailwind CSS + Supabase + Sanity CMS) and deploy a working skeleton to Vercel with all services connected and environment variables configured. No user-facing features — just a verified, deployable foundation.

</domain>

<decisions>
## Implementation Decisions

### Design Tokens & Brand

- **Primary color**: Blue `#0066cc` (keep existing brand)
- **Secondary color**: Green `#00a86b` (keep existing brand)
- **Hero gradient**: Purple `#667eea → #764ba2` (keep existing — distinctive, sets tone)
- **Typography**: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`) — carry forward from index.html
- Encode all brand colors as Tailwind CSS config custom tokens (`primary`, `secondary`) so they're available as utilities throughout the app

### Local Development Setup

- **Database**: Supabase CLI + local Docker — full local Postgres, no network latency, dev/prod separation, migrations run and test locally before applying to cloud
- **Sanity Studio**: Embedded at `/studio` within the Next.js app — single dev server, single Vercel deployment, no separate studio project

### Directory Structure

- **App routing**: Feature-based — `app/articles/`, `app/forum/`, `app/profile/`, `app/admin/` — clear domain boundaries
- **Lib structure**: Subdirectory-based — `lib/supabase/` (client factories: server, browser, admin), `lib/sanity/` (GROQ client + queries), `lib/utils/` (shared helpers)
- **Components**: `components/ui/` for shadcn/ui primitives, `components/` for domain components

### Claude's Discretion

- Specific shadcn/ui component selection — planner picks what's needed for the skeleton
- Exact Tailwind config structure beyond the brand colors above
- ESLint and Prettier config details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — project vision, constraints, core value
- `.planning/REQUIREMENTS.md` — INFRA-01 acceptance criteria for this phase
- `.planning/ROADMAP.md` — Phase 1 success criteria (5 items to verify)

### Research
- `.planning/research/STACK.md` — full stack choices with versions and rationale
- `.planning/research/PITFALLS.md` — critical pitfalls, especially Pitfall 1 (PgBouncer port 6543) and Pitfall 4 (migration discipline)
- `.planning/research/ARCHITECTURE.md` — component boundaries and Sanity + Supabase coexistence pattern

### Design Reference
- `index.html` — complete visual design reference; color scheme, typography, layout structure

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `index.html` — full design reference: nav, hero, stats bar, article cards, sidebar, footer, newsletter, all CSS variables and color tokens
- `app/layout.js` — existing metadata/SEO config (title, description, OG tags, GA placeholder) — port to TypeScript layout.tsx
- `app/globals.css` — article content styles — can be adapted once Tailwind is in place

### Established Patterns
- None from the existing codebase worth carrying forward — it's JavaScript with no TypeScript, no Tailwind, no design system
- This is a clean-slate rebuild; use the research docs as the authoritative pattern source

### Integration Points
- Vercel project already exists (clinicaltocode.com is live) — the rebuild targets the same domain
- New codebase will replace the existing repo contents

</code_context>

<specifics>
## Specific Ideas

- Use `index.html` CSS variables directly as the source of truth when setting up Tailwind config custom colors — exact hex values already defined and used in the live design
- PgBouncer port 6543 must be the FIRST thing configured in `.env.local` — confirmed root cause of v0 site failures

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-15*
