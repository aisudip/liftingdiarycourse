# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Docs-First Requirement

**Before generating any code, Claude Code MUST first read and refer to the relevant documentation files in the `/docs` directory.** This is a hard requirement — do not write or suggest code without first consulting the applicable docs in `/docs`.

- /docs/ui.md
- /docs/data-fetching.md
- /docs/auth.md
- /docs/data-mutations.md
- /docs/routing.md

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 app using the **App Router** (`app/` directory), React 19, TypeScript 5, and Tailwind CSS v4.

- `app/layout.tsx` — Root layout; loads Geist fonts via `next/font/google`
- `app/page.tsx` — Home route (`/`)
- `app/globals.css` — Global styles; uses `@import "tailwindcss"` (Tailwind v4 syntax, not `@tailwind` directives)

**Path alias:** `@/*` resolves to the project root.

**Tailwind v4 note:** Configuration is handled via PostCSS (`postcss.config.mjs` with `@tailwindcss/postcss`), not a `tailwind.config.js` file.
