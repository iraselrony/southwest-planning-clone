# Next Phase — Payload CMS + Neon + Vercel Blob + GitHub

This document is the handoff contract for the agent that picks up after the frontend clone. The frontend phase produced a working Next.js site that visually matches the original; this phase wires it to a real CMS, real database, real media hosting, and ships it.

## Source artifacts (read these first)

- `execution-plan/site-map.md` — 18 URLs, one row each, with local mirror path. This is the inventory of what pages exist.
- `execution-plan/seo-audit.md` — per-page `<title>`, meta description, OG, Twitter Card, canonical, JSON-LD (none on this site), image alts. Every field must remain in the rendered output.
- `execution-plan/assets.md` — 56 files currently in `/public/`, with checksums. These will be migrated to Vercel Blob.
- `execution-plan/screenshots/diff/diff-report.md` — current visual diff state vs the live site.
- `execution-plan/progress.md` — known issues to address.

## What to build

### 1. Payload CMS schema

Mirror the URL structure into Payload collections:

- `pages` collection — singleton fields or one entry per route. Fields:
  - `slug` (auto from URL)
  - `title` (H1)
  - `metaTitle` (for `<title>`)
  - `metaDescription`
  - `ogImage` (upload)
  - `body` (rich text or a `lexical` block) — split the rendered HTML into blocks (hero, service cards grid, about, footer, etc.)
  - `showInNav` (boolean)
- `services` collection — one entry per service (Housing, Leisure Development, etc.). Fields:
  - `slug`
  - `name`
  - `subtitle` (e.g. "01", "02"…)
  - `cardImage` (upload)
  - `description` (short)
  - `longDescription` (rich text)
  - `contactFormEnabled` (per-service)
- `siteSettings` global — single instance. Fields:
  - `logo` (upload)
  - `companyName`, `companyTagline`
  - `address` (multi-line)
  - `phoneNumbers` (array of strings)
  - `email`
  - `socialLinks` (Instagram, Twitter, LinkedIn, Facebook)
  - `registrationNumber`, `registeredOffice`
  - `footerText`
- `contactSubmissions` collection — captures POSTs to `/api/contact`. Fields:
  - `name`, `email`, `phone`, `message`
  - `submittedAt` (auto)
  - `source` (string — to distinguish contact page vs service page form)

### 2. Migrate the HTML body into proper components

Today, every page is a `dangerouslySetInnerHTML` blob. Replace each page component with proper React components that pull from Payload. The shared sections to extract first:

- `<SiteHeader>` — nav, logo, mobile menu
- `<HeroSection>` — background image, title, subtitle
- `<ServiceCardsGrid>` — the 14-card grid on the homepage
- `<AboutSection>` — about copy + list
- `<LocalAuthoritySteps>` — the LPA coverage section
- `<ContactCTA>` — the "Ready to get your project moving?" banner
- `<SiteFooter>` — footer with company info, nav, socials
- `<ContactForm>` — wired to `/api/contact`
- `<SEO>` — wraps generateMetadata, reads from a `getPageSeo(slug)` helper

The auto-generated `app/(routes)/<slug>/page.tsx` files can stay as the route file; just replace their body with a `<PageRenderer slug={slug} />` that fetches from Payload and composes the components.

### 3. Move assets to Vercel Blob

The 56 files currently in `public/` should be uploaded to Vercel Blob. Then:

- Add `@vercel/blob` client
- Add an `uploadFromPublic()` Payload hook that runs once on first boot to bulk-upload `public/cdn.prod.website-files.com/**`, `public/d3e54v103j8qbb.cloudfront.net/**`, `public/ajax.googleapis.com/**`
- Replace host-prefixed URLs in Payload content with Blob URLs
- Keep the original host-prefixed files in `public/` as a fallback until the migration is verified

### 4. Self-host Montserrat

Swap the Google Fonts `<link>` in `app/layout.tsx` for `next/font/google`:

```ts
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300','400','500','600','700','800'] });
```

