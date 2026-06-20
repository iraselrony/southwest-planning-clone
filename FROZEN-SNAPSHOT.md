# ⚠️ FROZEN SNAPSHOT — DO NOT ADD BACKEND COMMITS

This repository is a **frozen snapshot** of `southwest-planning-clone` taken at commit `6d693dd` (2026-06-20), **before any custom-dashboard backend work**.

## Why this repo exists

The current plan is to build a custom admin dashboard in `southwest-planning-clone` (shadcn/ui + Auth.js + Drizzle + Neon). If we decide the custom dashboard is not the right call, we can use this snapshot to try **Sanity** or **Payload CMS** instead — without having to revert the original repo.

## The rule

**Do not commit any backend code to this repo.** This snapshot must stay exactly as it was on 2026-06-20 — Webflow clone, no CMS, no DB, no auth, no admin UI.

If you need to add a Sanity/Payload backend:

1. Create a **new** branch from `main` (e.g. `feat/sanity-cms`)
2. Or create a new repo from this one

The tag `pre-backend-baseline` marks the exact frozen point.

## What's identical to `southwest-planning-clone` at 6d693dd

- 18 routes, all prerendered, 161/161 verify checks pass
- Per-page SEO from `app/_lib/seo.ts`
- Internal `.html` links rewritten at the body-extract layer
- Self-hosted Montserrat via `next/font/google`
- Contact forms → `/api/contact` → Resend
- Live at <https://southwest-planning-clone.vercel.app> (the original, not this snapshot)

## What will be different in the original (`southwest-planning-clone`)

The original will receive, in order:

1. A `config/` refactor (`config/site.ts`, `config/services.ts`, `config/pages.ts`)
2. The custom dashboard at `/admin` (5–6 day build, see `execution-plan/backend-plan.md`)
3. A duplication playbook at `execution-plan/duplicate-for-new-client.md`

None of that lands here. This is the safety net.
