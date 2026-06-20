# Duplication Playbook — Use This Project as a Template for a New Client

This project is a fully-working planning consultancy site with a Webflow
visual template, a custom Next.js frontend, and a custom admin
dashboard. The same structure can be used for any other planning
consultancy (or similar) client by following this playbook. Estimated
time: **2-3 hours** for the basics, longer if the new site has more
or fewer pages / services.

## 0. Prerequisites

- GitHub account with `gh` CLI authenticated
- Vercel account (free tier is fine)
- Neon account (free tier is fine)
- A Resend account for the contact form
- A Vercel Blob store (for admin file uploads — only needed once
  the custom dashboard is built; the contact form works without it)
- The new client's brand assets: logo, hero images, service images
  (or permission to clone from the new client's Webflow site)

## 1. Clone the repo (5 min)

```bash
# Create a new repo from this one (private)
gh repo create <new-client>-planning --template iraselrony/southwest-planning-clone --private

# Clone to your machine
gh repo clone <new-client>-planning
cd <new-client>-planning

# Install deps (including the custom dashboard deps once the backend
# is built)
npm install
```

## 2. Replace the brand assets (30-60 min)

The new client almost certainly has their own Webflow site (or a
similar source). Two options:

**Option A: re-clone from the new client's Webflow site**
Run the `website-clone-pipeline` skill on the new domain. The output
goes into `execution-plan/raw-mirror/<new-domain>/` and
`public/<new-domain>/`. Then re-run `scripts/extract-inventory.mjs`
and `scripts/generate-routes.mjs` to regenerate the routes from the
new mirror.

**Option B: manual asset swap**
Drop the new client's logo and service images into `public/`. The
Webflow HTML mirror in `execution-plan/raw-mirror/` will be the old
client's data — replace it with the new client's HTML files (same
structure: one file per page).

## 3. Edit the config files (15 min)

All site-specific data lives in `config/`. Edit three files:

### `config/site.ts`

```ts
export const SITE: SiteConfig = {
  companyName: "Acme Planning Consultants",      // full legal name
  companyShortName: "Acme Planning",              // for body copy
  companyTagline: "Acme Planning is ...",         // default meta desc
  productionUrl: "https://www.acmeplanning.co.uk",
  contactEmail: "info@acmeplanning.co.uk",
  address: { /* company, street, city, county, postcode, country */ },
  phoneNumbers: ["01234 567 890"],
  socialLinks: { /* instagram, twitter, linkedin, facebook */ },
  registration: { number: "12345678", registeredOffice: "..." },
  defaultOgImage: "/acme-og.jpg",
  adminEmail: "you@example.com",                  // your admin email
};
```

### `config/services.ts`

Replace the 14 service entries with the new client's services. Keep
the shape (`{ slug, name, order }`). Add/remove entries to match the
new client's offering.

### `config/pages.ts`

The SEO titles and descriptions are hand-crafted per service. Edit
the `getServiceSeo()` function to match the new client's services.
The `/{root, contact, our-services, privacy-cookie-policy}` entries
are at the top of `PAGE_SEO` and just reference `SITE.companyName` —
they update automatically when you change `config/site.ts`.

## 4. Provision infrastructure (10 min)

```bash
# Neon — create a new project
# Vercel Blob — create a new store (only needed for the admin dashboard)
# Resend — same API key works, or generate a new one
```

## 5. Set env vars on Vercel (5 min)

Required env vars (set in the Vercel project settings):

| Var | Description |
|---|---|
| `DATABASE_URL` | Neon pooler URL (postgresql://...neon.tech/neondb?sslmode=require) |
| `DIRECT_URL` | Neon direct URL (used for migrations) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (only when admin is built) |
| `AUTH_SECRET` | Random 32+ char string. Generate with `openssl rand -base64 32` |
| `AUTH_RESEND_KEY` | Resend API key (for magic-link emails) |
| `ADMIN_EMAIL` | The single admin's email (matches `SITE.adminEmail`) |
| `RESEND_API_KEY` | Resend API key for the contact form |
| `CONTACT_TO_EMAIL` | Comma-separated. Default: `SITE.contactEmail` |
| `CONTACT_FROM_EMAIL` | `Acme Planning <noreply@acmeplanning.co.uk>` once the domain is verified |

**CRITICAL**: Vercel env vars don't take effect on the currently-deployed
function. After PATCHing any env var, push a commit (even a no-op) to
trigger a redeploy.

## 6. Database setup (5 min)

```bash
# Apply the Drizzle schema to the new Neon DB
npm run db:push

# Seed the initial data (18 pages, 14 services, site_settings)
npm run db:seed
```

## 7. Deploy (2 min)

```bash
git add -A
git commit -m "chore: initialise for Acme Planning"
git push origin main
# Vercel auto-deploys on push to main
```

## 8. Custom domain (10 min)

In Vercel project settings → Domains → add the new client's domain.
Vercel gives you the DNS records to add at the registrar. Wait for
DNS to propagate (usually <30 min). SSL is auto-provisioned.

## 9. Verify (10 min)

```bash
node scripts/verify.mjs https://www.acmeplanning.co.uk
# Expect: 161/161 checks pass (the count may differ if you've added/removed
# services, but every check should pass)

# Update scripts/verify.mjs line 73 and scripts/visual-diff.mjs line 19
# to point at the new production URL (these are still hardcoded)
```

## 10. Smoke-test the admin (5 min, after backend is built)

Visit `https://www.acmeplanning.co.uk/admin/login`, enter the admin
email, click the magic link in the inbox. Confirm you can:

- Edit the home hero heading
- Add a new service
- Edit the contact info
- See a contact form submission appear

## Time estimate

| Step | Time |
|---|---|
| 1. Clone repo | 5 min |
| 2. Replace assets | 30-60 min |
| 3. Edit config | 15 min |
| 4. Provision infrastructure | 10 min |
| 5. Set env vars | 5 min |
| 6. Database setup | 5 min |
| 7. Deploy | 2 min |
| 8. Custom domain | 10 min |
| 9. Verify | 10 min |
| 10. Smoke-test admin | 5 min |
| **Total** | **~2 hours** (or ~3 hours with manual asset swap) |

Compare to **5-6 days** to build from scratch.

## What is NOT duplicated

- The git history (the new repo starts fresh)
- Vercel project (create a new one)
- Neon project (create a new one)
- Vercel Blob store (create a new one)
- Resend API key (can reuse, or generate a new one)

## What IS duplicated

- All the code
- All the config (you edit it during the duplication)
- The Drizzle schema
- The admin dashboard UI
- The verify.mjs test suite
- The duplication playbook (this document!)

## Backend sync between sites

If you fix a bug in the backend on site-1, you need to port it to
site-2. Use `execution-plan/backend-changelog.md` as the source of
truth — every backend commit gets an entry with a commit hash, and
you can `git cherry-pick` or `git format-patch` it to the other repo.

If you find yourself doing this often, that's the signal to migrate
to a monorepo. For 2 sites, cherry-picking is fine.
