# Directory Structure & File Organization

## Complete Directory Layout

```
/Users/potts/Claude Projects/clinicaltocode/
├── .git/                          # Git repository metadata
├── .claude/                        # Claude Code & development tooling
│   ├── commands/gsd/              # "Get Shit Done" command templates
│   ├── get-shit-done/             # GSD framework
│   │   ├── bin/
│   │   │   ├── gsd-tools.cjs      # Main GSD CLI tool
│   │   │   └── lib/               # GSD library modules
│   │   ├── references/            # GSD documentation & guides
│   │   └── templates/             # GSD templates (DEBUG, UAT, UI-SPEC, VALIDATION)
│   └── hooks/                     # Custom Git hooks
├── .planning/                     # Planning & documentation (created)
│   └── codebase/                  # Architecture & structure docs
│       ├── ARCHITECTURE.md        # Architecture patterns & design
│       └── STRUCTURE.md           # This file - directory layout
├── app/                           # Next.js App Router directory
│   ├── layout.js                  # Root layout component (RootLayout export)
│   ├── page.js                    # Home page component (/ route)
│   └── globals.css                # Global CSS for article pages
├── components/                    # React components (REFERENCED, NOT YET CREATED)
│   ├── Navigation.jsx             # Header with navigation menu
│   ├── Hero.jsx                   # Hero banner section
│   ├── ArticleCard.jsx            # Article preview card component
│   ├── Sidebar.jsx                # Sticky sidebar widget container
│   ├── Footer.jsx                 # Footer section
│   └── NewsletterSignup.jsx       # Email subscription widget
├── lib/                           # Utility functions (REFERENCED, NOT YET CREATED)
│   └── posts.js                   # getAllPosts() function for markdown processing
├── content/                       # Markdown content files (ASSUMED, NOT YET CREATED)
│   └── posts/                     # Blog post markdown files
│       ├── article-1.md           # Markdown format with YAML frontmatter
│       ├── article-2.md
│       └── ...more posts
├── public/                        # Static assets
│   └── .gitkeep                   # Placeholder
├── package.json                   # NPM dependencies & scripts
├── index.html                     # Static HTML fallback (complete self-contained page)
└── README.md                      # Not present - MISSING

Legend:
[✓] = File/Directory Exists
[?] = Referenced but Not Yet Created
[!] = Missing but Expected
```

---

## Detailed File Descriptions

### Root Configuration Files

#### `/Users/potts/Claude Projects/clinicaltocode/package.json`
**Type**: NPM Configuration
**Purpose**: Project metadata, dependencies, build scripts
**Content**:
- `name`: "clinical-to-code"
- `version`: "0.1.0"
- `private`: true
- **Scripts**:
  - `dev`: `next dev` - Development server
  - `build`: `next build` - Production build
  - `start`: `next start` - Production server
  - `lint`: `next lint` - Code linting
- **Dependencies**:
  - next@14.0.0 - Framework
  - react@^18 - UI library
  - react-dom@^18 - DOM rendering
  - gray-matter@^4.0.3 - YAML frontmatter parsing
  - remark@^14.0.2 - Markdown parser
  - remark-html@^15.0.1 - Markdown to HTML converter
  - date-fns@^2.29.3 - Date formatting utilities
**Status**: Exists ✓

#### `/Users/potts/Claude Projects/clinicaltocode/index.html`
**Type**: Static HTML
**Purpose**: Standalone HTML version of the site (serves as reference/CDN backup)
**Content**: Complete static website with:
- Inline CSS (1000+ lines)
- Inline JavaScript (client-side functionality)
- All styling and interaction logic embedded
- Sample article cards with hardcoded content
- Navigation, hero, footer, sidebar - all static
**Status**: Exists ✓
**Size**: ~788 lines
**Note**: Appears to be generated/compiled version of JSX components + styling

---

### Next.js Application Directory

#### `/Users/potts/Claude Projects/clinicaltocode/app/layout.js`
**Type**: Root Layout Component (Server Component)
**Purpose**: Wraps entire application, provides metadata, analytics
**Exports**: `metadata` object, `RootLayout` component
**Metadata Includes**:
- SEO: title, description, keywords
- OpenGraph: og:title, og:description, og:image, og:url
- Twitter Card: twitter:card, twitter:title, twitter:description
- Google verification code placeholder
**Features**:
- Google Analytics script (placeholder ID: G-XXXXXXXXXX)
- Google AdSense integration (commented out)
- HTML structure: `<html>`, `<head>`, `<body>`
- Accepts children prop for page content
**Status**: Exists ✓
**Size**: 60 lines
**Pattern**: React 18 Server Component (async by default)

