# Next Phase — Payload CMS + Neon + Vercel Blob + GitHub

This document is the handoff contract for the agent that picks up after the frontend clone. The frontend phase produced a working Next.js site that visually matches the original; this phase wires it to a real CMS, real database, real media hosting, and ships it.

## Status of the frontend phase (what's already done)

The frontend phase is **complete**. Several items that the original `next-phase.md` listed as "to do" have already been done in the frontend phase — they're marked `[x]` below with a short note. The remaining work is the real Payload / Neon / Vercel Blob backend.

Done in the frontend phase (no longer needed in the Payload phase):

- [x] **Self-host Montserrat** (`next/font/google` in `app/layout.tsx`, with the CSS variable `--font-montserrat` applied to `<body>` and an override in `app/globals.css`). Zero external CDN dependencies for fonts.
- [x] **Fix the broken hero background images** on 14 service pages. `fixBrokenHeroBackgrounds()` unwraps the `&quot;` entities, and all 14 hero images were downloaded from the secondary Webflow site ID `62c2cea31ea6c658111800bc` to `public/cdn.prod.website-files.com/62c2cea31ea6c658111800bc/`. The browser's URL-encoded requests resolve correctly to those files.
- [x] **Wire the contact form**. `app/api/contact/route.ts` already validates input, normalises the two Webflow field-name conventions (`First-name` / `First-name-2`), and sends via the Resend SDK to a comma-separated list of recipients. `public/contact-form.js` intercepts the form's default `method="get"` submit. The Payload phase adds the database insert alongside the email send.
- [x] **Per-page SEO content** lives in `app/_lib/seo.ts` as a hardcoded `{ title, description }` map. The Payload phase replaces this with a Payload `pages` collection lookup; the data shape and the `getPageSeo(slug)` function signature stay the same so page components don't change.
- [x] **Canonical URL** is added by `buildHeadFromHtml()` for every page (the original Webflow HTML had no canonical on most pages).
- [x] **GFIVEDESIGN footer credit** is stripped by `removeFooterCredits()`.
- [x] **Internal `.html` link 404s** are fixed by `rewriteInternalLinks()`. Plus a **link-crawl check** in `scripts/verify.mjs` (check #7) catches any regression.
- [x] **GitHub repo created and Vercel project linked**: <https://github.com/iraselrony/southwest-planning-clone> and `iraselrony-8320s-projects/southwest-planning-clone`. Auto-deploy on push to `main`.
- [x] **Resend env vars set on Vercel** for production + preview: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. The current `CONTACT_TO_EMAIL` is `iraselrony@gmail.com` (single recipient, free-tier) — when the user verifies their domain, change to the full list and the route will deliver to all recipients with no code change.

## Source artifacts (read these first)

- `execution-plan/site-map.md` — 18 URLs, one row each, with local mirror path. This is the inventory of what pages exist.
- `execution-plan/seo-audit.md` — per-page `<title>`, meta description, OG, Twitter Card, canonical, JSON-LD (none on this site), image alts from the **original** Webflow HTML. The **current** SEO values are in `app/_lib/seo.ts` — they match `seo-audit.md` except where the original had a generic placeholder (the 14 service pages originally had `<title>Southwest Planning Consultancy</title>` and no description; the new titles/descriptions are keyword-specific).
- `execution-plan/assets.md` — every mirrored file with checksums. `public/` has the same set, plus 14 hero images, the OG image, and 3 PNG/SVG assets that were downloaded after the original mirror.
- `execution-plan/screenshots/diff/diff-report.md` — current visual diff state vs the live site. **Stale** — was captured before the broken-hero fix; the 14 service pages should now be in the <5% range. Re-run `node scripts/visual-diff.mjs` to get the current numbers.
- `execution-plan/progress.md` — known issues to address, visual diff snapshot, current Resend config, Vercel env var gotcha.
- `app/_lib/seo.ts` — current SEO data; replace with a Payload `pages` collection lookup (same shape).
- `app/api/contact/route.ts` — current email send; add a Payload Local API insert into `contactSubmissions` alongside the existing Resend send.

## What to build

### 1. Payload CMS schema

Mirror the URL structure into Payload collections:

- `pages` collection — one entry per route. Fields:
  - `slug` (auto from URL)
  - `title` (H1)
  - `metaTitle` (for `<title>`) — seed from `app/_lib/seo.ts`
  - `metaDescription` — seed from `app/_lib/seo.ts`
  - `ogImage` (upload; default to `Southwest-og.jpg` for all pages)
  - `body` (rich text or a `lexical` block) — split the rendered HTML into blocks (hero, service cards grid, about, footer, etc.)
  - `showInNav` (boolean)
- `services` collection — one entry per service (Housing, Leisure Development, etc.). Fields:
  - `slug`
  - `name`
  - `subtitle` (e.g. "01", "02"…)
  - `cardImage` (upload)
  - `description` (short)
  - `longDescription` (rich text)
  - `contactFormEnabled` (per-service — currently true for all 14)
- `siteSettings` global — single instance. Fields:
  - `logo` (upload)
  - `companyName`, `companyTagline`
  - `address` (multi-line)
  - `phoneNumbers` (array of strings: `01392 984 206`, `07779 285 376`, `07525 059 569`)
  - `email` (`info@southwestplanningconsultancy.co.uk`)
  - `socialLinks` (Instagram, Twitter, LinkedIn, Facebook)
  - `registrationNumber` (`13398455`)
  - `registeredOffice` (The Generator Hub, The Gallery, Kings Wharf, The Quay, Exeter, Devon, EX2 4AN)
  - `footerText`
- `contactSubmissions` collection — captures POSTs to `/api/contact`. Fields:
  - `name`, `email`, `phone`, `message`
  - `submittedAt` (auto)
  - `source` (string — already populated: `contact-page` or `service-page:<slug>`)

### 2. Migrate the HTML body into proper components

Today, every page is a `dangerouslySetInnerHTML` blob. Replace each page component with proper React components that pull from Payload. The shared sections to extract first:

- `<SiteHeader>` — nav, logo, mobile menu
- `<HeroSection>` — background image, title, subtitle
- `<ServiceCardsGrid>` — the 14-card grid on the homepage
- `<AboutSection>` — about copy + list
- `<LocalAuthoritySteps>` — the LPA coverage section
- `<ContactCTA>` — the "Ready to get your project moving?" banner
- `<SiteFooter>` — footer with company info, nav, socials (driven by `siteSettings`)
- `<ContactForm>` — wired to `/api/contact` (with the per-service enable flag from `services.contactFormEnabled`)
- `<SEO>` — wraps `generateMetadata`, reads from Payload's `pages` collection via a `getPageSeo(slug)` helper that replaces `app/_lib/seo.ts`

The auto-generated `app/(routes)/<slug>/page.tsx` files can stay as the route file; just replace their body with a `<PageRenderer slug={slug} />` that fetches from Payload and composes the components.

### 3. Move assets to Vercel Blob

The 70+ files currently in `public/` should be uploaded to Vercel Blob. Then:

- Add `@vercel/blob` client
- Add an `uploadFromPublic()` Payload hook that runs once on first boot to bulk-upload `public/cdn.prod.website-files.com/**`, `public/d3e54v103j8qbb.cloudfront.net/**`, `public/ajax.googleapis.com/**`
- Replace host-prefixed URLs in Payload content with Blob URLs
- Keep the original host-prefixed files in `public/` as a fallback until the migration is verified

### 4. Domain cutover

Once deployed and verified on a preview URL:

- Reconcile the pre-existing private repo `iraselrony/southwest-planning-consultancy` and Vercel project of the same name (with ~20 prior deployments): either reuse them, or delete them and rename `southwest-planning-clone` → `southwest-planning-consultancy` so the production domain cutover has a single source of truth.
- Update DNS to point `www.southwestplanningconsultancy.co.uk` to Vercel
- Add a 301 redirect from the old platform to the new site for any URLs we missed (use the `site-map.md` as the authoritative list)
- Submit the new sitemap to Google Search Console

## Open questions to resolve with the client

- **Domain** — are we keeping the same `www.southwestplanningconsultancy.co.uk`? If yes, DNS cutover is needed. If new domain, register before launch.
- **Resend** — when does the user get a new Resend API key with a verified `southwestplanningconsultancy.co.uk` domain? Once they do, change `CONTACT_FROM_EMAIL` to use that domain and `CONTACT_TO_EMAIL` to the full list (`info@southwestplanningconsultancy.co.uk, iraselrony@gmail.com`). The route already supports both — just update the env vars and push a commit to trigger a redeploy.
- **Content editing workflow** — who at the client edits content? Payload has user auth; we need to provision their account.
- **Analytics** — keep GA (G-R7H0V9MLPD) or migrate to GA4?
- **Cookie consent** — the original has a privacy-cookie-policy page; the live site has no consent banner. Payload phase should add a banner to satisfy GDPR (the firm is UK-based).

## What NOT to do

- Don't re-architect the route structure. The 18 routes map cleanly to Payload pages and the URL paths are already preserved.
- Don't rebuild the Webflow components from scratch unless the visual diff demands it. The Webflow CSS in `public/cdn.prod.website-files.com/.../...css` is the source of truth for design; editing it is fine, replacing it with a Tailwind/utility rewrite is not in scope.
- Don't migrate the asset hosts to `/wp-content/...` — that was a plan-phase misread. The actual structure is host-prefixed and that works.
- Don't remove the `rewrites()` block in `next.config.mjs` (the `/contact.html` → `/contact` safety net) — it's cheap and helps if anyone has a cached old link.

## Frontend-phase acceptance criteria (already met)

1. [x] `npm run build` succeeds with 0 TS errors, all 23 routes prerendered.
2. [x] All 18 original URLs return 200 on the production domain.
3. [x] Every internal link in every page returns 200 (link-crawl check, verify.mjs #7).
4. [x] Sitemap and robots.txt match the originals; canonical URL set on every page.
5. [x] Per-page `<title>` and meta description match the SEO data in `app/_lib/seo.ts` (not the Webflow HTML placeholders).
6. [x] No external CDN dependencies at runtime (Google Fonts self-hosted, all images served same-origin from `public/`).
7. [x] Contact form returns 200 + Resend message ID on real submission; success/error message visible in the form's `.w-form-done` / `.w-form-fail` divs in the browser.
8. [x] `verify.mjs` reports "161 checks, 161 passed, 0 failed".
9. [x] 18/18 Playwright smoke tests pass with 0 console errors and 0 4xx sub-resources on the live production URL.

## Acceptance criteria for the Payload phase

1. `npm run dev` shows the same visual output as the current frontend phase (within 1% pixel diff for all pages except those with known animation differences).
2. Payload admin is accessible at `/admin` and the client can edit all fields.
3. Form submissions persist in the `contactSubmissions` collection and are visible in the admin.
4. Lighthouse SEO ≥ 95 on homepage and one service page.
5. Vercel build is green, preview deploy works, production deploy works.
6. All 18 original URLs return 200 on the production domain.
7. Sitemap and robots.txt match the originals.
8. No external CDN dependencies at runtime (Google Fonts self-hosted — done; all images on Vercel Blob — todo).
