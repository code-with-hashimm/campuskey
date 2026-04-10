# Migration PRD: CampusKey (Admin + Frontend) → Next.js (App Router)

## Overview
This PRD defines the target product + technical shape for migrating the existing static HTML/JS app found in `Admin/` and `Frontend/` into a single **Next.js App Router** application.

The current app is a Tailwind (CDN) + vanilla JS front-end that uses **Supabase** for:
- **Auth** (email/password)
- **Database** (tables: `profiles`, `question_papers`, `webinars`)
- **Storage** (buckets: `question-papers`, `webinar-posters`)

## Goals / Non-goals
### Goals
- Preserve existing user-visible behavior for:
  - Landing page auth overlay (login/register) and role-based redirects.
  - Student dashboard + notes browsing + downloads.
  - Student events browsing.
  - Admin dashboard + notes moderation + events management + basic user management.
  - Chatbot page shell (Coming Soon placeholder).
- Replace file-path based navigation (`/Frontend/.../index.html`) with **Next.js routes**.
- Standardize and componentize repeating UI patterns (layouts, cards, modals, filters).
- Re-implement Supabase integration using Next.js-friendly patterns:
  - Client components where needed (interactive UI)
  - Server components/actions for protected data fetching where beneficial
  - Middleware for route protection and role gating
- Consolidate duplicated utilities (`Admin/js/*` vs `Frontend/utils/*`) into shared modules.

### Non-goals (for this migration PRD)
- Redesign of feature set (keep behavior; visual refinements are allowed but not required).
- Building the “Quiz” / “Summarize notes” / “Feedback” / “Settings” features (currently “coming soon”).
- Building a production AI backend (we will define integration points, not implement the AI system itself).

## Current State (as implemented)
### Surfaces
- **Public**
  - `Frontend/landing-page/index.html`: marketing + auth overlay (login/register).
- **Student**
  - `Frontend/Dashboard/index.html`: sidebar shell + “Recent Notes” preview.
  - `Frontend/Dashboard/all-notes/index.html`: searchable/filterable grid of approved notes (PYQ).
  - `Frontend/Events/index.html`: searchable grid of active events/webinars.
  - `Frontend/AI/index.html`: AI chat UI (will be replaced by a Coming Soon chatbot page during migration).
- **Admin**
  - `Admin/Dashboard/index.html`: stats cards + sidebar nav + recent activity.
  - `Admin/Notes-Management/index.html`: list/grid of notes + create/upload + approve/delete.
  - `Admin/Events-Management/index.html`: list/grid of events + create/edit/delete, poster upload.
  - `Admin/User-Management/index.html`: list users (profiles) + view details + create user + delete profile.

### Data model inferred from code
#### `profiles` table
Used by:
- Landing login redirect: `profiles.select('role').eq('id', session.user.id).single()`
- Admin auth gate: checks `role === 'admin'`
- Admin user management: selects `*`, renders first/last/email/role.
- Admin dashboard “Total Users”: counts profiles where `role = 'student'`.

Likely fields (observed in code usage):
- `id` (Supabase auth user id)
- `first_name`
- `last_name`
- `email`
- `role` (`admin` | `student`)

#### `question_papers` table (Notes / PYQ)
Used by:
- Admin notes management CRUD + moderation
- Student dashboard preview + student “all notes” browsing

Observed fields:
- `id`
- `title`
- `subject`
- `semester` (number or null)
- `year` (number or null)
- `file_url` (stores storage path/object key)
- `file_size`
- `is_approved` (boolean)
- `uploaded_at` (admin lists ordered by this)
- `created_at` (admin dashboard recent activity ordered by this)
- `uploaded_by` (user id; inserted on admin upload)

#### `webinars` table (Events / Webinars)
Used by:
- Admin events manager (full CRUD)
- Student events page (read-only, only active)

Observed fields:
- `id`
- `title`
- `description`
- `poster_url` (storage object key OR http URL)
- `is_active` (boolean)
- `created_at`
- `created_by`
- `button_link`
- `button_text` (optional; student page uses fallback)
Also referenced but not written in Admin UI (student UI supports them if present):
- `date` (student page uses `event.date || event.created_at`)
- `time`
- `location`
- `image_url`/`imageUrl` (fallback keys)

