# Tilia — Wedding Planner

Bilingual (PL/EN) wedding planning app for Ania & Tomek. **Phase 1**: the
single-file prototype (`../wedding-planner-prototype.html`) ported to React +
Vite + TypeScript, with all data persisted to `localStorage`.

## Sections

Dashboard · Planning & timeline (calendar / checklist / day-of) · Budget ·
Guests (list + drag-and-drop seating plan) · Vendors · Inspiration.

The PL/EN switch in the top bar re-renders the entire UI instantly. All data
lives in `localStorage` under the key `tilia:v1`; clearing it restores the
sample data (couple "Ania & Tomek", wedding 2026-09-12 15:00, "Dwór Lipowy").

## Requirements

**Node 20+** (the repo machine shipped Node 16, which Vite 7+ rejects). A
portable Node 24 was unpacked to `%LOCALAPPDATA%\node-v24`. Either put it on
PATH for the session or call its binaries directly:

```powershell
$env:Path = "$env:LOCALAPPDATA\node-v24;" + $env:Path
```

## Commands

```bash
npm install      # install dependencies
npm run dev      # dev server on http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build locally
```

## Project layout

```
src/
  main.tsx            # entry: Router + AppProvider
  App.tsx             # shell: sidebar, topbar, routes, login overlay, toast
  store.tsx           # React context: lang, data, localStorage persistence, helpers
  i18n.ts             # the T dictionary (every string in PL + EN)
  seed.ts             # sample data + constants (WEDDING_DATE, ROUND_MAX, colors)
  types.ts            # shared TypeScript types
  components/         # Sidebar, Topbar, LoginOverlay
  pages/              # Dashboard, Planning, Budget, Guests, Vendors, Inspiration
```

## Deploying to Vercel

The production build is in `dist/`. `vercel.json` already rewrites all routes
to `index.html` for client-side routing. To deploy (requires a one-time
interactive login to your Vercel account):

```powershell
$env:Path = "$env:LOCALAPPDATA\node-v24;" + $env:Path
cd "C:\Users\Arek\Desktop\Wedding app\tilia"
npx vercel login        # authenticate (browser/email — interactive)
npx vercel --prod       # deploy; accept the detected Vite settings
```

Vercel auto-detects Vite (build `npm run build`, output `dist`). No env vars are
needed in Phase 1.

## Next phases (not in this build)

- **Phase 2**: Supabase auth + Postgres, migrate localStorage on first login, RLS.
- **Phase 3**: real file uploads, public share links, derived notifications,
  profile/settings.