The Webflow CSS references `font-family: Montserrat, sans-serif`. To make the Webflow CSS pick up the Next-loaded font, either (a) add a `:root { --font-default: ${montserrat.style.fontFamily}; }` and a CSS layer that overrides the Webflow rules, or (b) update the Webflow CSS in `public/cdn.prod.../...css` to use the Next-injected font variable. (b) is invasive; (a) is cleaner.

### 5. Fix the broken hero background images

Every service page has a `style="background-image:url(...&quot;...&quot;)"` in the hero `<div>`. The `&quot;` breaks the URL. Two options:

1. Re-host the original images by fetching them from the secondary Webflow site ID `62c2cea31ea6c658111800bc` (not in the current mirror). Direct URL pattern: `https://cdn.prod.website-files.com/62c2cea31ea6c658111800bc/6492c6dbd9bfcd3d8e02294f_Housing.jpg`. Bulk-download all 14 service hero images to Vercel Blob.
2. As a Payload refactor, change the hero to use an `<img>` element or a proper CSS background-image on a class instead of inline style. Then the URL is well-formed.

### 6. Wire the contact form

Replace `app/api/contact/route.ts` with a version that:

- Validates input (zod or similar)
- Inserts into the `contactSubmissions` Payload collection via Payload Local API
- Returns `{ ok: true, id: <submissionId> }`
- Optionally sends an email notification (Resend, Postmark, or SMTP) — separate concern, can be deferred

The contact page's form should also be replaced with a proper React component that uses `useFormState` for inline success/error states.

### 7. GitHub + Vercel

- Create a GitHub repo (name TBD with the client)
- Push the current state as the initial commit
- Connect the repo to Vercel
- Add environment variables: `DATABASE_URL` (Neon), `BLOB_READ_WRITE_TOKEN` (Vercel Blob), `PAYLOAD_SECRET`
- Configure Vercel to use `npm run build` and serve on the default Next.js target

### 8. Domain cutover

Once deployed and verified on a preview URL:

- Update DNS to point `www.southwestplanningconsultancy.co.uk` to Vercel
- Add a 301 redirect from the old platform to the new site for any URLs we missed (use the `site-map.md` as the authoritative list)
- Submit the new sitemap to Google Search Console

## Open questions to resolve with the client

- **Domain** — are we keeping the same `www.southwestplanningconsultancy.co.uk`? If yes, DNS cutover is needed. If new domain, register before launch.
- **Email notifications** — do form submissions need to email someone? If so, which address, and which provider?
- **Content editing workflow** — who at the client edits content? Payload has user auth; we need to provision their account.
- **Analytics** — keep GA (G-R7H0V9MLPD) or migrate to GA4?
- **Cookie consent** — the original has a privacy-cookie-policy page; the live site has no consent banner. Payload phase should add a banner to satisfy GDPR (the firm is UK-based).

## What NOT to do

- Don't re-architect the route structure. The 18 routes map cleanly to Payload pages and the URL paths are already preserved.
- Don't rebuild the Webflow components from scratch unless the visual diff demands it. The Webflow CSS in `public/cdn.prod.website-files.com/.../...css` is the source of truth for design; editing it is fine, replacing it with a Tailwind/utility rewrite is not in scope.
- Don't migrate the asset hosts to `/wp-content/...` — that was a plan-phase misread. The actual structure is host-prefixed and that works.

## Acceptance criteria for the Payload phase

1. `npm run dev` shows the same visual output as the current frontend phase (within 1% pixel diff for all pages except those with known animation differences).
2. Payload admin is accessible at `/admin` and the client can edit all fields.
3. Form submissions persist in the `contactSubmissions` collection and are visible in the admin.
4. Lighthouse SEO ≥ 95 on homepage and one service page.
5. Vercel build is green, preview deploy works, production deploy works.
6. All 18 original URLs return 200 on the production domain.
7. Sitemap and robots.txt match the originals.
8. No external CDN dependencies at runtime (Google Fonts self-hosted, all images on Vercel Blob).