### Supabase storage buckets
- `question-papers`
  - Admin upload: `storage.from('question-papers').upload(fileName, selectedFile)`
  - Student download: `storage.from('question-papers').createSignedUrl(filePath, 60)`
  - Admin delete: `storage.from('question-papers').remove([storagePath])`
- `webinar-posters`
  - Admin upload: `storage.from('webinar-posters').upload(fileName, bannerFile)`
  - Admin delete: `storage.from('webinar-posters').remove([event.poster_url])`
  - Student + Admin display: `getPublicUrl(objectKey)`

### Authentication + authorization behavior
- Landing page login/register uses Supabase Auth:
  - Login: `supabase.auth.signInWithPassword`
  - Register: `supabase.auth.signUp` with `options.data` metadata (first/last/role).
  - Post-login redirect:
    - If profile role is `admin` → `/Admin/Dashboard/index.html`
    - Else → `/Frontend/Dashboard/index.html`
- Student pages call `window.checkAuthentication(redirectUrl)` which checks `supabase.auth.getSession()` and redirects to landing on missing session.
- Admin pages call `window.checkAuthentication()` from `Admin/js/auth.js`:
  - Gets session; redirects if missing
  - Fetches `profiles.role` and redirects if not `admin`.

### Chatbot (Coming Soon) behavior
- During migration, the student “Ask AI” destination becomes a **Chatbot** page that:
  - Renders a centered **placeholder SVG** illustration
  - Shows a **"Coming Soon"** title (and optional short subtitle)
  - Contains **no chat history**, **no message composer**, and **no AI API calls**
- The current AI chat implementation in `Frontend/AI/*` is out of scope for initial migration and will be integrated later.

## Core Features (explicit CRUD behavior)

### Notes Management (Admin) — `Admin/Notes-Management/script.js`
**Entity:** `question_papers` + storage object in `question-papers` bucket.

#### Read (list)
- Fetch all notes:
  - `select('*')` from `question_papers`
  - Order: `uploaded_at desc`
- Client-side filtering:
  - Search by `title` or `subject` (substring, case-insensitive)
  - Subject dropdown derived from unique `subject` values
  - Status tabs:
    - `all`: show all
    - `approved`: `is_approved === true`
    - `pending`: `is_approved === false`
    - “rejected” tab exists in UI but **no corresponding state in data model** (no `is_rejected`/`status` field used)
- Displays:
  - Card per note with title, subject, semester/year badges, date from `uploaded_at`, size from `file_size`

#### Create (upload)
- Admin selects a PDF file (code enforces PDF even though UI accepts images).
- Uploads file to Supabase Storage bucket `question-papers` under random UUID filename.
- Inserts row into `question_papers`:
  - `title`, `subject`, `semester`, `year`
  - `file_url` = uploaded storage object key
  - `file_size` = selectedFile.size
  - `is_approved` = `true` (admin-created notes are auto-approved)
  - `uploaded_by` = current authed user id

#### Update (moderation approve)
- Approve sets: `update({ is_approved: true }).eq('id', id)`

#### Delete
- Removes storage object if a `storagePath` exists:
  - `storage.from('question-papers').remove([storagePath])`
- Deletes DB row:
  - `from('question_papers').delete().eq('id', id)`

#### Not implemented but present in UI
- Bulk actions bar: Approve All / Reject All / Delete All (HTML exists, JS does not wire it).
- Note preview modal + approve/reject actions (HTML exists, JS does not wire it).
- “Reject” state: UI has “Rejected” tab + modal reject button, but DB updates don’t implement rejection.

**Migration implication:** Decide whether “Rejected” is a real persisted state (recommended) or remove those UI elements.

---

### Events Management (Admin) — `Admin/Events-Management/app.js`
**Entity:** `webinars` + optional poster object in `webinar-posters` bucket.

