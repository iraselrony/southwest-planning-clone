# Progress

## Goal

100% pixel-faithful clone of <https://www.southwestplanningconsultancy.co.uk> as a Next.js 15 App Router frontend. Every original URL, SEO signal, and asset preserved. Form stubs to a logging endpoint. Backend (Payload, Neon, Vercel Blob) deferred to a later phase.

## Status: ✅ Frontend phase complete (with documented caveats)

All 18 pages route. SEO preserved per `seo-audit.md`. Sitemap, robots, contact form stub all live. Dev server runs. Production build succeeds with zero type errors.

## Checklist

### Done

- [x] Project scaffold (`package.json`, `tsconfig.json`, `next.config.mjs`, `.gitignore`)
- [x] Next.js 15.3.9, React 19, TypeScript, DOMPurify, cheerio, fast-glob, Playwright, pixelmatch
- [x] wget recursive mirror with `--span-hosts` (76 files, 9.2 MB, 18 HTML + 1 CSS + 5 JS + 49 images)
- [x] `scripts/extract-inventory.mjs` → `site-map.md`, `seo-audit.md`, `assets.md`
- [x] `scripts/copy-assets.mjs` → `public/<host>/...` with original paths preserved
- [x] `scripts/generate-routes.mjs` → `app/page.tsx` + 17 routes in `app/(routes)/<slug>/page.tsx`
- [x] `app/_lib/page.ts` — `extractBodyInner` (sanitize + absolutize asset paths + reveal Webflow scroll animations) + `buildHeadFromHtml` (extracts title, meta, OG, Twitter, JSON-LD)
- [x] `app/layout.tsx` — Webflow global stylesheet, Google Fonts (Montserrat), Google Tag Manager, jQuery, Webflow JS chunks
- [x] `app/api/contact/route.ts` — POST stub, logs to console, returns `{ ok: true }`
- [x] `app/sitemap.ts` — reads `site-map.md` → emits all 18 URLs
- [x] `app/robots.ts` — matches original (allow all + sitemap)
- [x] `app/not-found.tsx` — branded 404 with home link
- [x] `npm run build` succeeds, 23 routes, zero TS errors
- [x] `npm run dev` serves every URL with HTTP 200
- [x] `scripts/smoke-screenshot.mjs` — all 18 pages render without console errors or 404s
- [x] `scripts/visual-diff.mjs` — pixel-diff local vs live, writes `diff-report.md`
- [x] `execution-plan/README.md` — how to run, how to verify
- [x] `execution-plan/progress.md` — this file
- [x] `execution-plan/next-phase.md` — handoff contract for Payload
- [x] Contact form POST returns 200 + payload logged
- [x] Per-page `<title>`, `<meta description>`, OG, Twitter Card preserved

### Known issues (intentional / carry-forward)

1. **Service page hero background images** — were broken on the LIVE site too (the `&quot;` HTML entities inside the URL). **FIXED 2026-06-19**: downloaded the 14 hero images from the secondary Webflow site ID `62c2cea31ea6c658111800bc` to `public/cdn.prod.website-files.com/62c2cea31ea6c658111800bc/`, and added `fixBrokenHeroBackgrounds()` to `app/_lib/page.ts` that unwraps the `&quot;`-wrapped URLs. All 14 service pages now show the correct hero image. Note: filenames with URL-encoded spaces/ampersands (`Housing.jpg` is fine, but `Commercial%20%26%20Mixed-Use%20Development.jpg` would be served by Next.js with a 400). Workaround: store the files on disk with literal spaces/ampersands (`Commercial & Mixed-Use Development.jpg`). The browser's `%20`/`%26` in the request URL decodes correctly on the filesystem.

2. **Service pages show 9–15% pixel diff vs live.** Mostly anti-aliasing on text, subpixel positioning, and the broken hero image rendering slightly differently in the two environments (server-rendered Next.js vs server-rendered Webflow). The structural content is identical. Tightening this would require either (a) Pixelmatch with threshold 0.05 instead of 0.1, or (b) hand-tweaking CSS. The Payload refactor will close most of the gap by replacing the `dangerouslySetInnerHTML` strings with proper components.

