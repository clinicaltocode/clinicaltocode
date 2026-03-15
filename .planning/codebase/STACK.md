# Technology Stack

## Project Overview
**Project Name:** Clinical to Code
**Version:** 0.1.0
**Purpose:** A Next.js-based blog/content platform bridging clinical expertise with healthcare IT

## Runtime & Framework

### Core Framework
- **Next.js** v14.0.0 - React-based full-stack framework
  - File: `/Users/potts/Claude Projects/clinicaltocode/package.json`
  - Provides app router, server components, static generation

### JavaScript/Node Runtime
- **Node.js** (inferred from Next.js 14.x requirements)
- **Package Manager:** npm (inferred from package.json structure)

## Languages

- **JavaScript** - Primary language for all source files
  - App files: `app/layout.js`, `app/page.js`
  - No TypeScript configuration detected (no tsconfig.json)

- **CSS** - Stylesheet support
  - File: `app/globals.css`

## Core Dependencies

### Framework & UI
- **react** ^18.x.x - React library
- **react-dom** ^18.x.x - React DOM bindings

### Content & Markdown Processing
- **gray-matter** ^4.0.3 - YAML/JSON frontmatter parser
  - Used for parsing markdown files with metadata
  - File reference: `app/page.js` imports `getAllPosts` from `../lib/posts`

- **remark** ^14.0.2 - Markdown processor
  - AST-based markdown processor

- **remark-html** ^15.0.1 - Remark plugin to convert AST to HTML
  - Converts processed markdown to HTML output

### Utilities
- **date-fns** ^2.29.3 - Date manipulation and formatting utilities
  - Used for post date handling in content

## Build System & Scripts

### NPM Scripts
Located in `/Users/potts/Claude Projects/clinicaltocode/package.json`:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

- **dev** - Start development server (local development with hot reload)
- **build** - Create production build
- **start** - Run production build
- **lint** - Run Next.js linting checks

## Configuration Files

### Next.js Configuration
- **next.config.js or next.config.mjs** - NOT PRESENT
  - Using default Next.js configuration

### TypeScript Configuration
- **tsconfig.json** - NOT PRESENT
  - Project uses JavaScript, not TypeScript

### Environment Configuration
- **.env files** - NOT PRESENT
  - Configuration for Google Analytics and AdSense currently hardcoded
  - Placeholder IDs in code: `G-XXXXXXXXXX` (Analytics), `ca-pub-XXXXXXXXXX` (AdSense)

## Directory Structure

```
clinicaltocode/
├── app/
│   ├── layout.js          - Root layout with metadata & Google Analytics
│   ├── page.js            - Home page with article grid
│   └── globals.css        - Global styles
├── public/                - Static assets (images, fonts, etc.)
│   └── .gitkeep
├── package.json           - Project manifest
└── index.html             - Static HTML (legacy, present but likely unused)
```

## Build & Deployment Configuration

### Project Metadata
- **Name:** clinical-to-code
- **Version:** 0.1.0
- **Private:** true (not published to npm)

### Production Build Output
- Next.js generates:
  - `.next/` directory (build output)
  - Optimized JavaScript bundles
  - Static pages & assets

## Missing/Incomplete Configuration

- No TypeScript setup
- No environment file for secrets management
- Google Analytics ID not configured (placeholder: G-XXXXXXXXXX)
- Google AdSense client ID not configured (placeholder: ca-pub-XXXXXXXXXX)
- No database configuration
- No API routes configured
- No middleware configuration

## Development Tooling

### Included
- Next.js built-in linter
- Next.js dev server with hot reload

### Not Configured
- Test framework (Jest, Vitest, etc.)
- Code formatter (Prettier)
- Git hooks (Husky, pre-commit)

## Notes

- The project references non-existent components and libraries:
  - `import { getAllPosts } from '../lib/posts'` - `lib/posts.js` not found
  - Multiple component imports: Navigation, Hero, ArticleCard, Sidebar, Footer, NewsletterSignup - NOT FOUND
  - These suggest the project structure is incomplete or in early development

- Static file references suggest planned structure for:
  - Markdown-based blog posts (gray-matter + remark)
  - Component-based UI (React components)
  - Static content generation

## Summary

**Technology Stack Profile:** Minimal Next.js blog starter with markdown support
- Lightweight, no backend complexity
- Static content delivery ready
- Analytics and ad network integration planned but not configured
- Core dependencies: Next.js 14, React 18, markdown processing (remark/gray-matter)
