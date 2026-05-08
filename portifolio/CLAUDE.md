# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

All commands run from the `portifolio/` directory.

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm run start    # Start production server
```

## Architecture

This is a Next.js 16 (App Router) portfolio site with TypeScript, Tailwind CSS v4, and styled-components v6.

**Route structure:**
- `/` — Home page (`src/app/page.tsx`) renders all portfolio sections in sequence
- `/projects` — All projects listing
- `/admin` — Protected admin panel for CRUD on projects/technologies
- `/login` — Supabase auth gate for `/admin`
- `/api/chat` — Streaming POST endpoint powered by Google Gemini 2.5 Flash

**Root layout** (`src/app/layout.tsx`) includes the floating `<Chat />` component globally.

**Component conventions:** Each component lives under `src/components/<name>/` with:
- `index.tsx` — logic (add `"use client"` when using hooks/browser APIs)
- `styles.ts` — styled-components definitions

**Data layer** (`src/lib/supabase.ts`): Supabase client. Tables: `projects`, `technologies`, `project_technologies` (junction). Projects have a `main: boolean` flag to separate featured from secondary. Descriptions are JSONB `{pt: "...", en: "..."}` for bilingual support.

**i18n** (`src/i18n.ts`): `i18next` with browser language auto-detection. Supported locales: `pt` (default) and `en`. Translation keys live inside each component using `useTranslation()`.

**Styling:** Use Tailwind utility classes for layout/spacing. Use styled-components (`styles.ts`) for component-specific or dynamic styles. Both coexist — don't replace one with the other.

**Path alias:** `@/*` maps to `src/*`.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```
