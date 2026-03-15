# Architecture Documentation

## Project Overview
**Clinical to Code** is a Next.js 14 blog platform designed to bridge clinical expertise with healthcare IT innovation. It serves as a content hub for healthcare professionals sharing perspectives on EHR systems, clinical workflows, and healthcare technology solutions.

**Stack:**
- Framework: Next.js 14.0.0 (React 18)
- Rendering Strategy: SSR/SSG hybrid with server-side data fetching
- Styling: CSS with CSS variables for theming
- Markdown Processing: gray-matter + remark + remark-html for MDX-style content handling
- Date Utilities: date-fns for date formatting

---

## Architectural Pattern

### Layer Architecture
The application follows a **component-based architecture** with clear separation of concerns:

1. **Framework Layer**: Next.js App Router (13+ direction)
   - Server Components: `app/layout.js`, `app/page.js`
   - Hybrid rendering (SSR for dynamic content, SSG for static)

2. **Presentation Layer**: React Components
   - Location: `components/` (referenced but not yet materialized)
   - Components: Navigation, Hero, ArticleCard, Sidebar, Footer, NewsletterSignup
   - Styling: Global CSS (`app/globals.css`) + inline styles in HTML entry point

3. **Data Layer**: Markdown-based Content
   - Format: Markdown files with YAML frontmatter (gray-matter)
   - Assumed location: `content/` or `posts/` directory (referenced but not yet materialized)
   - Processing: remark pipeline for HTML conversion

4. **Integration Points**:
   - Google Analytics integration (placeholder: `G-XXXXXXXXXX`)
   - Google AdSense (commented out, ready for activation)
   - Newsletter signup form handler
   - Mobile menu toggle logic

---

## Data Flow

### Content Pipeline
1. **Source**: Markdown files with YAML frontmatter
2. **Processing**:
   - `gray-matter` extracts metadata and content
   - `remark` + `remark-html` converts markdown to HTML
   - `date-fns` formats publication dates
3. **Consumption**: Server-side function `getAllPosts()` fetches and parses
4. **Display**: ArticleCard components render in grid layout

### Page Rendering Flow
1. **Home Page** (`app/page.js` - Server Component)
   - Calls `getAllPosts()` asynchronously
   - Renders fixed layout: Navigation → Hero → Stats → Articles Grid → Sidebar
   - First 4 articles displayed, ad space, then next 2 articles
   - Sidebar with recent posts (5 max), newsletter signup, resources

2. **Individual Article Pages** (implied but not yet implemented)
   - Dynamic routes: `[slug]` (referenced in CSS: `.article-container`, `.article-header`)
   - Markdown content → HTML conversion
   - Metadata rendering: title, date, author, read time

---

## Key Abstractions

### Components (Architecture)
- **Navigation**: Header with sticky positioning, mobile menu toggle, navigation links
- **Hero**: Gradient background banner with main CTA buttons
- **ArticleCard**: Reusable card component with image placeholder, metadata, excerpt, read-more link
- **Sidebar**: Sticky widget layout with trending topics, newsletter, ads, resources
- **Footer**: Multi-column footer with sections: About, Clinical Topics, IT Solutions, Connect
- **NewsletterSignup**: Email subscription widget with form handler
- **Stats Bar**: Display metrics about platform (500+ contributors, 15+ years experience, etc.)

### Data Abstractions
- **Post Object**: `{ slug, title, content, metadata, date, category, excerpt }`
- **Metadata**: YAML frontmatter: `title`, `description`, `date`, `category`, `author`, `readTime`

---

## Entry Points

### Primary Entry Point
- **File**: `/Users/potts/Claude Projects/clinicaltocode/app/page.js`
- **Route**: `/` (home page)
- **Rendering**: Server-side with async data fetching
- **Layout**: Uses root layout (`app/layout.js`)

### HTML Entry Point (Fallback/Static)
- **File**: `/Users/potts/Claude Projects/clinicaltocode/index.html`
- **Purpose**: Standalone HTML version (likely for reference or CDN deployment)
- **Content**: Complete static site with inline styles and script

### Root Layout
- **File**: `/Users/potts/Claude Projects/clinicaltocode/app/layout.js`
- **Metadata**: OpenGraph, Twitter Card, Google Analytics script
- **Children**: Wraps all page content with `<html>`, `<head>`, `<body>` tags

---

## Routing Strategy

### Next.js App Router Structure
```
/app
  ├── layout.js       (Root layout with metadata, analytics)
  ├── page.js         (Home page - /route)
  └── globals.css     (Global styles)
```

### Implied Future Routes (Not Yet Implemented)
- `/articles/[slug]` - Individual article pages (structure hinted at in globals.css)
- `/search` - Search functionality (not yet built)
- `/about` - About page (mentioned in navigation but not implemented)

---

## Rendering Strategy

### Current Implementation
**Hybrid SSR/SSG** via Next.js:
- **Home Page**: SSR with server-side `getAllPosts()` call
- **Static Assets**: CSS, public files via `/public` directory
- **Analytics**: Client-side Google Analytics in `<head>`