#### Read (list)
- Fetch all events: `from('webinars').select('*').order('created_at desc')`
- Client-side filters:
  - `active`: `is_active === true`
  - `inactive`: `is_active === false`
- Card shows:
  - Poster image: if `poster_url` is a storage key, resolve with `getPublicUrl`
  - Title/description
  - Badge Active/Inactive
  - Date shown is `created_at` (not event date)
  - Optional link section uses `button_link` + `button_text`

#### Create
- Optional banner image:
  - Upload to `webinar-posters` bucket using UUID filename
  - Save `poster_url` = object key
- Insert into `webinars`:
  - `title` (required)
  - `description`, `button_link`, `poster_url`
  - `is_active: true`
  - `created_by: current user id`
- UI includes inputs for `create-date`, `create-time`, `create-has-certificate` but code **does not persist** these fields.

#### Update
- Update `title`, `description`, `is_active` based on dropdown.
- Optional new banner upload: upload new file; overwrite `poster_url` to new key (does not delete old poster automatically).

#### Delete
- Remove poster object if poster_url is a storage key (not an `http` URL).
- Delete row from `webinars`.

---

### Events Browsing (Student) — `Frontend/Events/script.js`
**Read-only UX** for students:
- Loads only active events:
  - `from('webinars').select('*').eq('is_active', true).order('created_at desc')`
- Search filters in-memory by `title`, `description`, `location`.
- Renders cards with:
  - Date/time derived from `event.date || event.created_at`
  - Poster resolved by `getPublicUrl` when stored as key
  - CTA button uses `button_link` (or “Coming Soon” if missing)

---

### Notes Browsing / PYQ (Student)
#### Dashboard recent notes — `Frontend/Dashboard/script.js`
- Fetches recent approved notes:
  - `from('question_papers').select('*').eq('is_approved', true).order('uploaded_at desc').limit(6)`
- Clicking a card triggers download:
  - Creates signed URL (60s) via `storage.from('question-papers').createSignedUrl(filePath, 60)`

#### “All notes” page — `Frontend/Dashboard/all-notes/script.js`
- Loads all approved notes:
  - `from('question_papers').select('*').eq('is_approved', true).order('year desc')`
- Filters:
  - Search by `title`/`subject`
  - Dropdown filters: `semester`, `subject`, `year`
- Download:
  - Signed URL (60s) using `file_url` as storage path

---

### User Management (Admin) — `Admin/User-Management/app.js` (included for completeness)
- List: reads all rows from `profiles` (client-side search; sort by first_name).
- View details modal: uses selected profile fields.
- Delete: deletes profile row only (explicitly warns auth deletion requires Edge Functions).
- Create user: performs raw `POST ${supabase.supabaseUrl}/auth/v1/signup` using `supabase.supabaseKey` (exposed on the client in current code) to avoid overwriting admin session.

**Migration implication:** This must be redesigned for security (server-side only). Never expose a service role key to the browser.

## Component Map (repeating UI patterns to extract)
The current app repeats many UI patterns across pages. Migration should extract these into reusable components.

### Global / shared patterns
- **Tailwind-based design system**
  - Primary color `#6B46C1` on student surfaces, indigo/purple gradient on admin surfaces.
- **Loading spinners / skeletons**
  - Multiple pages implement inline spinner markup.
- **Empty-state panels**
  - “No notes available”, “No webinars yet”, “Failed to load… Retry”, etc.
- **Escape HTML utilities**
  - Multiple pages implement `escapeHtml` locally (duplicate logic).

### Student app patterns (Frontend)
- **App shell layout**
  - Sticky header with user avatar + dropdown.
  - Mobile sidebar with overlay and slide-in animation.
  - Sidebar nav items (Home, Ask AI, Events, Certificates, Quizzes, PYQ, Feedback).
- **User dropdown**
  - Toggle caret -> dropdown with user display name + logout.
- **Card grids**
  - “Recent Notes” card pattern (subject pill, title, year/semester).
  - “Events” card pattern (image, date badge, title, description, CTA).
- **Filtering controls**
  - Search input with icon.
  - Select dropdown filters (semester/subject/year).

