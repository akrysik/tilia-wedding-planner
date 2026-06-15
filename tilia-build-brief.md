# Tilia — Wedding Planner App: Build Brief

## What this is

A handoff brief for continuing development of **Tilia**, a bilingual (PL/EN) wedding planning app.
A complete, working single-file prototype exists: **`wedding-planner-prototype.html`** (kept in this repo).
**Treat the prototype as the functional and visual spec.** Open it in a browser and click through every
section before writing code — all features, layouts, interactions, copy, and edge cases shown there are
the requirements. When in doubt, match the prototype.

Goal: turn the prototype into a deployed web app for personal use, shared with a small group
(the couple + a few family members/friends). Not a commercial product. Optimize for simplicity and
low maintenance, not scale.

## Tech stack (decided — don't relitigate)

- **Frontend:** React + Vite, plain CSS or CSS modules (port the prototype's existing CSS; no Tailwind rewrite needed)
- **Backend:** Supabase (Postgres, Auth, Storage) on the free tier
- **Hosting:** Vercel (or Netlify), free tier
- **Language:** TypeScript preferred but JavaScript acceptable if it speeds things up
- No state-management library needed at this size — React state + a small context for auth/i18n is enough

## Phases (work in this order, each phase shippable)

### Phase 1 — Port the prototype to React + Vite
- One route-per-section: Dashboard, Planning, Budget, Guests, Vendors, Inspiration
- Keep the exact layout: fixed beige left sidebar (logo "Tilia.", nav), light-beige top bar
  (PL/EN switch, notifications bell with dropdown, account menu), white main area
- Port the i18n dictionary as-is (every string exists in PL and EN in the prototype's `T` object);
  language toggle must switch the entire UI instantly
- Persist all data to `localStorage` in this phase so the app is already useful before the backend exists
- Deploy to Vercel at the end of this phase

### Phase 2 — Supabase: auth + database
- Email/password + Google OAuth login (the prototype's login screen shows the intended UI)
- Data model: one **wedding** (workspace) has many members (invited by email, all with edit rights — no
  complex roles needed), and owns all records below
- Migrate localStorage data into Supabase on first login if present
- Row-Level Security: members of a wedding can read/write only their wedding's rows

### Phase 3 — The features that were faked in the prototype
- **File uploads** (Supabase Storage): vendor contracts, receipt photos on expenses
- **Share day-of timeline / theme notes with vendors**: generate a public read-only link (signed URL or
  public route with an unguessable token)
- **Notifications**: derive in-app notifications from data (payment due within X days, new RSVP,
  task overdue). Email reminders are a stretch goal — skip unless trivial
- **Profile/settings/billing menu items**: profile = display name + avatar; settings = default language;
  billing can remain a stub

## Data model (mirror the prototype's `state` object)

- `weddings`: id, couple_names, wedding_date (timestamp incl. time), venue, total_budget, theme_notes
- `members`: wedding_id, user_id, email
- `tasks`: id, wedding_id, title, details, timeframe (`m12|m6|m1|w1|d0`), assignee
  (`me|partner|couple|family|planner`), due_date, done
- `day_of_items`: id, wedding_id, time, title, details (keep chronological sort; times 00:00–04:59 sort
  as after midnight — see `sortDayOf()` in the prototype)
- `budget_categories`: id, wedding_id, name, estimated (7 defaults seeded per wedding: Venue, Catering,
  Attire, Photography, Flowers & decor, Music/band, Other; user can add more)
- `expenses`: id, wedding_id, category_id, name, amount, paid (bool), note
  (actual/paid/pending are always computed from expenses — never stored)
- `guests`: id, wedding_id, first_name, last_name, group (`brideFam|groomFam|friends`), phone, address,
  notes, rsvp (`yes|no|pending`), table_id (nullable), seat_order (int, for position around the table)
- `tables`: id, wedding_id, shape (`round|rect`), name, x, y (floor position)
- `vendors`: id, wedding_id, category, name, contact, stage (0–3: Researching/Contacted/Booked/Paid),
  notes
- `vendor_documents`: id, vendor_id, file path in Storage
- `vendor_log`: id, vendor_id, date, text
- `mood_pins`: id, wedding_id, color, caption (image upload optional later)
- `palette_colors`: wedding_id, ordered list (max 5)

## Business rules to preserve (all implemented in the prototype — copy the logic)

- Countdown ticks every second: days/hours/minutes/seconds until wedding datetime
- Round tables: max 10 guests (block the 11th with a message); fewer than 6 ⇒ table is rendered
  dashed-gold and labelled "not filled / niepełny". Rectangular tables: unlimited; width grows with
  guest count
- Seating interactions: drag tables to position them on the floor (persist x/y); drag a guest chip onto
  a table to seat them (a chair pill with full name appears around the shape); drag chair→chair within a
  table to swap seats; drag chair→another table to move the guest; × on a chair unseats; × on the shape
  deletes the table after confirm. Click-guest-then-click-table must also work (touch fallback)
- Setting a guest's RSVP to anything other than "yes" clears their table assignment
- Budget summary: Total budget (manual), Estimated (sum of category estimates), Actual (sum of
  expenses), Paid (sum of paid expenses), Pending (actual − paid)
- Charts: pie of actual spend by category (distinct colors, no separators, centered, amounts in legend);
  per-category est-vs-actual bars where the actual bar turns red when over estimate
- Calendar is the default Planning tab; month navigation both directions; tasks render on due dates with
  assignee + details; clicking a task opens the shared edit form; wedding day highlighted with venue/time
- Tasks and timeline items are editable from anywhere they appear (checklist, calendar, day-of view) —
  single source of truth
- Guest list filters by group with live counts; full inline edit (first/last name, contact, address,
  group, notes)

## Design system

- Background: white. Sidebar: beige `#F6EFE2`. Top bar + countdown card: lighter beige `#FBF6EB`.
  Cards: beige with the dashboard's six cards each tinted differently (gold/green/sand/olive/cream —
  see prototype CSS classes `tint-*`)
- Text: near-black `#1C1813`. Primary accent (buttons, links, active states, details text): deep green
  `#356B4F`. Secondary: gold `#D98E04`. Positive: leaf `#4A7A52`. **Rose `#D6456B` is reserved for
  negatives only** (declined RSVP, over budget, delete actions, notification badge)
- Buttons: pill-shaped, 2px accent border, subtle vertical gradient fill, colored shadow, lift on hover
- Fonts: **Nunito** (700/800) for headings/numbers/logo, **Karla** for body
- PL/EN switch: light-green pill in the top bar
- Sample data: couple "Ania & Tomek", wedding 2026-09-12 15:00, venue "Dwór Lipowy" — keep as seed data

## Conventions

- Every user-facing string goes through the i18n layer with PL + EN values; no hardcoded copy
- Currency: złoty, formatted with locale-aware thousands separators (`pl-PL` / `en-GB`), suffix " zł"
- Dates displayed as DD.MM.YYYY in the UI
- Mobile: sidebar collapses to a top strip (see prototype's 900px breakpoint); chair drag-and-drop has
  the click-click fallback for touch

## Known prototype limitations (intentional, fix in Phase 2/3)

- All "uploads", "share" buttons, reminders (⏰), and the entire auth flow are simulated with toasts
- Editing a bilingual field writes the same string to both languages — acceptable; real app can keep
  a single string per user-entered field (only UI chrome needs both languages)
- Data resets on refresh (Phase 1 fixes with localStorage, Phase 2 with Supabase)
