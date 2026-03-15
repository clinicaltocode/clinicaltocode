# Code Conventions

## Language & Syntax

### JavaScript vs TypeScript
- **Language**: JavaScript (ES6+)
- **File Extensions**: `.js` and `.jsx`
- **TypeScript**: Not in use
- **Status**: Pure JavaScript codebase with no type checking

### Quotes & Semicolons
- **Quotes**: Single quotes (`'`) for strings (consistent usage in imports and string literals)
- **Semicolons**: Used consistently throughout
- **Line Endings**: LF (Unix-style)
- **No formatter**: No `.prettierrc` or Prettier configuration found

## Module System

### Import Style
- **ES6 modules** with `import` syntax (NextJS default)
- **Pattern**: Both relative and absolute imports used
  ```javascript
  // Relative imports for components and utilities
  import Navigation from '../components/Navigation'
  import { getAllPosts } from '../lib/posts'

  // Next.js built-in imports
  import Link from 'next/link'
  ```

### Export Style
- **Named exports**: For utility functions (e.g., `export const metadata = {...}`)
- **Default exports**: For page components and layout files
  ```javascript
  export default function RootLayout({ children }) { ... }
  export const metadata = { ... }
  ```

## File Organization & Naming

### Directory Structure
```
/app              - Next.js App Router pages and layouts
/components       - React components (referenced but directory may be empty)
/lib              - Utility functions and data fetching (referenced in code)
/public           - Static assets
/posts            - Blog post content (referenced but may be empty)
```

### File Naming Conventions
- **Page components**: `page.js` (Next.js convention)
- **Layout files**: `layout.js` (Next.js convention)
- **Component files**: PascalCase (`Navigation.js`, `Hero.js`, `ArticleCard.js`)
- **CSS files**: kebab-case (`globals.css`)
- **Configuration**: `package.json`

### Component Pattern
- React functional components with default export
- Server Components: Used by default in Next.js 14 (async/await in page.js)
- Props passed directly, no destructuring patterns documented
- No component prop documentation or JSDoc comments found

## Styling & CSS

### Approach
- **CSS Modules**: Not in use
- **CSS-in-JS Libraries**: None detected
- **Approach**: Plain CSS with global stylesheet
- **File**: `app/globals.css` contains all global styles

### CSS Conventions
- **Class Naming**: kebab-case (`.article-container`, `.stats-bar`, `.article-header`)
- **CSS Variables**: Used for theming
  ```css
  color: var(--text-primary);
  background: var(--bg-light);
  border: 2px dashed var(--border);
  ```
- **Selectors**: Combination of class selectors and descendant/child selectors
  ```css
  .article-header h1 { ... }
  .content-body blockquote { ... }
  ```
- **Mobile Responsiveness**: Not evident in inspected CSS (no media queries shown in globals.css excerpt)

### Layout Classes
- `.article-container` with `max-width: 800px` and `margin: 0 auto`
- `.stats-container` and grid layouts for stat items
- `.articles-grid` for article listings
- Flexbox and grid patterns implied but not fully visible

## Error Handling

### Current Pattern
- **No explicit error handling** found in inspected code
- **No try-catch blocks** in visible component code
- **No error boundaries** or error.js components detected
- **Async operations**: Basic usage of `await getAllPosts()` with no error handling

### Recommendations
- Implement error.js in app directory for Next.js error handling
- Add try-catch in data fetching functions
- Consider Error Boundary components for React error handling

## Code Style Observations

### Comments
- Minimal comments in production code
- Inline comments for clarity (e.g., `{/* Stats Bar */}`)
- No JSDoc or function documentation found

### Imports Organization
- Organized by source (Next.js → npm packages → local modules)
- No explicit import grouping convention enforced
- Example from page.js:
  ```javascript
  import Link from 'next/link'           // Next.js
  import { getAllPosts } from '../lib/posts'  // Local utility
  import Navigation from '../components/Navigation'  // Local component
  ```

### Component Structure
- Minimal JSX complexity
- Map operations for lists with proper keys
- Fragment usage (`<>...</>`) for wrapper elements
- Inline comment blocks for section demarcation

### Data Fetching
- Server-side async functions in page components
- Use of gray-matter for markdown parsing
- Use of remark for markdown to HTML conversion
- Dependencies: `gray-matter`, `remark`, `remark-html`, `date-fns`

## Linting & Tooling

### Linters
- **ESLint**: Referenced in package.json scripts (`npm run lint`)
- **ESLint Config**: Not found (likely Next.js default)
- **Prettier**: Not in use (no `.prettierrc` file)

### Build Tools
- **Next.js 14.0.0**: Primary framework
- **React 18**: UI library
- **Node.js Scripts**: Build and dev scripts configured

## Known Gaps

1. No TypeScript - codebase is pure JavaScript
2. No error handling strategy implemented
3. No component prop documentation
4. No specific naming conventions for exports/variables documented
5. No CSS architecture patterns (BEM, utility-first, etc.)
6. Limited comments and documentation in code
7. No lint configuration file (using Next.js defaults)
