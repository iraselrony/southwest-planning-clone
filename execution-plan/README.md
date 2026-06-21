# Project: Southwest Planning Consultancy — Frontend Clone

A pixel-faithful Next.js 15 clone of [www.southwestplanningconsultancy.co.uk](https://www.southwestplanningconsultancy.co.uk), generated from a wget mirror. The frontend is complete and deployed. The Payload CMS 3 backend is scaffolded on branch `feat/payload-cms` — see `next-phase.md` for the deployment checklist.

## What this is

- **Stack**: Next.js 15.3.9 (App Router) + React 19 + TypeScript + original Webflow CSS + self-hosted Montserrat (`next/font/google`) + jQuery + Webflow runtime.
- **Asset strategy**: every CSS/JS/image/font mirrored from the live site lives under `/public/<host>/...` preserving the original URL paths, so internal references resolve identically. No rewrites, no asset migrations.
- **Content rendering**: each page route reads its HTML from `execution-plan/raw-mirror/...` and renders the body via `dangerouslySetInnerHTML` after DOMPurify sanitization. The 5 transformations in `app/_lib/page.ts` (footer-credit strip, asset-path absolutisation, `.html` link rewrite, broken-hero unwrap, animation reveal) run on every page render. This is the most reliable way to hit 100% visual parity on day one, and the file paths map 1:1 to original URLs — exactly what the Payload phase will refactor against.
- **SEO**: per-page `<title>`, meta description, OG, Twitter Card, OG image, and canonical URL come from `app/_lib/seo.ts` (the source of truth) with the original Webflow HTML as a fallback. `/sitemap.xml` lists every original URL. `/robots.txt` reproduces the original.
- **Contact forms**: the two Webflow-style forms (one on `/contact`, one on every `/services/*`) POST to `/api/contact`, which validates input, normalises the two different Webflow field-name conventions, and sends via the **Resend SDK** to a comma-separated recipient list parsed from `CONTACT_TO_EMAIL`. A client-side interceptor (`public/contact-form.js`) catches the default `method="get"` form submit and routes the response into the existing `.w-form-done` / `.w-form-fail` divs.
- **Verification**: `scripts/verify.mjs` runs 161 checks including a **link-crawl** (catches any internal `.html` link that 404s) — added in response to the major bug where all 21+ per-page internal links were 404ing in production.

## What this is NOT (yet)

- ~~Not a proper React component tree.~~ — The block-based hybrid keeps `dangerouslySetInnerHTML` rendering; the React component refactor is a v2 concern.
- ~~Not connected to a CMS.~~ — Payload CMS 3 is scaffolded on branch `feat/payload-cms`; admin at `/admin`, 5 collections, 1 global, contact-submission persistence wired. Needs Neon + Vercel Blob to go live (see `next-phase.md`).
- Not the production domain. The site is deployed at `southwest-planning-clone.vercel.app`; the client domain cutover (`www.southwestplanningconsultancy.co.uk` → Vercel) is still pending.
- Not on a verified Resend domain. The current Resend API key only allows sending to the account owner's verified email (`iraselrony@gmail.com`); the route is already configured to support `info@southwestplanningconsultancy.co.uk` once the user verifies their domain on Resend.

## How to run

```bash
# from project root
npm install
cp .env.local.example .env.local   # if starting fresh; see "Resend config" below
npm run dev               # http://localhost:3000
# or production
npm run build
npm run start
```

Visit `http://localhost:3000/` — all 18 original URLs are routable.

## Live deployment

- **Production URL**: <https://southwest-planning-clone.vercel.app>
- **GitHub**: <https://github.com/iraselrony/southwest-planning-clone>
- **Vercel project**: `iraselrony-8320s-projects/southwest-planning-clone` (auto-deploys on push to `main`)
- **Last verified on production**: 161/161 verify.mjs checks pass, 18/18 Playwright pages render with 0 errors, contact form returns 200 + Resend message ID on real submission.

## How to verify

```bash
# 1. Link-crawl — verifies every internal link in every page returns 200
#    (the most important check; catches the .html 404 bug)
node scripts/verify.mjs

# 2. Visual smoke test — every page, full Playwright crawl with scroll
node scripts/smoke-screenshot.mjs

# 3. Visual diff against the live site
node scripts/visual-diff.mjs
#   outputs execution-plan/screenshots/diff/diff-report.md
#   writes per-URL diff PNGs alongside
```

## Resend config (contact form)

The route reads three env vars. Set them in `.env.local` for dev or in the Vercel project for prod.

```
RESEND_API_KEY=re_xxx                                  # required
CONTACT_TO_EMAIL=iraselrony@gmail.com                  # single address or comma-separated list
CONTACT_FROM_EMAIL=onboarding@resend.dev               # must be on a Resend-verified domain in prod
```

When the user verifies `southwestplanningconsultancy.co.uk` on Resend, change to:

```
CONTACT_TO_EMAIL=info@southwestplanningconsultancy.co.uk, iraselrony@gmail.com
CONTACT_FROM_EMAIL=South West Planning <noreply@southwestplanningconsultancy.co.uk>
```

The route already supports comma-separated `TO` via `parseEmailList()`, so no code change is needed.

**Vercel env var gotcha:** `PATCH`-ing an env var via the Vercel API does **not** take effect on the currently-deployed serverless function — the encrypted value is baked into the build artifact. If you change any Vercel env var, push a commit (even a no-op) to force a redeploy that picks up the new value.

## How to resume (for the next agent)

- **`progress.md`** — current state, what's done, what's left, visual-diff snapshot (stale, predates the hero fix).
- **`next-phase.md`** — Payload-phase handoff contract. Items already done during the frontend phase are marked with `[x]` (Montserrat self-host, broken-hero fix, contact form to Resend); the rest is the real Payload work.
- **`site-map.md`** — the source of truth for what URLs exist.
- **`seo-audit.md`** — the source of truth for what each page's metadata was originally; the live values are now in `app/_lib/seo.ts` (canonical URLs are added; titles/descriptions match the SEO data, not the Webflow HTML placeholders).
- **`assets.md`** — every mirrored file with checksums (the `public/` directory has the same set, plus the 14 hero images, the OG image, and the 3 missing PNG/SVG assets that were downloaded after the original mirror).
- **Project memory** (in the agent's persistent memory) has the final state of the project, the Resend config, and the env-var-PATCH gotcha.

## Files of interest

```
app/
  layout.tsx               # Root layout — Webflow CSS, next/font/google, Webflow JS
  globals.css              # Reset + body font override for self-hosted Montserrat
  page.tsx                 # Home (auto-generated)
  _lib/
    page.ts                # extractBodyInner + buildHeadFromHtml (5 transformations)
    seo.ts                 # Hardcoded { title, description } for all 18 pages
  (routes)/
    <slug>/page.tsx        # Auto-generated, calls getPageSeo() in generateMetadata
  api/contact/route.ts     # POST → Resend SDK, validates, normalises field names
  sitemap.ts               # Reads site-map.md → emits /sitemap.xml
  robots.ts                # Reproduces original robots.txt
  not-found.tsx            # 404 page

public/                    # All mirrored assets, host-prefixed (preserves original URLs)
  cdn.prod.website-files.com/
    62c2cea31ea6c6cc6f1800b3/   # main Webflow site: CSS, JS, images, OG
    62c2cea31ea6c658111800bc/   # secondary site: 14 service hero images
  d3e54v103j8qbb.cloudfront.net/  # jQuery
  ajax.googleapis.com/     # webfont.js
  fonts.googleapis.com/    # Google Fonts CSS (root preconnect; actual font is self-hosted)
  contact-form.js          # Client-side form interceptor (method="get" → POST + JSON)

execution-plan/
  README.md                # This file
  site-map.md              # All 18 URLs + their local mirror files
  seo-audit.md             # Per-page original metadata (use for reference; live values in app/_lib/seo.ts)
  assets.md                # All mirrored files with checksums
  progress.md              # What's done / what's left
  next-phase.md            # Handoff contract for Payload
  raw-mirror/              # Source of truth: untouched wget output
  screenshots/
    smoke/                 # Local screenshots (one per URL)
    diff/                  # Local vs live, with diff-report.md

scripts/
  extract-inventory.mjs    # Mirrors → site-map.md, seo-audit.md, assets.md
  generate-routes.mjs      # site-map.md → app/(routes)/<slug>/page.tsx
  copy-assets.mjs          # raw-mirror/ → public/
  smoke-screenshot.mjs     # Screenshots every local URL
  visual-diff.mjs          # Local vs live, writes diff-report.md
  verify.mjs               # 161 checks incl. link-crawl — primary verification
```

## Known issues (carry-forward)

See `progress.md` "Known issues" section. Summary: visual diff is 5–15% on service pages (mostly anti-aliasing) and 24–36% on the homepage + contact page (mostly animation state and DOMPurify-stripped form attributes). The Payload refactor closes all of these.
