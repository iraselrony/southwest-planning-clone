# Plan: Payload CMS Backend (Block-based Hybrid)

## Goal

Add a Payload 3 admin UI to the existing Next.js 15 frontend so the firm can manage every piece of dynamic content themselves:

- All page text, headings, images, and per-section content (block-based)
- All 14 service entries (add / edit / remove)
- Site logo, contact info, social links, footer text
- Form submissions (browse, search, export)

Without rewriting the existing `dangerouslySetInnerHTML` rendering, the per-section React component refactor, or the Webflow CSS.

## Stack

- **Payload 3** with Next.js 15 App Router (`@payloadcms/next` — the official integration, runs in the same app, no separate service)
- **Neon Postgres** for the database (free tier 0.5 GB, serverless via `@payloadcms/db-postgres` adapter)
- **Vercel Blob** for media storage (free tier 100 GB/mo, via `@payloadcms/storage-vercel-blob`)
- **Single admin user** (Payload's built-in auth; provisioned at deploy time)
- **Resend** for contact form email (already wired in the frontend phase)
- **Vercel** for hosting (already set up, auto-deploys on push)

## Data Model

Payload auto-generates an admin UI at `/admin` for every collection. Five collections:

### `pages` (18 entries, one per route)

| Field | Type | Notes |
|---|---|---|
| `slug` | text, unique, indexed | `/`, `/contact`, `/our-services`, `/privacy-cookie-policy`, `/services/<slug>` |
| `title` | text | H1, used in the page hero |
| `metaTitle` | text | `<title>` tag — seeded from `app/_lib/seo.ts` |
| `metaDescription` | textarea | `<meta description>` — seeded from `app/_lib/seo.ts` |
| `ogImage` | upload | defaults to `Southwest-og.jpg` for all pages |
| `showInNav` | checkbox | whether to show in the main nav |
| `body` | **array of blocks** | the per-section content (see "Editable Zones" below) |

### `services` (14 entries)

| Field | Type | Notes |
|---|---|---|
| `slug` | text, unique, indexed | e.g. `housing`, `retail` |
| `name` | text | "Housing Development Planning" |
| `subtitle` | text | "01", "02"… (the order number) |
| `cardImage` | upload | thumbnail used on the homepage grid |
| `description` | textarea | short blurb for the homepage card |
| `longDescription` | rich text (Lexical) | full content for the service page |
| `contactFormEnabled` | checkbox | per-service toggle (currently true for all 14) |

### `siteSettings` (global, single instance)

| Field | Type | Notes |
|---|---|---|
| `logo` | upload | header logo |
| `companyName` | text | "South West Planning Consultancy" |
| `companyTagline` | text | the "Planning Consultants Southwest" line |
| `address` | textarea (multi-line) | "The Generator Hub, The Gallery, Kings Wharf, The Quay, Exeter, Devon, EX2 4AN" |
| `phoneNumbers` | array of text | `01392 984 206`, `07779 285 376`, `07525 059 569` |
| `email` | email | `info@southwestplanningconsultancy.co.uk` |
| `socialLinks` | group (instagram, twitter, linkedin, facebook URLs) | |
| `registrationNumber` | text | "13398455" |
| `registeredOffice` | textarea | |
| `footerText` | textarea | the footer copy (GFIVEDESIGN credit already stripped) |

### `contactSubmissions` (auto-populated)

| Field | Type | Notes |
|---|---|---|
| `name`, `email`, `phone`, `message` | text / email / text / textarea | from the form |
| `source` | text | `contact-page` or `service-page:<slug>` (already populated) |
| `submittedAt` | date | auto-set on create |

The existing `app/api/contact/route.ts` gets **one extra step**: after the Resend send, also `payload.create()` into this collection. Everything else (validation, normalisation, Resend call) stays as-is.

### `users` (Payload built-in)

Single admin user provisioned at deploy time. No public registration. Login at `/admin` with email + password.

## Editable Zones (the block-based hybrid)

This is the key speedup. The frontend already has the structure from the Webflow HTML. To enable block-based editing without a React rewrite:

1. **Mark editable zones** in the body extract layer. Wrap each editable section in `<div data-payload-zone="<zone-id>">…</div>`. The zone-id is a stable string the body extract recognises.
2. **Define a zone map** per page in `app/_lib/zones.ts`:

   ```ts
   export const ZONES: Record<string, Record<string, BlockType>> = {
     '/': { 'home-hero': 'hero-block', 'about': 'about-block', 'service-cards': 'service-cards-block', 'contact-cta': 'cta-block' },
     '/contact': { 'contact-intro': 'rich-text-block', 'contact-form-copy': 'rich-text-block' },
     '/services/<slug>': { 'service-hero': 'hero-block', 'service-body': 'rich-text-block' },
     // … 4 main pages + 14 service pages
   };
   ```

3. **Inject CMS content** in the body extract layer: for each `<div data-payload-zone="<id>">`, replace its inner HTML with the matching block content from the page's `body` field. If no CMS data exists, fall back to the original Webflow content.
4. **Render** as today via `dangerouslySetInnerHTML`. The Webflow CSS still controls the layout. Only the marked zones get CMS content.

This is **~20 lines of code** in the body helper. No React component tree, no JSX, no per-section refactor.

### Block types (Payload's Lexical + a few custom blocks)

- `rich-text-block` — Payload's built-in Lexical editor (headings, paragraphs, lists, links)
- `image-block` — single image upload with alt text
- `image-and-text-block` — image + rich text side by side
- `hero-block` — image (background) + heading + subheading
- `cta-block` — heading + subheading + button text + button URL
- `service-cards-block` — references a subset of `services` (the `cardImage` + `name` + `description` + link)

These are all standard Payload block types. The admin renders them as a vertical list of form sections per page.

## Migration Plan (build steps, in order)

1. **Install Payload** + adapters (`@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/storage-vercel-blob`, `sharp` for image processing)
2. **Add `payload.config.ts`** at the project root with the 5 collections above, the Postgres adapter, the Vercel Blob plugin, and the admin route mounted at `/admin`
3. **Create the Payload admin route** in `app/(payload)/admin/[[...segments]]/page.tsx` (Payload's standard Next.js App Router integration)
4. **Add a `RootLayout` override** so Payload's admin can use its own root layout
5. **Configure env vars** in Vercel: `DATABASE_URL` (Neon pooled), `DIRECT_URL` (Neon unpooled, for migrations), `BLOB_READ_WRITE_TOKEN` (Vercel Blob), `PAYLOAD_SECRET` (random 32+ char string for JWT signing)
6. **Provision Neon**: create project at neon.tech, get the pooled + unpooled URLs
7. **Provision Vercel Blob**: create a Blob store in Vercel dashboard, copy the token
8. **Push to git, deploy to Vercel** — the build runs Payload's first migration (creates the tables), then the admin is live at `/admin`
9. **Create the single admin user** via `pnpm payload createUser` or directly in the admin UI
10. **Seed scripts** to populate initial data:
    - `scripts/seed-pages.mjs` — reads `app/_lib/seo.ts`, inserts one `pages` entry per URL with `metaTitle` / `metaDescription`
    - `scripts/seed-services.mjs` — inserts 14 `services` entries from the hardcoded list
    - `scripts/seed-site-settings.mjs` — populates `siteSettings` with company info, phone numbers, email
    - `scripts/seed-initial-zones.mjs` — for the homepage + key pages, creates initial `body` blocks with the current content (so the admin isn't empty)
11. **Update `app/_lib/page.ts`** — add the zone injection logic (~20 lines)
12. **Update `app/_lib/zones.ts`** — add the zone map for all 18 pages
13. **Update `app/api/contact/route.ts`** — add the Payload insert after the Resend send (1 extra `payload.create()` call)
14. **Update `scripts/verify.mjs`** — add a check that `/admin` returns 200 and the contact endpoint inserts a row
15. **Customize the admin UI** — favicon, sidebar logo via `admin.components.beforeNavLinks`, field labels
16. **End-to-end test**: log in → edit a page's hero block → see the change on the public site; submit a form → see the row in admin; edit siteSettings.logo → header updates; add a new service → appears on the homepage grid
17. **Update `progress.md` and `next-phase.md`** to mark the backend phase complete and document the v2 deferred work

## Acceptance Criteria

- [ ] `/admin` loads, login works with the single admin user
- [ ] All 18 pages have entries in the `pages` collection with seeded SEO data
- [ ] All 14 services are in the `services` collection
- [ ] `siteSettings` is populated with company info, phone numbers, email, logo
- [ ] Submitting the contact form on `/contact` creates a row in `contactSubmissions` (visible in the admin)
- [ ] Submitting the contact form on any `/services/<slug>` creates a row with `source = "service-page:<slug>"`
- [ ] Editing a page's hero block in the admin updates the public site on next request
- [ ] Editing `siteSettings.logo` updates the header logo on the public site
- [ ] Adding a new service (e.g. "Forestry") makes it appear on the homepage grid and at `/services/forestry`
- [ ] All existing tests still pass: 161/161 `verify.mjs` checks
- [ ] Playwright e2e: log in to admin, edit a page, see the change on the public site
- [ ] Production build succeeds, deploys to Vercel, admin is reachable at `/admin` on the production domain
- [ ] Vercel env vars set: `DATABASE_URL`, `DIRECT_URL`, `BLOB_READ_WRITE_TOKEN`, `PAYLOAD_SECRET`

## Out of scope (defer to v2)

- **React component refactor** — per-section real components. The block-based hybrid is "good enough"; the React refactor is cleaner long-term but takes 2-4 weeks. Defer until the firm wants design flexibility.
- **Multi-user with roles** — the firm is one admin for now. Add per-user content ownership in v2.
- **WYSIWYG preview in admin** — the admin shows a list of blocks, not a live page preview. Could be added with a `Preview` button in v2.
- **Page-level access control** — all admins can edit all pages. Add per-page ACLs in v2.
- **i18n / multilingual** — site is English-only.
- **Form-to-Slack / form-to-CRM integrations** — the form currently just persists + emails. No webhook integrations.
- **Cookie consent banner** — GDPR thing, separate task.
- **Domain cutover** (DNS `www.southwestplanningconsultancy.co.uk` → Vercel) — separate task.
- **Production rename** (`southwest-planning-clone` → `southwest-planning-consultancy`) — separate task.

## Effort Estimate

| Phase | Time |
|---|---|
| Stack setup (Payload, Neon, Vercel Blob, env vars) | 0.5 day |
| `payload.config.ts` + 5 collections | 1 day |
| Migration seeds (pages, services, site settings) | 0.5 day |
| Zone injection in body helper + zone map | 1 day |
| Contact form Payload insert | 0.25 day |
| Admin UI customization | 0.5 day |
| End-to-end testing + verify.mjs updates | 0.5 day |
| Deploy + verify production | 0.25 day |
| Docs update (progress.md, next-phase.md) | 0.25 day |
| **Total** | **~4-5 days** |

This is significantly faster than the original `next-phase.md` estimate (2-4 weeks) because:

- No React component refactor — the `dangerouslySetInnerHTML` rendering stays
- Block-based hybrid editing uses Payload's built-in Lexical + a few custom blocks, not a custom admin
- Zone injection is ~20 lines of code, not a per-section rewrite
- Single admin user, no auth complexity
- Reuse the existing Vercel + Resend + asset pipeline

## Critical Tradeoff

The block-based hybrid is a **deliberate shortcut**. It gets you a fully-editable site in ~4-5 days instead of 2-4 weeks, but the long-term direction is still a per-section React component refactor (where the admin shows a WYSIWYG preview of the actual page, not a list of blocks). The block-based hybrid is "edit the content, trust the design"; the React refactor is "edit the content AND the design". For a planning consultancy site where the design rarely changes, the hybrid is the right call. If the firm later wants to redesign the homepage every quarter, that's when the React refactor pays off.

## Status

**Plan only — not started.** Awaiting sign-off from the user. The plan was confirmed via plan-mode questions (Neon Postgres, block-based hybrid, single admin user) and saved to `execution-plan/backend-plan.md` for the user to review and discuss further.

## Discussion Log

(empty — discussion to be added as the user reviews and asks questions)