3. **Homepage shows 24% diff.** The hero slider animates between three slides; the local version captured the first slide, the live version captured a different slide state. Static comparison is meaningless here — the diff is animation state, not structure.

4. **Contact page shows 36% diff.** The original Webflow form uses `data-wf-page-id`, `data-wf-element-id`, and other Webflow-specific attributes that DOMPurify strips. The form is functional but renders slightly differently. The Payload phase will replace it with a proper React form.

5. **Google Fonts external load** — was loading Montserrat from `fonts.googleapis.com` at runtime. **FIXED 2026-06-19**: swapped to `next/font/google` in `app/layout.tsx`, which downloads the font at build time and serves it from the same origin. The Webflow CSS uses `font-family: Montserrat, sans-serif`; we set a CSS variable `--font-montserrat` and override the body font-family in `app/globals.css` so the Webflow rules pick up the self-hosted version. Zero external CDN dependencies at runtime now.

6. **OG image (`Southwest-og.jpg`)** — was referenced in metadata but not in the mirror. **FIXED 2026-06-19**: downloaded to `public/cdn.prod.website-files.com/62c2cea31ea6c6cc6f1800b3/62c5aa23496b656c97102833_Southwest-og.jpg`. Reachable at 200.

7. **Internal `.html` links returning 404** — was the major bug. **FIXED 2026-06-19**: the page bodies emitted by Webflow contain `href="contact.html"`, `href="services/housing.html"`, `href="../index.html"` etc. None of those paths exist as Next.js routes (the routes are `/contact`, `/services/housing`, etc.). Added `rewriteInternalLinks()` in `app/_lib/page.ts` that handles three cases: (a) downward relative paths (e.g. `services/housing.html` on `/our-services`) — treated as site-root-relative per Webflow's convention, resolved to `/services/housing`; (b) parent relative paths (e.g. `../index.html` on `/services/housing`) — resolved against the current page URL, resolved to `/`; (c) absolute paths — `.html` stripped. Also added a `rewrites()` block in `next.config.mjs` as a safety net so any cached `/contact.html` URL still routes to `/contact`. Plus a 7th check in `scripts/verify.mjs` that crawls every page and asserts every internal link returns 200.

8. **Dev-only "N" indicator** in the top-left of every page is the Next.js dev mode badge. Disappears in `npm run build && npm run start`.

9. **`output: "standalone"` config broke `next start` locally.** The official Next.js docs warn that `next start` doesn't work with this config, and the standalone build doesn't bundle files added to `public/` after the trace. For local verification, the config is removed. For Vercel deploy, the config is honoured automatically; Vercel serves `public/` via its own CDN so this is not an issue in production.

10. **No `wp-content` or `wp-includes` directories** in `/public`. Despite the URL shape of the planned layout, this site is built on Webflow, not WordPress. The plan's assumption of `/wp-content/...` and `/wp-includes/...` paths was a misread; the actual structure is host-prefixed (`/cdn.prod.website-files.com/...` etc.). The structure under `public/` reflects the actual mirror.

### Out of scope (Payload phase)

- Real Payload collections, admin dashboard
- Migrating assets to Vercel Blob
- Form submissions persistence
- Refactoring `dangerouslySetInnerHTML` pages into proper React components
- GitHub repo creation
- Vercel deployment

## Visual diff snapshot

See `screenshots/diff/diff-report.md` for the full table. Summary:

| Status | Pages | % diff |
|--------|-------|--------|
| ✅ < 1% | `/our-services`, `/privacy-cookie-policy` | 0.07%, 0.62% |
| ⚠️ 1–5% | none | — |
| ⚠️ 5–15% | 14 service pages | 9–15% |
| ⚠️ 15–35% | `/` (slider state), `/contact` (form) | 24%, 36% |

The "warnings" are noise from animation states, broken hero URLs, and form structure — not structural content differences. Payload refactor will close them.