### AI Assistant patterns
- **Chatbot coming-soon placeholder**
  - Simple hero/empty state with SVG + “Coming Soon” title
  - Uses the student shell (header + sidebar) so navigation remains consistent

### Admin patterns
- **Admin sidebar layout**
  - Fixed header + left sidebar nav with grouped sections (“Main”, “Content”, “Administration”, “System”).
- **Admin dashboards**
  - Stats cards grid.
  - “Quick actions” dashed-border card buttons.
  - “Recent activity” list rows.
- **Admin CRUD modals**
  - Notes create modal (file upload dropzone, form fields, cancel/submit).
  - Events create/edit dialogs (dropzone + preview + remove).
  - User create/view modals.

### Recommended component decomposition (Next.js)
- **Layouts**
  - `StudentLayout`: header + sidebar + user menu + main slot
  - `AdminLayout`: header + sidebar + main slot
  - `PublicLayout`: landing page frame (optional)
- **Primitives**
  - `Button`, `IconButton`, `Badge`, `Card`, `Modal`, `Dialog`, `Input`, `Select`, `Spinner`, `EmptyState`
- **Feature components**
  - `NotesGrid`, `NoteCard`, `NotesFilters`
  - `EventsGrid`, `EventCard`, `EventsFilters`
  - `UserTable`, `UserDetailsModal`, `CreateUserModal`
  - `ComingSoonHero` (reusable empty-state/placeholder hero)

## Data Flow (current → proposed)

### Current data flow (as-is)
#### Supabase client initialization
- Both `Admin/js/supabase.js` and `Frontend/utils/supabase.js`:
  - `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)` imported from `@supabase/supabase-js@2/+esm`
  - **Hardcoded anon key present** (fallback if env not available)

#### Auth
- Browser-only session checks:
  - `supabase.auth.getSession()` to guard routes
  - Redirect via `window.location.href`
- Role check:
  - Query `profiles` table in the browser
- Logout:
  - `supabase.auth.signOut()`

#### DB queries + storage
- Per-page JS modules query Supabase directly from the browser.
- Downloads use short-lived signed URLs (60 seconds).
- Event posters are served via public URLs.

#### Security issues in current implementation
- Admin “create user” calls Supabase Auth REST endpoint from browser and references `supabase.supabaseKey`:
  - This implies sensitive key material is accessible client-side in current code path.

### Target data flow in Next.js (recommended)
#### Supabase integration approach
- Use `@supabase/supabase-js` on:
  - **Server** for privileged reads/writes gated by auth/role (recommended for admin features).
  - **Client** for interactive reads if necessary (student browsing can be server-rendered to reduce client complexity).
- Store Supabase URL and anon key in environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Use a server-side session strategy:
  - Middleware route protection and/or server-side session retrieval.
  - Prefer SSR-friendly Supabase auth patterns (cookie-based session).

#### Recommended split: server vs client responsibilities
- **Server components / server actions**
  - Fetch initial page data (notes list, events list, admin stats) with role-aware filtering.
  - Handle admin mutations (create/update/delete) so keys and permission checks are not browser-trust based.
  - Generate signed download URLs on the server (optional; can also be done client-side with anon key if policies allow).
- **Client components**
  - UI filters/search (purely in-memory) OR query params -> server re-fetch.
  - Modal open/close, file pickers, image previews.
  - Chatbot coming-soon page (static UI).

#### RLS + authorization expectations
This migration assumes Supabase Row Level Security will be enforced and aligned with the app:
- **`question_papers`**
  - Students: read only where `is_approved = true`
  - Admins: full CRUD
- **`webinars`**
  - Students: read only where `is_active = true`
  - Admins: full CRUD
- **`profiles`**
  - Users: read own profile
  - Admins: list/manage users (or via server-only admin endpoints)

#### AI backend integration (deferred)
The migration will **not** implement AI endpoints initially. A future phase can add an API route such as `POST /api/ai/chat` once the chatbot UI is ready.

## Route Map (current paths → Next.js App Router)

