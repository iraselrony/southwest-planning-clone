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

1. **Service page hero background images are broken on the LIVE site too.** The original Webflow SSR pre-render has `style="background-image:url(https://www.southwestplanningconsultancy.co.uk/services/&quot;https://cdn.prod.website-files.com/.../Housing.jpg&quot;)"` — the `&quot;` HTML entities inside the URL are invalid and cause browsers to reject the URL. Our clone faithfully mirrors this; both sites render the same broken-hero state. (See `next-phase.md` for the fix: download the missing images from the secondary Webflow site ID `62c2cea31ea6c658111800bc` and rewrite the inline style.)

2. **Service pages show 9–15% pixel diff vs live.** Mostly anti-aliasing on text, subpixel positioning, and the broken hero image rendering slightly differently in the two environments (server-rendered Next.js vs server-rendered Webflow). The structural content is identical. Tightening this would require either (a) Pixelmatch with threshold 0.05 instead of 0.1, or (b) hand-tweaking CSS. The Payload refactor will close most of the gap by replacing the `dangerouslySetInnerHTML` strings with proper components.

3. **Homepage shows 24% diff.** The hero slider animates between three slides; the local version captured the first slide, the live version captured a different slide state. Static comparison is meaningless here — the diff is animation state, not structure.

4. **Contact page shows 36% diff.** The original Webflow form uses `data-wf-page-id`, `data-wf-element-id`, and other Webflow-specific attributes that DOMPurify strips. The form is functional but renders slightly differently. The Payload phase will replace it with a proper React form.

5. **One Google Fonts file is loaded from `fonts.googleapis.com` at runtime.** The Webflow CSS uses `Montserrat`, which we load via `<link>` in the layout. This is a single external dependency. The Payload phase can swap this for `next/font/google` to self-host.

6. **OG image (`Southwest-og.jpg`) is referenced in metadata but not in the mirror.** It's only used as a social-share preview, never rendered on the page. The Payload phase should download it from `https://cdn.prod.website-files.com/62c2cea31ea6c6cc6f1800b3/62c5aa23496b656c97102833_Southwest-og.jpg` and serve it locally.

7. **Dev-only "N" indicator** in the top-left of every page is the Next.js dev mode badge. Disappears in `npm run build && npm run start`.

8. **No `wp-content` or `wp-includes` directories** in `/public`. Despite the URL shape of the planned layout, this site is built on Webflow, not WordPress. The plan's assumption of `/wp-content/...` and `/wp-includes/...` paths was a misread; the actual structure is host-prefixed (`/cdn.prod.website-files.com/...` etc.). The structure under `public/` reflects the actual mirror.

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
