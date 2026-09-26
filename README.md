# Project 2 of 50 — Application Tracker

> **Series:** 50 Projects in 50 Builds
> **Project #:** 2
> **Project Name:** Application Tracker
> **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase (PostgreSQL)
> **Repository:** [github.com/Prathik578/Application-Tracker](https://github.com/Prathik578/Application-Tracker)

A full-featured job and internship application tracker. Add applications, move them through a Kanban pipeline, search and filter, view dashboard analytics, and manage the full lifecycle — all backed by a real database.

---

## Table of Contents

1. [What This App Does](#what-this-app-does)
2. [Screens & Views](#screens--views)
3. [Tech Stack Decisions](#tech-stack-decisions)
4. [Project Structure](#project-structure)
5. [Architecture Decisions (Start to End)](#architecture-decisions-start-to-end)
   - [Decision 1: Single-tenant, no-auth model](#decision-1-single-tenant-no-auth-model)
   - [Decision 2: Seven-status pipeline](#decision-2-seven-status-pipeline)
   - [Decision 3: Three views, one data source](#decision-3-three-views-one-data-source)
   - [Decision 4: Derivation pipeline (search → filter → sort)](#decision-4-derivation-pipeline-search--filter--sort)
   - [Decision 5: Optimistic local state, not refetch-after-mutation](#decision-5-optimistic-local-state-not-refetch-after-mutation)
   - [Decision 6: Native HTML5 drag-and-drop on the Kanban board](#decision-6-native-html5-drag-and-drop-on-the-kanban-board)
   - [Decision 7: Accessibility fallback on every drag interaction](#decision-7-accessibility-fallback-on-every-drag-interaction)
   - [Decision 8: Client-side validation with a pure function](#decision-8-client-side-validation-with-a-pure-function)
   - [Decision 9: Modal-based forms instead of routes](#decision-9-modal-based-forms-instead-of-routes)
   - [Decision 10: Delete confirmation dialog](#decision-10-delete-confirmation-dialog)
   - [Decision 11: Supabase as the backend](#decision-11-supabase-as-the-backend)
   - [Decision 12: Row Level Security with open policies](#decision-12-row-level-security-with-open-policies)
   - [Decision 13: Database-level CHECK constraint on status](#decision-13-database-level-check-constraint-on-status)
   - [Decision 14: Three indexes on the applications table](#decision-14-three-indexes-on-the-applications-table)
   - [Decision 15: Frontend-managed `updated_at`](#decision-15-frontend-managed-updated_at)
   - [Decision 16: Color system per status](#decision-16-color-system-per-status)
   - [Decision 17: Slate-based neutral palette (no purple)](#decision-17-slate-based-neutral-palette-no-purple)
   - [Decision 18: Responsive table → card swap](#decision-18-responsive-table--card-swap)
   - [Decision 19: Sticky header with view tabs](#decision-19-sticky-header-with-view-tabs)
   - [Decision 20: `@/` path alias](#decision-20--path-alias)
6. [File-by-File Breakdown](#file-by-file-breakdown)
7. [Database Schema](#database-schema)
8. [Getting Started](#getting-started)
9. [What Comes Next](#what-comes-next)

---

## What This App Does

This is a personal application tracker — the tool you use when you're job-hunting or applying to internships and need to keep everything in one place. Instead of a spreadsheet, you get:

- **A dashboard** with summary stats (total, active, upcoming interviews, offers), a visual status breakdown bar, a list of upcoming interviews, and recently updated applications.
- **A Kanban board** with seven columns (Saved → Applied → Screening → Interview → Offer → Rejected → Withdrawn). Drag cards between columns to change status, or use the dropdown fallback.
- **A list/table view** with sortable columns (newest, oldest, upcoming interview, company A–Z). On mobile, the table becomes cards.
- **Search** across company, role, location, and notes.
- **Filters** by status, applied-date range, and interview-date range.
- **Full CRUD**: add, edit, view details, change status, and delete applications — each with its own modal flow.
- **Validation**: required fields, URL format, date sanity (interview can't be before applied), length limits.
- **Empty/loading/error states** so the UI never looks broken.

---

## Screens & Views

The app has three main views, switchable via tabs in the sticky header:

| View | Purpose | Key Components |
|------|---------|----------------|
| **Dashboard** | At-a-glance analytics | Stat cards, status breakdown bars, upcoming interviews, recent activity |
| **Kanban** | Visual pipeline management | Seven columns, drag-and-drop cards, per-card status dropdown |
| **List** | Dense, sortable table | Desktop table + mobile cards, sort selector |

Plus three modals:
- **Application Form** — add or edit an application
- **Application Detail** — read-only view with inline status change, edit, and delete actions
- **Delete Confirmation** — guards destructive actions

---

## Tech Stack Decisions

### React 18 + TypeScript

React is the UI layer. TypeScript ensures every component, every API call, and every derivation function has typed inputs and outputs — the compiler catches mistakes before the user does. We use React 18's standard hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) — no external state management library.

**Why not Redux/Zustand?** The app has one shared data source (the applications array) and one owner (the `useApplications` hook). Adding a state library would add complexity without value. React's built-in `useState` + prop drilling is sufficient for this scope.

### Vite

Vite is the build tool and dev server. It gives instant hot-module replacement, fast production builds, and zero configuration overhead. The project uses `@vitejs/plugin-react` for JSX transform and a `@` path alias resolved via `vite.config.ts`.

### Tailwind CSS

Tailwind provides utility-first styling. Every visual decision — spacing, color, typography, responsive breakpoints — is expressed as class names directly in the JSX. No separate CSS files per component, no CSS-in-JS runtime. The `index.css` file is just three lines: the Tailwind directives.

**Why not a component library (MUI, Chakra)?** The goal of this series is to build from scratch. Tailwind gives full control over the design without the overhead of a library's opinionated defaults or bundle size.

### Supabase (PostgreSQL)

Supabase provides the database, the JavaScript client, and the Row Level Security layer. The app talks to Supabase directly from the browser using the anon key — no intermediate API server.

**Why not a local-only app (localStorage)?** Data should persist across devices and survive browser clears. Supabase gives a real database with constraints, indexes, and security policies — things localStorage cannot do.

**Why not a custom Express API?** Supabase's client SDK handles CRUD directly against Postgres tables with RLS policies acting as the security layer. For a single-tenant app, this eliminates the need for a separate API server.

### lucide-react

Icons come from lucide-react — a tree-shakeable SVG icon library. Each icon is imported individually so only the icons used end up in the bundle. The Vite config excludes `lucide-react` from `optimizeDeps` to prevent pre-bundling issues.

---

## Project Structure

```
project/
├── index.html                      # HTML entry, title, meta tags
├── vite.config.ts                  # Vite config: React plugin, @ alias, optimizeDeps
├── tailwind.config.js              # Tailwind: content paths, no custom theme
├── package.json                    # Scripts and dependencies
├── supabase/
│   └── migrations/
│       └── ...create_applications_table.sql   # Schema, constraints, indexes, RLS
└── src/
    ├── main.tsx                     # React entry — renders <App /> into #root
    ├── App.tsx                      # Root component: view switching, state, modals
    ├── index.css                    # Tailwind directives (3 lines)
    ├── types/
    │   └── application.ts           # All TypeScript types and the STATUSES constant
    ├── lib/
    │   ├── supabaseClient.ts        # Supabase client singleton
    │   ├── applicationsApi.ts       # CRUD functions (fetch, create, update, delete)
    │   ├── validation.ts            # Pure validation function + hasErrors helper
    │   ├── format.ts                 # Date formatting helpers
    │   ├── derive.ts                 # Search, filter, sort, group, count, upcoming
    │   └── statusConfig.ts           # Color/label config per status
    ├── hooks/
    │   └── useApplications.ts        # Data-fetching + mutation hook
    └── components/
        ├── Dashboard.tsx             # Stats, breakdown bars, upcoming, recent
        ├── KanbanBoard.tsx           # Columns + drag-and-drop cards
        ├── ApplicationList.tsx      # Desktop table + mobile cards
        ├── SearchFilterBar.tsx       # Search input + filter dropdowns
        ├── ApplicationForm.tsx       # Add/edit modal form
        ├── ApplicationDetail.tsx     # Read-only detail modal
        ├── DeleteConfirm.tsx         # Delete confirmation dialog
        └── StatusBadge.tsx          # Reusable status pill
```

---

## Architecture Decisions (Start to End)

### Decision 1: Single-tenant, no-auth model

**What:** The app has no login screen, no user accounts, and no per-user data isolation. Anyone who opens the app sees and edits the same set of applications.

**Why:** This is a personal tool — one person tracking their own applications. Adding authentication (sign-up, login, session management, password reset) would double the complexity for zero user value at this stage. The database migration comment explicitly states: "single-tenant app with no sign-in; the data is intentionally shared/public."

**Trade-off:** If this app were deployed publicly, anyone could modify the data. That's acceptable for a personal tool but would need to change for a multi-user product. The RLS policies grant access to both `anon` and `authenticated` roles, so the app works with just the anon key.

---

### Decision 2: Seven-status pipeline

**What:** Every application has exactly one of seven statuses: `Saved`, `Applied`, `Screening`, `Interview`, `Offer`, `Rejected`, `Withdrawn`.

**Why these seven:**
- **Saved** — found a posting, haven't applied yet (the default for new entries)
- **Applied** — submitted the application
- **Screening** — recruiter phone screen or initial review
- **Interview** — technical interview, on-site, or final round
- **Offer** — received an offer
- **Rejected** — company said no
- **Withdrawn** — you pulled out

This covers the full lifecycle of a job application without being so granular that the Kanban board becomes unwieldy. Seven columns fit on screen with horizontal scrolling.

**How it's enforced:** The `STATUSES` array in `types/application.ts` is the single source of truth. It's a `const` tuple (`as const`), so TypeScript infers the literal union type. The database has a `CHECK` constraint that rejects any value outside this set. Both the frontend and the database independently validate the same set.

---

### Decision 3: Three views, one data source

**What:** Dashboard, Kanban, and List all render from the same `applications` array managed by the `useApplications` hook. There's no per-view data fetching or caching.

**Why:** A single source of truth means adding an application on one view instantly reflects on the others. If each view fetched its own data, you'd need sync logic, cache invalidation, and conflict resolution. With one array, a mutation updates all views automatically.

**How:** `App.tsx` holds the `view` state (which tab is active) and passes the same `applications` array to whichever view is rendered. The Kanban and List views additionally receive the `visibleApplications` derived array (after search/filter/sort), while the Dashboard always shows the raw full set (analytics should reflect everything, not just filtered results).

---

### Decision 4: Derivation pipeline (search → filter → sort)

**What:** The visible applications in the Kanban and List views are computed through a three-step pipeline: `searchApplications → filterApplications → sortApplications`. This lives in `App.tsx` inside a `useMemo`.

**Why this order:**
1. **Search first** — narrows by text query (company, role, location, notes). This is the broadest filter and cheapest to compute.
2. **Filter second** — applies structured filters (status, date ranges). Operating on the already-searched set avoids re-checking filtered-out items.
3. **Sort last** — sorting is the most expensive operation (O(n log n)), so it runs on the smallest possible set.

**Why `useMemo`:** The pipeline re-runs only when `applications`, `query`, `filters`, or `sort` change. If the user just switches views or opens a modal, the memoized result is reused — no wasted computation.

**Why pure functions in `derive.ts`:** Each step is a standalone, testable function with no side effects. They take an array and return a new array. This makes them easy to reason about and reuse (the Dashboard also uses `countByStatus`, `upcomingInterviews`, and `recentlyUpdated` from the same file).

---

### Decision 5: Optimistic local state, not refetch-after-mutation

**What:** When you add, edit, delete, or change status, the hook updates the local React state immediately with the server's response — it does not re-fetch the entire list from the database.

**Why:** Re-fetching after every mutation adds a network round-trip and a loading flash. Instead, each mutation function returns the updated record from the server, and the hook patches it into the local array:
- `addApplication` prepends the new record
- `editApplication` replaces the matching record
- `changeStatus` replaces the matching record
- `removeApplication` filters out the deleted record

**Trade-off:** If someone else is using the app simultaneously, their changes won't appear until you refresh. For a single-tenant app, this is fine. The refresh button in the header lets you pull the latest state from the server at any time.

---

### Decision 6: Native HTML5 drag-and-drop on the Kanban board

**What:** Kanban cards are `draggable` elements. When you drag a card and drop it onto a column, the column's `onDrop` handler reads the application ID from the `dataTransfer` object and calls `onStatusChange`.

**Why native DnD:** No external library (like `react-dnd` or `@dnd-kit`) is needed. The HTML5 drag-and-drop API is built into every browser, has zero bundle-size cost, and handles the basic use case (move card to column) perfectly.

**How it works:**
- `onDragStart` on the card: sets `dataTransfer` to the application ID, `effectAllowed = 'move'`
- `onDragOver` on the column: calls `e.preventDefault()` (required to allow drops) and sets a visual `isDragOver` state
- `onDrop` on the column: reads the ID, calls `onStatusChange(id, status)`, clears the visual state
- `onDragLeave` on the column: clears the `isDragOver` state

The `isDragOver` state adds a ring inset and background change so the user sees which column they're targeting.

---

### Decision 7: Accessibility fallback on every drag interaction

**What:** Every Kanban card has a `<select>` dropdown to change status without dragging. The card itself is keyboard-focusable (`tabIndex={0}`, `role="button"`) and responds to Enter/Space.

**Why:** Drag-and-drop is a mouse-only interaction. Touch users, screen-reader users, and keyboard navigators can't drag. The dropdown provides a complete alternative — you can use the entire Kanban board without a mouse. The card's `aria-label` reads the company, role, and status aloud for screen readers.

**Why not just the dropdown?** Drag-and-drop is faster and more satisfying for mouse users — it's the whole point of a Kanban board. Providing both means the board works for everyone without compromising the experience for anyone.

---

### Decision 8: Client-side validation with a pure function

**What:** `validateApplication` in `validation.ts` takes a partial application input and returns a `ValidationErrors` object — a map of field names to error messages. It checks:
- Company and role are required (non-empty, under 500 chars)
- Status is one of the seven allowed values
- Dates are parseable
- Interview date is not before the applied date
- Location is under 500 chars
- Job URL is a valid `http://` or `https://` URL
- Notes are under 5000 chars

**Why a pure function:** It's reusable (called before both create and update), testable (no React, no network, no side effects), and deterministic (same input always gives the same output). The form component calls it on submit, sets the errors in state, and renders them inline next to each field.

**Why not a schema library (Zod, Yup)?** The validation rules are simple enough that a 60-line function covers everything. Adding a library would add bundle size and an abstraction layer for no gain.

---

### Decision 9: Modal-based forms instead of routes

**What:** Adding and editing applications happens in a modal overlay, not a separate page/route. The form slides up from the bottom on mobile and centers on desktop.

**Why modals:** The app has no router (no `react-router`, no URL-based navigation). Adding one for two forms (add + edit) would be overkill. Modals keep the user in context — they can see the board/list behind the form and return to it instantly on close.

**How:** `App.tsx` manages three pieces of state: `formOpen` (boolean), `editing` (the application being edited, or null), and `detail` (the application shown in the detail modal). The form reads `editing` to prefill fields when editing, or uses the `empty` default when adding. On submit, it calls either `editApplication` or `addApplication` depending on whether `editing` is set.

**Mobile UX detail:** The modal uses `items-end` on mobile (bottom sheet style) and `items-center` on desktop (centered dialog). The `max-h-[92vh]` with `overflow-y-auto` on the form body ensures the form scrolls if it's taller than the viewport.

---

### Decision 10: Delete confirmation dialog

**What:** Deleting an application opens a confirmation dialog (`DeleteConfirm.tsx`) showing the company and role, with "Delete" and "Cancel" buttons. The delete button is disabled and shows "Deleting…" while the async operation is in progress.

**Why:** Deletion is permanent and irreversible. A confirmation step prevents accidental data loss — especially important when the delete button sits next to the edit button in the detail modal. The dialog uses `role="alertdialog"` and `aria-modal="true"` for screen-reader accessibility.

**Why not `window.confirm`:** A custom dialog matches the app's visual language, can show the specific company and role being deleted, and can show a loading state during the async operation. `window.confirm` is a blocking browser dialog that can't be styled or async-aware.

---

### Decision 11: Supabase as the backend

**What:** The app uses `@supabase/supabase-js` to talk directly to a PostgreSQL database. The client is initialized in `supabaseClient.ts` with the URL and anon key from environment variables. All CRUD operations go through this single client.

**Why direct client access:** Supabase's PostgREST API automatically generates REST endpoints for every table. The client SDK wraps these with a fluent query builder (`.from('applications').select('*').order(...)`). This eliminates the need for a custom API server — the database IS the API.

**Security implication:** The anon key is embedded in the client bundle and visible to anyone who opens the browser dev tools. This is safe because Row Level Security (RLS) policies in the database control what the anon key can do. The anon key identifies you as an anonymous user; the RLS policies decide what anonymous users are allowed to access.

---

### Decision 12: Row Level Security with open policies

**What:** RLS is enabled on the `applications` table. Four policies (one per CRUD verb) grant full access to both `anon` and `authenticated` roles:
- `SELECT` with `USING (true)` — anyone can read all rows
- `INSERT` with `WITH CHECK (true)` — anyone can insert
- `UPDATE` with `USING (true) WITH CHECK (true)` — anyone can update any row
- `DELETE` with `USING (true)` — anyone can delete any row

**Why open policies:** This is a single-tenant app with no login. There's no concept of "my data vs. your data" — all data belongs to the one user. Open policies are the correct choice here, not a shortcut.

**Why four separate policies (not `FOR ALL`):** Using `FOR ALL` combines all four verbs into one policy. While functionally equivalent here, separate policies are more maintainable — you can revoke just the delete policy without touching the others if the app's requirements change.

**Why `DROP POLICY IF EXISTS` before each `CREATE`:** The migration is idempotent — running it twice doesn't error. This is important because Supabase applies migrations in order, and re-running or editing a migration shouldn't fail on duplicate policy names.

---

### Decision 13: Database-level CHECK constraint on status

**What:** The `status` column has a `CHECK` constraint: `status IN ('Saved','Applied','Screening','Interview','Offer','Rejected','Withdrawn')`. The database rejects any insert or update with a status outside this set.

**Why:** The frontend validates status too (in `validation.ts`), but the database is the last line of defense. If a bug in the client sends an invalid status, or if someone crafts a raw API call bypassing the UI, the database still rejects it. Defense in depth — validate at the boundary (client) and enforce at the source (database).

---

### Decision 14: Three indexes on the applications table

**What:**
- `idx_applications_status` on `status` — speeds up grouping and filtering by status
- `idx_applications_updated_at` on `updated_at DESC` — speeds up the "recently updated" ordering
- `idx_applications_interview_date` on `interview_date` — speeds up "upcoming interviews" queries

**Why:** As the applications table grows, these queries become the hot paths. The status index helps the Kanban grouping and the status filter. The updated_at index helps the default sort order and the dashboard's recent-activity list. The interview_date index helps the dashboard's upcoming-interviews section. Without these, the database would scan the entire table for each query.

---

### Decision 15: Frontend-managed `updated_at`

**What:** The `updated_at` column defaults to `now()` on insert, but on update, the frontend explicitly sets it to `new Date().toISOString()` in `applicationsApi.ts` (via the `withUpdatedAt` helper and the `createApplication` payload).

**Why:** Supabase/PostgREST does not automatically update `updated_at` on row updates (unlike an ORM with hooks). Without a database trigger, the frontend must set it. The alternative — a Postgres trigger function — adds complexity for a single-tenant app. The frontend approach is simpler and sufficient.

**Trade-off:** If someone updates a row directly in the database (bypassing the app), `updated_at` won't change. For this app, all updates go through the app, so this is fine. A trigger would be the right choice if multiple systems write to the table.

---

### Decision 16: Color system per status

**What:** `statusConfig.ts` maps each of the seven statuses to a set of Tailwind classes: a `dot` color (the small circle), a `badge` style (the pill in lists and detail), and a `column` style (the top border on Kanban columns). The colors are:
- Saved → slate (neutral, just saved)
- Applied → blue (action taken)
- Screening → cyan (in progress)
- Interview → amber (important, time-sensitive)
- Offer → emerald (positive outcome)
- Rejected → rose (negative outcome)
- Withdrawn → zinc (muted, you pulled out)

**Why these colors:** They follow a semantic color system — blue/cyan for in-progress, amber for attention-needed, emerald for success, rose for failure, slate/zinc for neutral. This is intuitive and doesn't require the user to learn a color legend.

**Why a config object (not inline classes):** Every component that renders a status (StatusBadge, KanbanColumn, Dashboard breakdown bars, form dropdown) reads from the same config. Change a color here, and it updates everywhere. No hunting through components for hardcoded classes.

---

### Decision 17: Slate-based neutral palette (no purple)

**What:** The app uses Tailwind's `slate` palette as its neutral base — `slate-50` for the page background, `slate-200` for borders, `slate-900` for primary buttons and text. The accent colors (blue, cyan, amber, emerald, rose) are used semantically for status.

**Why slate, not gray or zinc:** Slate has a slight blue undertone that feels cleaner and more modern than pure gray. It pairs well with the semantic accent colors without competing with them.

**Why no purple/indigo:** Purple is the most overused color in SaaS dashboards. The design goal is a clean, professional look that doesn't scream "default template." Slate + semantic accents achieves this.

---

### Decision 18: Responsive table → card swap

**What:** The List view renders a `<table>` on screens `md` and wider, and renders card-style buttons on mobile. The two layouts are completely separate JSX — not a single table with CSS overrides.

**Why not just a responsive table:** Tables are hard to read on a 375px-wide phone. Horizontal scrolling works but is a poor experience. Cards stack information vertically and are touch-friendly. Rendering both and toggling with `hidden md:block` / `md:hidden` gives each viewport the best layout.

**What's shared:** Both layouts use the same `applications` array, the same `StatusBadge` component, and the same `formatDate`/`formatRelative` helpers. Only the layout differs.

---

### Decision 19: Sticky header with view tabs

**What:** The header is `sticky top-0 z-30` with a semi-transparent background (`bg-white/80 backdrop-blur-md`). It contains the app title, application count, refresh button, add button, and the three view tabs (Dashboard, Kanban, List).

**Why sticky:** The user switches views frequently. A sticky header means the tabs are always one tap away, no matter how far down the page they've scrolled. The `backdrop-blur` creates a frosted-glass effect over the content scrolling beneath.

**Why `z-30`:** The modals use `z-40` (detail) and `z-50` (form, delete). The header at `z-30` stays above page content but below modals, so modals cover the header when open.

---

### Decision 20: `@/` path alias

**What:** All imports use `@/` instead of relative paths (e.g., `@/types/application` instead of `../../types/application`). This is configured in both `vite.config.ts` (for the dev server and build) and `tsconfig.app.json` (for TypeScript).

**Why:** Relative paths like `../../lib/derive` are fragile — moving a file changes every import in that file. `@/lib/derive` always resolves to `src/lib/derive` regardless of where the importing file lives. It's shorter, clearer, and refactoring-safe.

---

## File-by-File Breakdown

### `src/types/application.ts`
The type foundation. Defines `STATUSES` (the seven-status tuple), `Status` (union type derived from the tuple), `Application` (the full record type matching the database schema), `ApplicationInput` (the shape submitted by the form — no `id`, `created_at`, or `updated_at`), `SortKey` (the four sort options), and `StatusFilter` (status or 'all'). Every other file imports from here.

### `src/lib/supabaseClient.ts`
A two-line file that creates the Supabase client. Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `import.meta.env`. The `VITE_` prefix is required by Vite to expose the variable to client-side code.

### `src/lib/applicationsApi.ts`
The data access layer. Five async functions: `fetchApplications` (select all, order by `updated_at` desc), `createApplication` (insert + return the new row), `updateApplication` (update + return the updated row), `updateStatus` (thin wrapper around `updateApplication`), `deleteApplication` (delete, no return). Each uses Supabase's `.single()` to get one row back and throws on error. The `withUpdatedAt` helper merges `updated_at` into every update payload.

### `src/lib/validation.ts`
A pure function `validateApplication` that takes a `Partial<ApplicationInput>` and returns a `ValidationErrors` object. Checks required fields, length limits, date parseability, date ordering (interview ≥ applied), and URL format (must be `http:` or `https:`). The `hasErrors` helper checks if the errors object has any keys.

### `src/lib/format.ts`
Two date helpers: `formatDate` (ISO → "Sep 26, 2026" or "—" for null/invalid) and `formatRelative` (ISO → "just now", "5m ago", "3h ago", "2d ago", or falls back to `formatDate` for older dates). Both handle invalid dates gracefully.

### `src/lib/derive.ts`
The derivation layer — six pure functions: `groupByStatus` (array → `Record<Status, Application[]>`), `countByStatus` (array → `Record<Status, number>`), `searchApplications` (filter by text query across four fields), `filterApplications` (filter by status + date ranges), `sortApplications` (four sort modes), `upcomingInterviews` (future interview dates, sorted ascending), `recentlyUpdated` (top N by `updated_at`). Also exports the `FilterOptions` type.

### `src/lib/statusConfig.ts`
A `Record<Status, {label, dot, badge, column}>` mapping each status to its Tailwind classes. The single source of truth for all status colors and labels.

### `src/hooks/useApplications.ts`
The data hook. Manages `applications` (state), `loading` (boolean), and `error` (string | null). On mount, calls `refresh()` which fetches all applications. Exposes `addApplication`, `editApplication`, `changeStatus`, and `removeApplication` — each calls the API function and patches the local state with the server's response. All callbacks are wrapped in `useCallback` to prevent unnecessary re-renders.

### `src/App.tsx`
The root component. Holds view state (`dashboard` | `kanban` | `list`), search query, filter options, sort key, and modal states (form open, editing target, detail target, delete target). Computes `visibleApplications` through the search → filter → sort pipeline via `useMemo`, and `grouped` (by status) via a second `useMemo`. Renders the header (with tabs), the active view, and all three modals. Contains `TabButton`, `LoadingState`, and `EmptyState` helper components.

### `src/components/Dashboard.tsx`
Four stat cards (total, active, upcoming interviews, offers), a status breakdown section with horizontal bars showing percentage per status, an upcoming interviews list (top 5, sorted by date), and a recently updated list (top 5 by `updated_at`). Each list item is a button that opens the detail modal.

### `src/components/KanbanBoard.tsx`
Renders seven `KanbanColumn` components in a horizontal scroll container. Each column has a colored top border, a header with a status dot and count badge, and a body with `KanbanCard` components. Columns handle `onDragOver`, `onDragLeave`, and `onDrop` to receive dragged cards. Each `KanbanCard` is draggable, keyboard-accessible (`tabIndex`, `role="button"`, Enter/Space handler), and contains a status dropdown and optional job URL link.

### `src/components/ApplicationList.tsx`
Two layouts: a desktop `<table>` (hidden on mobile) with columns for company, role, status, location, applied date, interview date, and a sort selector, and a mobile card list (hidden on desktop) with the same information stacked vertically. Both use `StatusBadge` and the format helpers. The `SortSelect` component is shared.

### `src/components/SearchFilterBar.tsx`
A search input (with a search icon and `type="search"`) and three filter dropdowns (status, applied date range, interview date range). Shows a "Clear" button when any filter or search is active. The `FilterSelect` helper renders a labeled `<select>`.

### `src/components/ApplicationForm.tsx`
A modal form for adding/editing. Fields: company (required), role (required), status (dropdown), applied date, interview date, location, job URL, notes (textarea). Uses the `validateApplication` function on submit. Shows inline errors per field and a submit error banner if the API call fails. Disables the submit button and shows "Saving…" during the async operation. Resets form state when the modal opens (prefilling from `initial` if editing, or clearing to `empty` if adding).

### `src/components/ApplicationDetail.tsx`
A read-only modal showing all application fields with icons. Includes an inline status dropdown (so you can change status without opening the edit form), an edit button, and a delete button. The delete button triggers the `DeleteConfirm` modal rather than deleting immediately.

### `src/components/DeleteConfirm.tsx`
A centered `alertdialog` with a warning icon, the company and role being deleted, and Cancel/Delete buttons. The Delete button shows "Deleting…" and disables both buttons during the async operation.

### `src/components/StatusBadge.tsx`
A small reusable pill: a colored dot + the status label, styled with classes from `statusConfig.ts`. Used in the dashboard, list, and detail views.

### `supabase/migrations/...create_applications_table.sql`
The database migration. Creates the `applications` table with UUID primary key, text columns, date columns, and timestamptz timestamps. Adds a CHECK constraint on status, enables RLS, creates four open policies (one per CRUD verb), and adds three indexes.

---

## Database Schema

```sql
CREATE TABLE applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company         text NOT NULL,
  role            text NOT NULL,
  status          text NOT NULL DEFAULT 'Saved'
                  CHECK (status IN ('Saved','Applied','Screening','Interview',
                                    'Offer','Rejected','Withdrawn')),
  applied_date    date,
  interview_date  date,
  location        text,
  job_url         text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
```

**Indexes:**
- `idx_applications_status` on `(status)`
- `idx_applications_updated_at` on `(updated_at DESC)`
- `idx_applications_interview_date` on `(interview_date)`

**RLS:** Enabled. Four policies granting full CRUD to `anon` and `authenticated`.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (URL and anon key)

### Install & Run

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the migration in `supabase/migrations/` against your Supabase project. This creates the `applications` table with all constraints, indexes, and RLS policies.

### Build

```bash
npm run build
```

---

## What Comes Next

This is **Project 2 of 50** in a series. Each project builds on the skills from the last. This project covered:
- React state management with hooks
- TypeScript type design
- Supabase database integration with RLS
- Drag-and-drop interactions
- Responsive design patterns
- Form validation
- Modal-based UX flows

Future projects in the series will explore new patterns, new domains, and new technical challenges. Stay tuned.

---

**Series:** 50 Projects in 50 Builds | **Project 2** | [Repository](https://github.com/Prathik578/Application-Tracker)