### Current route inventory (by file path)
#### Public
- `/Frontend/landing-page/index.html`

#### Student
- `/Frontend/Dashboard/index.html`
- `/Frontend/Dashboard/all-notes/index.html`
- `/Frontend/Events/index.html`
- `/Frontend/AI/index.html`

#### Admin
- `/Admin/Dashboard/index.html`
- `/Admin/Notes-Management/index.html`
- `/Admin/Events-Management/index.html`
- `/Admin/User-Management/index.html`

### Proposed Next.js App Router structure
Use route groups to separate concerns and layouts.

```text
app/
  (public)/
    page.tsx                          # Landing (marketing + auth overlay)

  (student)/
    layout.tsx                        # StudentLayout (header + sidebar)
    dashboard/
      page.tsx                        # Student dashboard (recent notes)
    notes/
      page.tsx                        # “All Notes / PYQ” (filters + downloads)
    events/
      page.tsx                        # Active events list + search
    chatbot/
      page.tsx                        # Chatbot (Coming Soon placeholder)

  admin/
    layout.tsx                        # AdminLayout (admin shell)
    dashboard/
      page.tsx                        # Stats + recent activity
    notes/
      page.tsx                        # Notes management (approval + upload + delete)
    events/
      page.tsx                        # Events manager (active/inactive + CRUD)
    users/
      page.tsx                        # User management (list + create + delete)

  api/
    notes/
      download/route.ts               # (optional) server-signed URL generator
```

### Routing + auth middleware
Add middleware to enforce:
- `(student)` routes require authenticated session
- `/admin/*` routes require authenticated session + `profiles.role === 'admin'`

## Functional Requirements (migration-ready)

### Public landing + auth
- **Login**
  - Email/password login
  - On success: fetch `profiles.role`
  - Redirect:
    - admin → `/admin/dashboard`
    - student → `/dashboard`
- **Register**
  - Email/password + first/last name
  - Create Supabase auth user
  - Ensure `profiles` is created/updated with `role: student` (via trigger or server action)
  - Redirect student to `/dashboard`
- **Auth overlay UX**
  - Open/close modal, switch between login/register, escape key closes

### Student: dashboard (recent notes)
- Show user avatar initials + dropdown (logout)
- Show “Recent Notes” grid of up to 6 approved notes
- Download behavior:
  - Clicking a note opens PDF in new tab via signed URL

### Student: notes (PYQ) list
- Load all approved notes
- Filters:
  - Search by title/subject
  - Semester/Subject/Year dropdown filters
- Actions:
  - Download PDF (signed URL)

### Student: events
- Load active webinars
- Search by title/description/location
- Show poster image (public URL or placeholder)
- Register CTA:
  - If `button_link` present: open in new tab
  - Else: show disabled “Coming Soon”

### Student: chatbot (Coming Soon)
- Provide a route accessible from the student sidebar “Ask AI” nav item.
- UI requirements:
  - Centered placeholder SVG (inline SVG in component; no external asset dependency required)
  - Title: **"Coming Soon"**
  - Optional subtitle: e.g. “We’re building an AI study assistant. Check back soon.”
- No functionality requirements yet:
  - No chat history
  - No message input
  - No API calls

### Admin: dashboard
- Stats:
  - Total notes: count of `question_papers`
  - Total users: count `profiles` where `role='student'`
  - Pending approvals: count `question_papers` where `is_approved=false`
- Recent activity:
  - List last 5 notes (currently ordered by `created_at`)
- Navigation:
  - Go to notes/events/users pages

### Admin: notes management
- List all notes with:
  - Search by title/subject
  - Subject filter dropdown
  - Status tabs: all/pending/approved
- CRUD:
  - Create note: upload PDF to storage; insert row (auto-approved)
  - Approve pending note: set `is_approved=true`
  - Delete: delete storage object then DB row
- Decide for migration:
  - Implement “Reject” state (recommended via `status` enum) or remove “Rejected” UI.
  - Implement missing modal preview + bulk actions or remove them.

### Admin: events management
- List all webinars (active/inactive filters)
- Create:
  - Title required
  - Optional poster upload
  - Optional button link/text
  - Status default active
