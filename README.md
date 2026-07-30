# শহীদের প্রাণ · Shohider Pran

Registry and support platform for the martyrs and injured of the July Mass
Uprising. Next.js App Router, Bangla (default) + English, Prisma + SQLite for
local dev, Gemini 2.5 Flash for the AI/agentic features.

This tool does not decide who is a legitimate martyr or injured person — it
reflects the official record, plus a clearly labelled pending-review queue
for people the list may have missed. No AI agent in this system ever sets
verification status.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # add GEMINI_API_KEY when you have one

npx prisma migrate dev   # creates dev.db and applies the schema
npx prisma db seed       # loads placeholder gazette records for local testing

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/bn`
by default (`/en` for English).

## Notes for this codebase

- **This is not the Next.js you know.** This project runs Next.js 16, which
  renamed `middleware.ts` to `proxy.ts` (`export function proxy` instead of
  `middleware`) among other breaking changes. Check
  `node_modules/next/dist/docs/` before assuming an API works the way it used
  to.
- **This is Prisma 7, not 5/6.** Driver adapters are mandatory
  (`@prisma/adapter-better-sqlite3` here), the generator is `prisma-client`
  (not `prisma-client-js`) with a required `output` path, and
  `prisma.config.ts` — not the schema's `datasource` block — holds the
  connection URL. See `.agents/skills/prisma-upgrade-v7/` (installed
  automatically by `prisma init`) if something doesn't match v6 expectations.
- Real gazette data must come from the scraper module (Section 5 of the build
  plan), never be hand-authored. `prisma/seed.ts` only ever inserts data
  clearly marked `seed_dev_placeholder`.

## Scraper (Section 5)

```bash
npx playwright install chromium   # one-time, for the jssfbd.com scraper
npm run scrape
```

This runs both source scrapers, then Section 2's auto-re-verification pass
over every pending registration. Same effect via API: `POST /api/scrape/dghs`
and `POST /api/scrape/jssfbd` (admin actions, no auth gate yet).

- **medical-info.dghs.gov.bd** — real and verified during development: it's
  the official DGHS public medical-case registry (the source jssfbd.com
  itself cites), robots.txt allows it, and it exposes a plain JSON API (no
  headless browser needed) behind its নিহত/আহত (deceased/injured) tabs.
  Clean structured data, so `needsReview: false`.
- **jssfbd.com/36july-martyrs/** — confirmed JS-rendered (no static table),
  so this uses Playwright + a Gemini narrative-extraction fallback per
  Section 5 point 3, and every row is `needsReview: true`. This module's
  architecture is correct but **not verified against the live site** — this
  sandbox's outbound proxy doesn't carry headless-Chromium traffic at all
  (confirmed against example.com and google.com too, not specific to this
  site), so it needs a real deployment environment to validate.
- **djmu.portal.gov.bd** — has a broken TLS certificate; skipped rather than
  bypassing certificate verification.
- **july36.gov.bd** — currently just a splash/coming-soon page, no list
  content to scrape yet.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