#### `/Users/potts/Claude Projects/clinicaltocode/app/page.js`
**Type**: Home Page Component (Server Component)
**Purpose**: Renders homepage (/ route)
**Renders**:
1. Navigation component
2. Hero component
3. Stats bar (500+ contributors, 15+ years experience, Bridge Clinical-IT Gap, Real Frontline Insights)
4. Main content section:
   - Articles grid (first 4 posts)
   - Ad space placeholder
   - Articles grid (next 2 posts)
   - Sidebar with recent posts (max 5), newsletter, ads, resources
5. Newsletter signup component
6. Footer component
**Data Fetching**:
- Server-side async function: `getAllPosts()`
- Source: `../lib/posts`
- Returns array of post objects
**Status**: Exists ✓
**Size**: 69 lines
**Pattern**: React 18 Server Component with async/await

#### `/Users/potts/Claude Projects/clinicaltocode/app/globals.css`
**Type**: Global CSS
**Purpose**: Styles for article pages and shared components
**Selectors**:
- `.article-container` - Max width container for article layout
- `.article-header` - Article title and metadata area
- `.article-header h1` - Article title styling
- `.article-meta` - Author, date, read time display
- `.content-body` - Article body typography (h2, h3, p, lists, blockquotes)
- `.ad-space-article` - Advertisement placeholder styling
**Color Variables Used**: var(--primary), var(--bg-light), var(--border), var(--text-primary), var(--text-secondary)
**Status**: Exists ✓
**Size**: 70 lines
**Note**: Minimal CSS - heavy reliance on inline styles in index.html

---

### Components Directory (Not Yet Created)

**Location**: `/Users/potts/Claude Projects/clinicaltocode/components/`

#### Referenced Components in page.js:
1. **Navigation**
   - Path: `../components/Navigation`
   - Purpose: Header with sticky positioning, nav menu, mobile toggle
   - Expected Props: (none - hardcoded content)
   - Expected Exports: Navigation component

2. **Hero**
   - Path: `../components/Hero`
   - Purpose: Banner section with h1, subtitle, CTA buttons
   - Expected Props: (none - hardcoded content)
   - Expected Exports: Hero component

3. **ArticleCard**
   - Path: `../components/ArticleCard`
   - Purpose: Reusable card displaying article preview
   - Expected Props: `{ post }`
   - Expected Data: `post.slug`, `post.title`, `post.excerpt`, `post.date`, `post.category`, `post.readTime`
   - Expected Exports: ArticleCard component

4. **Sidebar**
   - Path: `../components/Sidebar`
   - Purpose: Sticky sidebar with widgets (trending, newsletter, ads, resources)
   - Expected Props: `{ recentPosts }`
   - Expected Exports: Sidebar component

5. **Footer**
   - Path: `../components/Footer`
   - Purpose: Multi-column footer with sections
   - Expected Props: (none - hardcoded content)
   - Expected Exports: Footer component

6. **NewsletterSignup**
   - Path: `../components/NewsletterSignup`
   - Purpose: Email subscription widget
   - Expected Props: (none - hardcoded content)
   - Expected Exports: NewsletterSignup component

**Status**: Not Created ? (Referenced but missing)

---

### Utilities Directory (Not Yet Created)

**Location**: `/Users/potts/Claude Projects/clinicaltocode/lib/`

#### Referenced Utility Files:

1. **posts.js**
   - Path: `../lib/posts`
   - Purpose: Content management - read, parse, and return markdown files
   - Expected Exports: `getAllPosts()`
   - Expected Function Signature: `async function getAllPosts() => Promise<Post[]>`
   - Expected Implementation:
     - Read markdown files from `content/posts/` directory
     - Use `gray-matter` to extract frontmatter (YAML) and content
     - Use `remark` + `remark-html` to convert markdown to HTML
     - Return array of post objects with:
       - `slug` - URL-friendly identifier
       - `title` - Article title
       - `excerpt` - Brief description
       - `content` - HTML body
       - `date` - Publication date (ISO string)
       - `category` - Article category
       - `author` - Author name
       - `readTime` - "5 min read" format
   - Usage: Called from `app/page.js` server component