- Edit:
  - Update title/description/status
  - Optional replace poster
- Delete:
  - Deletes poster object (if stored) and DB row
- Decide for migration:
  - Persist `date`, `time`, `location`, `has_certificate` if required by product (UI currently collects date/time/certificate but does not store them).

### Admin: user management (security-sensitive)
- List profiles
- View details modal
- Delete profile row (optionally also delete auth user via server-side admin API)
- Create user:
  - Must be server-side (API route / server action), never from client with privileged keys

## Technical Requirements
### Stack
- Next.js (App Router)
- Tailwind CSS (installed + built, not CDN)
- Supabase JS SDK v2

### Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (optional, server-only) `SUPABASE_SERVICE_ROLE_KEY` for admin-only operations (never exposed to browser)
- (future) AI-related secrets will be added in the AI integration phase.

### Data fetching strategy
- Prefer server-side fetching for:
  - Admin pages (role-gated + less client complexity)
  - Student pages initial lists (SEO not critical but improves perceived performance)
- Keep client-only for:
  - Local UI state (filters, modal open, sidebar toggle)

### File uploads
- Use browser upload to Supabase Storage with anon key **only if** bucket policies allow authenticated admin uploads safely.
- Otherwise proxy upload via server route and use signed upload URLs or server SDK.

### URL signing for downloads
Two valid approaches:
- **Client-side signed URL**
  - Student requests `createSignedUrl(filePath, 60)` from browser SDK.
  - Requires storage policies allowing authenticated reads of approved notes (or public bucket).
- **Server-side signed URL (recommended)**
  - `GET /api/notes/download?path=...` verifies user + authorization, returns short-lived URL.

## Open Questions / Decisions (must be resolved during migration)
- **Notes rejection**
  - UI includes “Rejected” but DB uses only `is_approved`. Choose:
    - Add `status` field (`pending|approved|rejected`) and migrate queries, or
    - Remove rejected UI elements.
- **Events date/time/location/certificate**
  - Admin UI collects date/time/certificate, student UI tries `event.date`. Decide whether to:
    - Add fields to `webinars` and persist them, or
    - Remove those inputs and standardize on `created_at` only.
- **User creation/deletion**
  - Define secure admin-only mechanism:
    - Use service role key server-side and Supabase Admin API
    - Or use Supabase Edge Functions
- **Duplicate styling**
  - Decide whether admin and student themes share a single design system or remain visually distinct.

## Risks & Mitigations
- **Security regression**
  - Risk: replicating current client-side admin behaviors could leak privileged keys.
  - Mitigation: all admin mutations and user creation must run server-side; add strict middleware gating.
- **RLS misconfiguration**
  - Risk: student can read unapproved notes or inactive events if policies are weak.
  - Mitigation: enforce RLS + server-side filtering; add integration tests for access control.
- **Behavior gaps**
  - Risk: existing HTML includes UI elements not wired in JS; migration might “accidentally” implement or drop them.
  - Mitigation: explicitly decide feature scope (see Open Questions).
- **Storage key vs URL ambiguity**
  - Some fields (e.g., `poster_url`) may be either http URL or storage key.
  - Mitigation: normalize by storing storage key and deriving URL consistently; or store both.

## Acceptance Criteria (migration done when…)
- **Routing**
  - All current user journeys map to Next.js routes listed in Route Map.
- **Auth**
  - Login/register works; role-based redirect works; protected routes redirect unauth users.
  - Admin routes are blocked for non-admin users.
- **Notes**
  - Student can browse approved notes and download PDFs.
  - Admin can upload, approve, and delete notes (storage + DB).
- **Events**
  - Student can browse active events and register via link.
  - Admin can create/edit/delete events and manage active/inactive.
- **Chatbot**
  - Chatbot page loads and displays the placeholder SVG and **"Coming Soon"** title.
  - Student sidebar “Ask AI” routes to the chatbot page.
- **Parity**
  - UI patterns (sidebar, dropdown, card grids, modals) are componentized and consistent.

