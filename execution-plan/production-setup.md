# Production Setup — Southwest Planning Custom Dashboard

This doc covers everything you need to deploy the custom dashboard
to Vercel with Neon Postgres and Vercel Blob. The code is already
production-ready; this is the **infrastructure + env var** checklist.

Estimated time: **30-45 minutes** if you have all the accounts.

## Prerequisites

- Vercel account (free tier is fine) with the
  `iraselrony/southwest-planning-clone` repo connected
- Neon account (free tier is fine) — <https://neon.tech>
- Resend account (already configured) — <https://resend.com>
- A verified sending domain on Resend (or accept the
  `onboarding@resend.dev` limitation on the free tier)

## 1. Provision Neon Postgres

1. Go to <https://console.neon.tech> → "New Project"
2. Name: `southwest-planning` (or anything)
3. Region: pick the closest to your Vercel deployment (e.g.
   `aws-eu-west-2` for London)
4. Postgres version: 16 (matches dev)
5. Click "Create Project"
6. Copy **both** connection strings from the dashboard:
   - **Pooled connection** (used by the app at runtime) →
     `DATABASE_URL`
   - **Direct connection** (used by migrations) → `DIRECT_URL`
7. Both look like:

   ```
   postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

## 2. Apply the schema + seed data to Neon

From your local machine, with the Neon `DATABASE_URL` in
`.env.local` (temporarily):

```bash
cd /home/hermes/pi/projects/southwest-planning-clone
DATABASE_URL='postgresql://user:pass@ep-xxx-pooler.../neondb?sslmode=require' \
  npm run db:push
DATABASE_URL='postgresql://user:pass@ep-xxx-pooler.../neondb?sslmode=require' \
  npm run db:seed
DATABASE_URL='postgresql://user:pass@ep-xxx-pooler.../neondb?sslmode=require' \
  npm run db:seed-zones /
```

Or run them via the Neon SQL editor (paste the contents of
`db/migrations/0000_*.sql` then the seed).

## 3. Provision Vercel Blob

1. In the Vercel dashboard, go to the
   `southwest-planning-clone` project
2. Click the **Storage** tab → **Create Database** → **Blob**
3. Name: `southwest-planning-uploads` (or anything)
4. Region: same as the Vercel deployment (usually auto-selected)
5. Click "Create"
6. Copy the **`BLOB_READ_WRITE_TOKEN`** (the long `vercel_blob_rw_…` string)

## 4. Set environment variables on Vercel

In Vercel project settings → **Environment Variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | (Neon pooler URL from step 1) | Required for app + admin |
| `DIRECT_URL` | (Neon direct URL from step 1) | Required for `db:push` / migrations |
| `BLOB_READ_WRITE_TOKEN` | (from step 3) | Required for admin image uploads |
| `AUTH_SECRET` | `openssl rand -base64 32` | 32+ char random. **CRITICAL: must differ from dev.** |
| `AUTH_RESEND_KEY` | (same as `RESEND_API_KEY`) | For magic-link emails |
| `ADMIN_EMAIL` | `iraselrony@gmail.com` | The single admin's email |
| `RESEND_API_KEY` | (existing Resend key, or a new one) | For `/api/contact` |
| `CONTACT_TO_EMAIL` | `info@southwestplanningconsultancy.co.uk,iraselrony@gmail.com` | Comma-separated |
| `CONTACT_FROM_EMAIL` | `South West Planning <noreply@southwestplanningconsultancy.co.uk>` | Must be on a Resend-verified domain |
| `AUTH_EMAIL_FROM` | `South West Planning <noreply@southwestplanningconsultancy.co.uk>` | Same as above; for magic-link emails |

Set the environment for: **Production**, **Preview**, and
(optionally) **Development**. They can have different values per
environment, which is useful for testing in Preview without
touching prod data.

**CRITICAL Vercel gotcha**: env vars don't take effect on the
currently-deployed function. After PATCHing any env var, you must
push a commit (even a no-op like a whitespace change) to force a
redeploy that picks up the new value.

## 5. Resend domain verification (for production-grade email)

The free Resend tier only allows sending to the email address
associated with the Resend account. To send from your own domain
(recommended for production):

1. Resend dashboard → **Domains** → **Add Domain**
2. Add `southwestplanningconsultancy.co.uk`
3. Add the DNS records Resend gives you to the domain's DNS
   (DKIM, SPF, DMARC)
4. Wait for verification (usually minutes, sometimes hours)
5. Once verified, you can send from any `*@southwestplanningconsultancy.co.uk` address
6. Update `CONTACT_FROM_EMAIL` and `AUTH_EMAIL_FROM` to use the
   verified domain

For now, the free tier with `onboarding@resend.dev` works — emails
deliver, but the From address is `onboarding@resend.dev` instead of
your domain. You can upgrade this later.

## 6. Verify the admin allowlist

The `admin_users` table has one row: the email you set as
`ADMIN_EMAIL` (from the seed). After deploying:

1. Visit `https://southwest-planning-clone.vercel.app/admin/login`
2. Enter the `ADMIN_EMAIL`
3. Check the inbox for the magic-link email
4. Click the link → lands on `/admin`