**Status**: Not Created ? (Referenced but missing)

---

### Content Directory (Not Yet Created)

**Location**: `/Users/potts/Claude Projects/clinicaltocode/content/`

**Assumed Structure**:
```
content/
└── posts/
    ├── why-ehr-failing-nurses.md
    ├── er-doctor-epic-builder.md
    ├── medication-errors-cpoe.md
    ├── hidden-47-clicks.md
    ├── clinicians-learn-sql.md
    └── [more posts...]
```

**Markdown File Format**:
```markdown
---
title: "Why Your EHR is Failing Nurses: A 20-Year ICU Veteran's Perspective"
description: "After two decades at the bedside, I've seen every EHR implementation mistake."
date: "2024-01-15"
category: "Nurse's View"
author: "Author Name"
readTime: "5"
slug: "why-ehr-failing-nurses"
---

# Article Title

Article content in markdown format...

## Subsection

More content...
```

**Expected Post Categories**:
- "Nurse's View"
- "Physician's Take"
- "Pharmacist's Insight"
- "Clinical Workflow"
- "Clinical Informatics"

**Status**: Not Created ? (Assumed but missing)

---

### Public Assets Directory

#### `/Users/potts/Claude Projects/clinicaltocode/public/`
**Type**: Static assets directory
**Purpose**: Serve images, icons, fonts, and other static files
**Contents**:
- `.gitkeep` - Placeholder (directory is empty)
**Expected Contents** (not yet created):
- `og-image.jpg` - Open Graph image (1200x630px, referenced in layout.js)
- `favicon.ico` - Site favicon
- `logo.svg` - Logo file
- `/images/` - Article hero images, social media images
**Status**: Exists but empty ?

---

### Claude Development Tools Directory

#### `/Users/potts/Claude Projects/clinicaltocode/.claude/`
**Type**: Development framework directory
**Purpose**: Houses "Get Shit Done" (GSD) framework and related tools
**Subdirectories**:
- `commands/gsd/` - Command templates for project management
- `get-shit-done/` - Main GSD framework with CLI tools
- `hooks/` - Git hooks for automation

**Key Files**:
- `get-shit-done/bin/gsd-tools.cjs` - Main CLI entry point
- `get-shit-done/bin/lib/*.cjs` - Module libraries for GSD functionality
- `get-shit-done/references/*.md` - Documentation and guides
- `get-shit-done/templates/*.md` - Markdown templates (DEBUG, UAT, UI-SPEC, VALIDATION)

**Status**: Exists ✓ (developer tools, not application code)

---

### Planning Directory

#### `/Users/potts/Claude Projects/clinicaltocode/.planning/`
**Type**: Planning and documentation
**Purpose**: Store architecture, structure, and planning documents
**Contents**:
- `codebase/ARCHITECTURE.md` - This file - architecture patterns
- `codebase/STRUCTURE.md` - Directory structure documentation

**Status**: Created ✓

---

## Naming Conventions

### File Naming
- **Components**: PascalCase (e.g., `Navigation.jsx`, `ArticleCard.jsx`)
- **Utilities**: camelCase (e.g., `posts.js`)
- **Styles**: lowercase-kebab-case (e.g., `globals.css`)
- **Markdown files**: lowercase-kebab-case (e.g., `why-ehr-failing-nurses.md`)
- **Next.js special files**: lowercase (e.g., `layout.js`, `page.js`)

### CSS Class Naming
- **BEM-ish methodology**: `.block`, `.block__element`, `.block--modifier`
- Examples:
  - `.article-container`
  - `.article-header`
  - `.article-card`
  - `.article-card:hover`
  - `.article-meta`
  - `.sidebar-widget`
  - `.sidebar-widget h3`
  - `.newsletter-form`
  - `.newsletter-form input`
  - `.newsletter-form button`

### Component Props
- Post object structure: `{ slug, title, excerpt, content, date, category, author, readTime }`
- Component receives: `recentPosts` (array), `post` (object)

---

