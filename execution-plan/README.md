# Project: Southwest Planning Consultancy — Frontend Clone

A pixel-faithful Next.js 15 clone of [www.southwestplanningconsultancy.co.uk](https://www.southwestplanningconsultancy.co.uk), generated from a wget mirror. Backend (Payload CMS, Neon, Vercel Blob) is deferred to a later phase — see `next-phase.md`.

## What this is

- **Stack**: Next.js 15.3.9 (App Router) + React 19 + TypeScript + original Webflow CSS + Google Fonts (Montserrat) + jQuery + Webflow runtime.
- **Asset strategy**: every CSS/JS/image/font mirrored from the live site lives under `/public/<host>/...` preserving the original URL paths, so internal references resolve identically. No rewrites, no asset migrations.
- **Content rendering**: each page route reads its HTML from `execution-plan/raw-mirror/...` and renders the body via `dangerouslySetInnerHTML` after DOMPurify sanitization. This is the most reliable way to hit 100% visual parity on day one, and the file paths map 1:1 to original URLs — exactly what the Payload phase will refactor against.
- **SEO**: per-page `<title>`, meta description, OG, Twitter Card, and OG image are all extracted from each mirrored page's `<head>` and emitted by `generateMetadata`. `/sitemap.xml` lists every original URL. `/robots.txt` reproduces the original.

## What this is NOT (yet)

- Not a proper React component tree. The pages render mirrored HTML; structure is intentionally a string for the Payload refactor.
- Not connected to a CMS. Form submissions log to the console at `app/api/contact/route.ts`. No persistence.
- Not deployed. Runs locally via `npm run dev` or `npm run build && npm run start`.

## How to run

```bash
# from project root
npm install
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

Verified live: all 18 routes return 200, sitemap/robots present, form endpoint accepts POST, all static assets resolve.

## How to verify

```bash
# Smoke screenshot of every URL on the local server
node scripts/smoke-screenshot.mjs

# Full visual diff against the live site
node scripts/visual-diff.mjs
#   outputs execution-plan/screenshots/diff/diff-report.md
#   writes per-URL diff PNGs alongside
```

## How to resume (for the next agent)

See `progress.md` for current state and `next-phase.md` for the Payload-phase handoff contract. The `site-map.md` is the source of truth for what URLs exist; the `seo-audit.md` is the source of truth for what each page's metadata must remain.

## Files of interest

```
app/
  layout.tsx               # Root layout — Webflow CSS, Google Fonts, Webflow JS
  globals.css              # Reset
  page.tsx                 # Home (auto-generated)
  _lib/page.ts             # extractBodyInner + buildHeadFromHtml helpers
  (routes)/
    <slug>/page.tsx        # Auto-generated one folder per discovered URL
  api/contact/route.ts     # POST stub — logs to console
  sitemap.ts               # Reads site-map.md → emits /sitemap.xml
  robots.ts                # Reproduces original robots.txt
  not-found.tsx            # 404 page

execution-plan/
  README.md                # This file
  site-map.md              # All 18 URLs + their local mirror files
  seo-audit.md             # Per-page title, description, OG, JSON-LD, alts
  assets.md                # 56 mirrored files with checksums
  progress.md              # What's done / what's left
  next-phase.md            # Handoff contract for Payload
  raw-mirror/              # Source of truth: untouched wget output
  screenshots/
    smoke/                 # Local screenshots (one per URL)
    diff/                  # Local vs live, with diff-report.md

public/                    # All mirrored assets, host-prefixed
  cdn.prod.website-files.com/  # Webflow CSS, JS, images
  d3e54v103j8qbb.cloudfront.net/  # jQuery
  ajax.googleapis.com/     # webfont.js
  fonts.googleapis.com/    # Google Fonts CSS (root preconnect)
  www.southwestplanningconsultancy.co.uk/  # (should be empty; HTML is consumed by app/ not served)

scripts/
  extract-inventory.mjs    # Mirrors → site-map.md, seo-audit.md, assets.md
  generate-routes.mjs      # site-map.md → app/(routes)/<slug>/page.tsx
  copy-assets.mjs          # raw-mirror/ → public/
  smoke-screenshot.mjs     # Screenshots every local URL
  visual-diff.mjs          # Local vs live, writes diff-report.md
```

## Known issues (intentional or to revisit)

See `progress.md` "Known issues" section.