If the link doesn't work, double-check:

- The email in `ADMIN_EMAIL` exactly matches the email you used in
  the seed (case-insensitive but the seed used lowercase)
- The Resend account is verified and can send to that address
  (free tier only allows the account-owner's email)

## 7. Production deployment (Vercel)

The repo is already connected to Vercel. To deploy:

```bash
cd /home/hermes/pi/projects/southwest-planning-clone
# Switch to main, merge the feature branch
git checkout main
git merge feat/custom-dashboard
git push origin main
```

Vercel auto-deploys on push to `main`. The first deploy will fail
with a clear "Environment validation failed" error if env vars
aren't set — check the Vercel function logs.

After the deploy succeeds, smoke-test:

- [ ] `https://southwest-planning-clone.vercel.app/` — public homepage renders
- [ ] All 18 page routes return 200
- [ ] Submit the contact form on `/contact` → check the email arrives + the row appears in `/admin/submissions`
- [ ] Visit `/admin/login` → sign in via magic link → land on `/admin`
- [ ] Edit the home hero heading in `/admin/pages/.../` → save → revisit `/` → see the new heading (within 60s due to ISR)
- [ ] Add a new service via `/admin/services/new` → see it in the admin list (note: the public site won't show the new service's page yet — that's a v2 body-block-injection feature)

## 8. Roll back if something goes wrong

The previous main (without the admin) is at commit `9ce9e03`. To
roll back:

```bash
git revert -m 1 <merge-commit>
git push origin main
```

Or in the Vercel dashboard: Deployments → click a previous
deployment → "Promote to Production".

## Production env var cheat sheet

For easy copy-paste into Vercel:

```
DATABASE_URL=postgresql://USER:PASS@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://USER:PASS@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_SECRET=<openssl rand -base64 32>
AUTH_RESEND_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=iraselrony@gmail.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=info@southwestplanningconsultancy.co.uk,iraselrony@gmail.com
CONTACT_FROM_EMAIL=South West Planning <noreply@southwestplanningconsultancy.co.uk>
AUTH_EMAIL_FROM=South West Planning <noreply@southwestplanningconsultancy.co.uk>
```

## What about Vercel Blob for the public site's static assets?

The Webflow static assets (CSS, JS, images) live in `public/cdn.prod.website-files.com/...`
and are served by Next.js as static files. They work fine in
production without Vercel Blob. You only need Vercel Blob for
**admin-uploaded content** (OG images, service card images). If
you want to move the Webflow assets to Vercel Blob for CDN
performance, that's a separate (optional) optimization — not part
of this build.

## What about adding more services or pages later?

For a new service: add a row in `services` via the admin. The
service will appear in the admin list immediately. The public site
won't have a static HTML page for it (since the route files are
pre-generated for the 14 seeded services), but the **homepage
service grid** will show it once Day 5's body block injection is
fully wired for the `service-cards` block (currently the grid is
still static HTML, scheduled for a future iteration).

For a new page: you'd need to add a route file in
`app/(routes)/<slug>/page.tsx` AND add a row in the `pages` table
AND add the new slug to the `site-map.md` AND the sitemap. (Or
wait for the v2 "dynamic routes" refactor that creates routes on
demand from the DB.)

## Cost summary

| Service | Free tier limit | This project uses |
|---|---|---|
| Vercel | 100 GB bandwidth/mo, 100 GB-hr serverless | ~1 GB bandwidth, ~10 GB-hr/mo |
| Neon | 0.5 GB storage, 190 compute-hr/mo | < 10 MB, < 1 hr/mo |
| Vercel Blob | 500 MB storage, 5 GB bandwidth/mo | < 100 MB (admin uploads) |
| Resend | 100 emails/day, 1 verified domain | < 50 emails/day |

All services fit comfortably in the free tier for a single small
business site.
