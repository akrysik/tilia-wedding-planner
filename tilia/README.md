# Tilia — Wedding Planner

Bilingual (PL/EN) wedding planning app for Ania & Tomek. **Phase 1**: the
single-file prototype (`../wedding-planner-prototype.html`) ported to React +
Vite + TypeScript, with all data persisted to `localStorage`.

## Sections

Dashboard · Planning & timeline (calendar / checklist / day-of) · Budget ·
Guests (list + drag-and-drop seating plan) · Vendors · Inspiration.

The PL/EN switch (top bar and login page) re-renders the entire UI instantly.

## Accounts & demo

The app opens on a login screen with two ways in:

- **Email + password** (Supabase Auth) — real accounts. Each account's data is
  saved on the device under `tilia:v1:user:<uid>`. (Cloud sync across devices is
  the next step; today the data is local per account.)
- **Explore the demo** — no account; clicks through with the sample wedding
  ("Ania & Tomek", 2026-09-12 15:00, "Dwór Lipowy"), saved under `tilia:v1:demo`.
  A "Demo" badge shows in the top bar. Logging out clears the session but keeps
  the demo data for next time.

Language is stored globally (`tilia:lang`). Until Supabase credentials are
added (see below) the email/password form shows a "backend isn't connected"
message and the demo still works.

## Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL** and the **anon
   public** key.
3. Copy `.env.example` to `.env` and paste them in:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Restart `npm run dev`. Email/password sign-up and sign-in now work.

`.env` is gitignored. The anon key is safe in a frontend bundle — row-level
security, added in a later step, is what protects data.

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

## Next phases

- **Phase 2 (in progress)**: ✅ email/password auth + demo mode. Next: move
  wedding data into Postgres with row-level security so it syncs across devices,
  migrate existing localStorage data on first login, add Google OAuth.
- **Phase 3**: real file uploads, public share links, derived notifications,
  profile/settings.