## Key File Locations

| Purpose | File Path | Status |
|---------|-----------|--------|
| Root configuration | `package.json` | ✓ Exists |
| HTML entry point | `index.html` | ✓ Exists |
| Root layout | `app/layout.js` | ✓ Exists |
| Home page | `app/page.js` | ✓ Exists |
| Global styles | `app/globals.css` | ✓ Exists |
| Components | `components/*.jsx` | ? Not created |
| Post utility | `lib/posts.js` | ? Not created |
| Markdown posts | `content/posts/*.md` | ? Not created |
| Planning docs | `.planning/codebase/` | ✓ Created |

---

## What Exists vs What's Missing

### What Exists
- [✓] Next.js project structure with App Router
- [✓] Root layout with metadata and analytics setup
- [✓] Home page component with page layout skeleton
- [✓] Global CSS for article-specific styling
- [✓] Static HTML fallback version
- [✓] NPM package.json with all dependencies
- [✓] Git repository initialized
- [✓] Development tooling (.claude directory with GSD framework)

### What's Missing (But Referenced)
- [?] Component files (Navigation, Hero, ArticleCard, Sidebar, Footer, NewsletterSignup)
  - **Blocked by**: No `.jsx` files in `components/` directory
  - **Next step**: Create React components from static HTML structure

- [?] Markdown content files
  - **Blocked by**: No `content/posts/` directory
  - **Next step**: Create blog post markdown files with YAML frontmatter

- [?] Post utility function (getAllPosts)
  - **Blocked by**: No `lib/posts.js` file
  - **Next step**: Implement markdown file reading and parsing logic

- [?] Dynamic article routing
  - **Blocked by**: No `app/articles/[slug]/page.js` file
  - **Next step**: Create dynamic route for individual articles

- [?] Search functionality
  - **Blocked by**: No search component or API route
  - **Next step**: Implement full-text search

- [?] README.md documentation
  - **Blocked by**: Missing project documentation
  - **Next step**: Create comprehensive README

- [?] Environment configuration
  - **Blocked by**: No `.env.local` or `.env.example`
  - **Next step**: Add environment variables for API keys

- [?] Next.js configuration (next.config.js)
  - **Status**: Using default Next.js config
  - **May need**: For custom webpack, image optimization, etc.

- [?] TypeScript types
  - **Status**: Using JavaScript only
  - **Optional**: Add TypeScript for type safety

---

## Architecture Pattern Observations

### Strengths
1. **Clean separation**: Logic (Next.js) vs Presentation (React) vs Content (Markdown)
2. **Static generation potential**: Markdown-based content enables SSG/ISR
3. **Ad-ready**: Multiple ad space placeholders for monetization
4. **Responsive design**: Mobile-first CSS with breakpoints
5. **Analytics integrated**: Google Analytics and tracking ready

### Gaps
1. **Component isolation**: page.js imports components that don't exist as files yet
2. **Missing data layer**: getAllPosts() referenced but not implemented
3. **No fallback**: Index.html is standalone, not integrated with Next.js build
4. **Incomplete routing**: Dynamic article pages not yet defined
5. **No API layer**: Newsletter, search, and other features would need backend

---

## Directory Size and Organization

**Current Project Size**: ~100KB (mostly git history)
**Source Code**: ~2KB (3 JS files + 1 CSS file)
**Static HTML**: ~40KB (index.html with inline styles/scripts)
**Tooling**: ~30KB (.claude directory)

**Organization Quality**: Moderate
- Proper Next.js structure in place
- Clear component requirements understood
- Content strategy defined (markdown-based)
- Missing implementation details

---

## Development Workflow Notes

### To Complete the Project:
1. Create component directory structure
2. Extract React components from index.html structure
3. Create `lib/posts.js` with markdown parsing
4. Create `content/posts/` with markdown files
5. Implement dynamic article routes
6. Add TypeScript (optional but recommended)
7. Connect to email service provider
8. Set up real Google Analytics and AdSense
9. Create comprehensive README and setup documentation
10. Add tests for components and utilities

### Build & Deploy
- **Development**: `npm run dev` → localhost:3000
- **Production**: `npm run build && npm start`
- **Static Export**: Can use `next export` for static hosting
- **Deployment**: Vercel recommended (native Next.js support)