### Rendering Modes by Route
| Route | Mode | Trigger |
|-------|------|---------|
| `/` (home) | SSR | Server-side async data fetch |
| `/article/[slug]` | SSG (implied) | Build-time generation or on-demand ISR |
| `/public/*` | Static | Served as-is |

### Build Output
- Next.js generates optimized bundles
- CSS: Global styles from `globals.css` + inline styles in HTML fallback
- JavaScript: React components compiled, dynamic imports optimized

---

## Page Structure

### Home Page (`/`)
```
<root-layout>
  <header>Navigation (sticky)</header>
  <section>Hero with CTA buttons</section>
  <section>Stats bar (4 metrics)</section>
  <main>
    <section>Articles grid
      - Article cards (4)
      - Ad space (1)
      - Article cards (2)
    </section>
    <aside>Sidebar (sticky)
      - Trending topics widget
      - Newsletter signup widget
      - Ad space widget
      - Resources widget
    </aside>
  </main>
  <section>Newsletter signup (repeated)</section>
  <footer>Multi-column footer</footer>
</root-layout>
```

### Content Structure (Markdown Files - Assumed)
```yaml
---
title: "Article Title"
description: "Brief description"
date: "2024-01-15"
category: "Nurse's View" | "Physician's Take" | "Pharmacist's Insight" | "Clinical Workflow" | "Clinical Informatics"
author: "Author Name"
readTime: "5 min read"
slug: "article-url-slug"
---

# Article Content in Markdown
```

---

## Styling Architecture

### CSS Organization
- **Global Styles**: `app/globals.css` (minimal - only article-specific styles)
- **Inline Styles**: `index.html` contains complete design system inline

### Design System
**Color Palette** (CSS Variables):
- `--primary: #0066cc` (blue)
- `--primary-dark: #0052a3` (dark blue)
- `--secondary: #00a86b` (green)
- `--text-primary: #1a1a1a` (dark text)
- `--text-secondary: #666` (gray text)
- `--bg-light: #f8f9fa` (light background)
- `--border: #e5e7eb` (border color)
- `--white: #ffffff`
- `--shadow: 0 1px 3px rgba(0,0,0,0.12)`
- `--shadow-lg: 0 10px 40px rgba(0,0,0,0.15)`

**Typography**:
- Font Family: System UI stack (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, etc.)
- Base Font Size: Varies by component (14px-48px)
- Line Height: 1.6-1.8 for body content

**Responsive Breakpoints**:
- Breakpoint: `@media (max-width: 768px)`
- Mobile optimizations: Single column layout, hidden nav menu, hamburger toggle

---

## External Integrations

### Google Analytics
- **Status**: Integrated but placeholder IDs
- **Tracking ID**: `G-XXXXXXXXXX` (to be replaced)
- **Script**: Loaded in `<head>` of root layout
- **Purpose**: Page views, engagement metrics, Core Web Vitals tracking

### Google AdSense
- **Status**: Commented out (ready for activation)
- **Ad Space**: Placeholder divs with IDs (`#ad-content-1`, etc.)
- **Classes**: `.ad-space` and `.ad-space-article` for styling
- **Purpose**: Revenue generation

### Newsletter Service
- **Form Handling**: Client-side JavaScript (currently shows alert)
- **Ready for**: Email service provider integration (Mailchimp, ConvertKit, etc.)

---

## Performance Considerations

### Core Web Vitals Monitoring
- LCP (Largest Contentful Paint) tracking implemented
- FID (First Input Delay) tracking implemented
- Monitoring logged to console for optimization

### Optimization Opportunities
- Image lazy loading (not yet implemented for article cards)
- Static generation for article pages (ISR recommended)
- CSS-in-JS or utility framework (currently using inline styles)
- Minification of inline styles in index.html

---

## Content Categories

The platform focuses on clinical perspectives:
1. **Nurse's View**: Nursing workflow insights
2. **Physician's Take**: Doctor/physician perspectives
3. **Pharmacist's Insight**: Pharmacy and medication-related topics
4. **Clinical Workflow**: General clinical process improvements
5. **Clinical Informatics**: Data, IT, and informatics career paths

---

## Code References

### Component Imports (app/page.js)
- `Navigation` - Header navigation component
- `Hero` - Landing section component
- `ArticleCard` - Reusable article preview component
- `Sidebar` - Content sidebar widget container
- `Footer` - Footer navigation and info section
- `NewsletterSignup` - Email signup widget

### Utility Function
- `getAllPosts()` from `lib/posts` - Fetches and processes markdown articles

### Build Commands
```bash
npm run dev     # Development server
npm run build   # Production build
npm start       # Production server
npm run lint    # ESLint check
```

---

## Future Architecture Considerations

1. **Blog System**: Implement dynamic article routing with `[slug]` pages
2. **Database Layer**: Add optional database for comments, analytics, subscriptions
3. **Search**: Implement full-text search across articles
4. **Authors**: Multi-author support with author bios and archives
5. **Comments**: User comments and moderation system
6. **Auth**: Contributor authentication for guest posts
7. **CMS**: Headless CMS integration (Contentful, Strapi, etc.)
8. **API**: REST/GraphQL API for external consumption
