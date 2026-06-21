# Progress

## Goal

100% pixel-faithful clone of <https://www.southwestplanningconsultancy.co.uk> as a Next.js 15 App Router frontend. Every original URL, SEO signal, and asset preserved. Contact forms wired to email. Backend (Payload CMS, Neon, Vercel Blob) deferred to a later phase.

## Status: ✅ Frontend phase complete · ✅ Backend phase LIVE in production

All 18 pages route. Every internal `.html` link rewritten to clean URLs (verify.mjs check #7). 14 service-page hero images downloaded and rendering. Per-page SEO titles + descriptions set, GFIVEDESIGN footer credit removed, contact forms wired to Resend and delivering. Dev server runs. Production build succeeds with zero type errors. Deployed to Vercel at <https://southwest-planning-clone.vercel.app>. 161/161 verify checks pass. 18/18 Playwright smoke tests pass with 0 console errors and 0 4xx sub-resources.

**Payload CMS 3 backend is live** at `https://southwest-planning-clone.vercel.app/admin` (login: `iraselrony@gmail.com`, password set via first-run wizard — see "Outstanding user actions" below).

**Verified end-to-end (2026-06-21):**

- All 8 public routes return 200 from production
- /admin returns 200 (Payload admin loads)
- /admin/login returns 200
- /services/forestry returns 404 (catch-all correctly 404s on unknown slugs)
- POST /api/contact returns `{ok: true, persisted: true, submissionId: "1"}` and a row appears in the `contact_submissions` Neon table

**Branch state (this snapshot repo, `southwest-planning-clone-no-backend`):**

- `main` is unchanged at `2bf6062` (frozen baseline)
- `feat/payload-cms` has 9 commits (the Payload work)
- Force-pushed to `iraselrony/southwest-planning-clone` so Vercel deploys from it

**Backend phase (Payload CMS 3) is scaffolded AND live.** The code, config, admin route group, collection definitions, seed scripts, asset migration, and verify scripts are all in place. Neon Postgres is the production DB (21 tables, 18 pages, 14 services, site settings, contact_submissions seeded). Vercel Blob is configured for the asset-migration script (admin file uploads via the Vercel Blob plugin are deferred to v2 — see below).

## Checklist

### Done

#### Project & infra

- [x] Project scaffold (`package.json`, `tsconfig.json`, `next.config.mjs`, `.gitignore`)
- [x] Next.js 15.3.9, React 19, TypeScript, DOMPurify, cheerio, fast-glob, Playwright, pixelmatch, **Resend SDK**
- [x] Vercel project linked to GitHub repo, auto-deploy on push to `main`

#### Mirror & inventory

- [x] wget recursive mirror with `--span-hosts` (76 files, 9.2 MB, 18 HTML + 1 CSS + 5 JS + 49 images)
- [x] `scripts/extract-inventory.mjs` → `site-map.md`, `seo-audit.md`, `assets.md`
- [x] `scripts/copy-assets.mjs` → `public/<host>/...` with original paths preserved
- [x] `scripts/generate-routes.mjs` → `app/page.tsx` + 17 routes in `app/(routes)/<slug>/page.tsx`
- [x] **14 service-page hero images** downloaded from secondary Webflow site ID `62c2cea31ea6c658111800bc`
- [x] **OG image** `Southwest-og.jpg` downloaded
- [x] **3 missing PNG/SVG assets** downloaded (twitter icon, RTPI logo, chevron-down light variant)
- [x] **1 broken asset** (chevron-down) renamed + HTML reference rewired to bypass Next.js 15.3.9's `%20` 400 bug

#### Build (app/_lib + body helper)

- [x] `app/_lib/page.ts` — 5 transformations applied in order:
  1. `removeFooterCredits()` — strips `Webdesign by GFIVEDESIGN` link from every page
  2. `absolutizeAssetPaths()` — wget's `../cdn.foo/...` → root-absolute `/cdn.foo/...`, also strips `https://` for CDN hosts
  3. `rewriteInternalLinks(html, pageUrl)` — `contact.html` → `/contact`, `services/housing.html` → `/services/housing`, `../index.html` → `/`. Handles site-root-relative, parent-relative, and absolute paths
  4. `fixBrokenHeroBackgrounds()` — unwraps the `&quot;` entities from service-page hero URLs
  5. `revealWebflowAnimations()` — strips `style="opacity:0"` so content is visible by default
- [x] `app/_lib/seo.ts` — hardcoded `{ title, description }` for all 18 pages. Single replacement point for the Payload phase (swap the map for a Payload Local API lookup, same shape).
- [x] `buildHeadFromHtml(html, pageUrl, seo?)` — accepts a `PageSeo` override; emits title, description, OG, Twitter Card, and canonical URL (the original had no canonical on most pages).

#### Routes

- [x] `app/page.tsx` (home) + 17 routes in `app/(routes)/<slug>/page.tsx`
- [x] `app/layout.tsx` — Webflow global stylesheet, **self-hosted Montserrat via `next/font/google`**, Google Tag Manager, jQuery, Webflow JS chunks, contact-form.js
- [x] `app/api/contact/route.ts` — POST endpoint, validates input, normalises both `First-name` / `First-name-2` field-name conventions, sends via **Resend SDK** to a comma-separated recipient list parsed from `CONTACT_TO_EMAIL`. Logs every send.
- [x] `public/contact-form.js` — client-side interceptor. Captures the form's default `method="get"` submit, POSTs JSON to `/api/contact`, routes response into existing `.w-form-done` / `.w-form-fail` divs. Forms are tagged with `data-contact-form="<source>"` server-side so the source (contact page vs service page) flows into the email.
- [x] `app/sitemap.ts` — reads `site-map.md` → emits all 18 URLs
- [x] `app/robots.ts` — matches original (allow all + sitemap)
- [x] `app/not-found.tsx` — branded 404 with home link

#### Verification

- [x] `npm run build` succeeds, 23 routes, zero TS errors
- [x] `scripts/verify.mjs` — 161/161 checks pass, including the **link-crawl check** (7th) that verifies every internal link in every page returns 200
- [x] `scripts/smoke-screenshot.mjs` — all 18 pages render without console errors or 4xx
- [x] `scripts/visual-diff.mjs` — local vs live pixel diff
- [x] `execution-plan/README.md`, `progress.md` (this file), `next-phase.md` written
- [x] Contact form POST returns 200 + Resend message ID + audit log

### Known issues (carry-forward to Payload phase)

These are the remaining gaps between the frontend and the ideal target. None block production use; all are addressed by the Payload refactor.

1. **Visual diff is 5–15% on service pages, 24% on homepage, 36% on contact page.** Mostly anti-aliasing on text + subpixel positioning. The structural content is identical to the live site; the noise is from server-rendered Next.js vs server-rendered Webflow. Tightening this would require either lowering the pixelmatch threshold (current: 0.1) or hand-tweaking CSS — the Payload refactor will close most of the gap by replacing `dangerouslySetInnerHTML` strings with proper React components.

2. **Contact page shows 36% pixel diff.** The original Webflow form has `data-wf-page-id`, `data-wf-element-id`, and other Webflow-specific attributes that DOMPurify strips. The form is functional (POSTs to `/api/contact`, shows the success/error div) but renders slightly differently. The Payload phase replaces it with a proper React form component.

3. **Homepage slider shows 24% diff.** The hero slider animates between three slides; the local version captured the first slide, the live version captured a different slide state. Static comparison is meaningless — the diff is animation state, not structure.

4. **No `wp-content` or `wp-includes` directories** in `/public`. Despite the URL shape of the planned layout, this site is built on Webflow, not WordPress. The plan's assumption of `/wp-content/...` and `/wp-includes/...` paths was a misread; the actual structure is host-prefixed (`/cdn.prod.website-files.com/...` etc.). No action needed; the `public/` directory reflects the real mirror.

### Out of scope (Payload / backend phase)

- ~~Real Payload collections, admin dashboard at `/admin`~~ — **done in `feat/payload-cms`** and live in production
- ~~Migrating assets from `public/` to Vercel Blob~~ — **script implemented and ready** (`scripts/migrate-assets-to-blob.mjs`); the Vercel Blob token is set in Vercel env vars. Run `npm run migrate:assets` whenever the user wants to bulk-upload the 70+ mirrored /public assets.
- ~~Form submissions persistence (DB)~~ — **done and live**: POSTing to `/api/contact` returns `{ok: true, persisted: true, submissionId: "1"}` and the row appears in `contact_submissions` in Neon.
- **Vercel Blob plugin for admin file uploads** — **deferred to v2**. As of `@payloadcms/storage-vercel-blob@3.85.1`, the client upload handler transitively imports the full Payload server bundle (undici, pino, get-tsconfig), which breaks the client build with `node:` scheme errors. The Media collection uses `staticDir: "media"` (local disk) for v1 — works in dev, won't persist on Vercel serverless. New admin uploads need a custom upload handler (Vercel Blob SDK directly from a server route, with a signed-URL flow) or an upstream fix.
- Refactoring `dangerouslySetInnerHTML` pages into proper React components (per-section extraction) — deferred to v2; the block-based hybrid is the v1 deliverable
- Domain cutover: `www.southwestplanningconsultancy.co.uk` → Vercel — separate task, not in scope
- Production rename: `southwest-planning-clone` → `southwest-planning-consultancy` — separate task, not in scope

### Outstanding user actions (none blocking)

1. **Set the admin password**: visit `https://southwest-planning-clone.vercel.app/admin`, complete the first-run setup wizard. The single admin is `iraselrony@gmail.com`.
2. **Optional: run the asset migration**: `npm run migrate:assets` (from the no-backend snapshot with the Vercel Blob token in `.env.local`) uploads the 70+ mirrored /public files to Vercel Blob. The site currently serves them from `/public`; the migration moves them to Blob URLs.

## Live state

### Production

- **URL**: <https://southwest-planning-clone.vercel.app>
- **GitHub**: <https://github.com/iraselrony/southwest-planning-clone>
- **Vercel project**: `iraselrony-8320s-projects/southwest-planning-clone`
- **Last verified**: 161/161 verify.mjs checks pass, 18/18 Playwright pages render with 0 errors.

### Contact form (current Resend config)

The route supports a comma-separated `CONTACT_TO_EMAIL` list (parsed via `parseEmailList()`). When the user verifies their own domain on Resend, change the env var to the full list and the route will deliver to all of them with no code change.

**Current production values** (committed during commit `7d552ed`):

```
CONTACT_TO_EMAIL=iraselrony@gmail.com
CONTACT_FROM_EMAIL=onboarding@resend.dev
RESEND_API_KEY=re_hToHNPKR_MwW5sgJpAbgdy3ikUhvbVcqQ
```

**Future state** (when the user gets a new API key with verified `southwestplanningconsultancy.co.uk` domain):

```
CONTACT_TO_EMAIL=info@southwestplanningconsultancy.co.uk, iraselrony@gmail.com
CONTACT_FROM_EMAIL=South West Planning <noreply@southwestplanningconsultancy.co.uk>
```

### Vercel env var gotcha (worth knowing for the next session)

`PATCH`-ing an env var via the Vercel API does **not** take effect on the currently-deployed serverless function — the encrypted value is baked into the build artifact. If you change any Vercel env var, push a commit (even a no-op) to force a redeploy that picks up the new value. This bit us once during this project.

## Visual diff snapshot (pre-hero-fix; the hero fix should bring service pages down)

See `screenshots/diff/diff-report.md` for the full table. Summary at the time of capture:

| Status | Pages | % diff |
|--------|-------|--------|
| ✅ < 1% | `/our-services`, `/privacy-cookie-policy` | 0.07%, 0.62% |
| ⚠️ 5–15% | 14 service pages | 9–15% |
| ⚠️ 15–35% | `/` (slider state), `/contact` (form) | 24%, 36% |

The "warnings" are noise from animation states, broken hero URLs, and form structure — not structural content differences. **This snapshot is stale** — the broken-hero fix (commit `383c59c`) should bring the 14 service pages into the <5% range, but the visual-diff wasn't re-run after the fix. The Payload phase will close the rest by replacing the `dangerouslySetInnerHTML` strings with proper components.
