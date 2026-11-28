# Implementation Plan: Author details and first-published years

**Branch**: `006-open-library` | **Date**: 2026-11-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-open-library/spec.md`

## Summary

Fill the real library's author pages, and show first-published years, from public sources,
with the work done in the cloud:

- **Lookups:** a second, small Worker (`longshelf-lookups`) runs every 10 minutes on the Free plan.
  It matches each book's ISBN to an Open Library work, pairs the Calibre author with the work's author by name,
  follows that Open Library ID to Wikidata, then reads Wikipedia and Commons, as DR-0005 sets out.
  Its state lives in D1, so every run picks up where the last stopped.
- **Delivery:** it publishes one details document to R2. The app serves it at `/api/details`,
  and the browser merges it into the pages, offline as well. Photos are copied into R2.
- **Upload:** the CLI adds each book's ISBN to the metadata it already sends. Calibre stays read-only.
- **Settings:** a status block and an off switch that removes what was fetched.
- **Cost:** $0 a month expected; no new npm dependencies.

Decisions are in [research.md](research.md) R1 to R10.
[DR-0013](../../docs/decisions/DR-0013-author-lookups-in-the-mirror.md) (proposed)
records the runner and adds Open Library matching and first-published years to DR-0005.

## Technical Context

**Language/Version**: TypeScript 6, Svelte 5, Node 24 (CLI).

**Primary Dependencies**: the agreed stack only. Zod for the new schemas; `fetch` and WebCrypto in the Worker.
No new npm dependencies.

**Storage**:
- D1: `work_detail`, `author_detail`, `lookup_queue`, `lookup_state` ([data-model.md](data-model.md)).
- R2: `portrait/<sha>` and `details/<sha>`.
- Service worker caches, as for the catalogue and covers.

**Testing**:
- Vitest, with saved source responses as fixtures (public-domain authors only):
  name pairing and conflicts, the date rule, licence filtering, queue and back-off, document building,
  and the snapshot merge.
- `@cloudflare/vitest-pool-workers` for one scheduled run against D1 and R2 in miniflare, with `fetch` mocked.
- Playwright + axe on a mirror build with a seeded details document: author page, book page, Settings.
- Quickstart step 6 on the owner's library for SC-001 to SC-004.

**Target Platform**: Cloudflare Workers (the app on `library.longshelf.app`, the lookups Worker with no routes).
Evergreen browsers. The CLI on Linux and macOS.

**Project Type**: web application plus CLI, in the pnpm workspace.

**Performance Goals**:
- SC-003: first fill within a day (estimate under 6 hours, research R7).
- SC-004: a new book's details within an hour (runs every 10 minutes).
- SC-005: author and book pages make no request outside the app.

**Constraints**:
- Free plan per scheduled run: 10 ms CPU, 50 outside subrequests, 15 minutes wall time (research R1, R2).
- Source rate limits: Open Library 1 a second as paced; Wikimedia one at a time with 429 honoured.
- Requests carry only ISBNs, IDs and titles (FR-002).
- Calibre is never written (FR-012). Nothing reaches the showcase (FR-013).

**Scale/Scope**:
- 631 books, 542 with an ISBN, 367 authors (counted 2026-11-26).
- About 1,300 outside requests for the first fill (ASSUMPTION, research R7).
- 4 tables, 4 routes, 1 new Worker, 3 UI changes (author page wired, book page year, Settings block).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | How |
|---|---|---|
| I. Calm & low-load | Pass | Missing details leave no empty boxes. Settings shows plain counts, no progress bar or pressure, and a source that's down reads as "it'll try again later". The off switch is confirmed and reversible by turning it on again. |
| II. Outcomes over ceremony | Pass | The gates are quickstart's live checks and the 30-author hand review (SC-002). |
| III. Dual interface | Pass | Operator view: the Settings status, `wrangler tail` on the lookups Worker, and DEPLOY.md's new section. The owner view is the author and book pages. |
| IV. What, not how | Pass | The spec names no tools. They're named here, in research.md and in DR-0013. |
| V. Adopt before building | Pass | Cron Triggers and D1 rather than our own scheduler. Queues, Workflows and an adapter fork were assessed (R1). The DR-0005 source route is reused. |
| VI. Decisions recorded | Pass | DR-0013 (proposed) for the runner and the change to DR-0005. The owner locks it. |
| VII. Challenger before locking | Pass | DR-0013's challenger argued for first-published years only; the owner rejected that case on 2026-11-28. |
| VIII. Cite or mark assumption | Pass | Limits are cited with the read date; four ASSUMPTIONs are named (document size, request count, refresh periods, living-author coverage), each with a check. |
| IX. Economy | Pass | $0 a month expected. A second Worker is free on the Free plan. No new dependencies. |
| X. Solo-operable | Pass | `pnpm run deploy` deploys both Workers. No manual step beyond today's. |
| XI. Honest by construction | Pass | Settings says what's sent to whom (ISBNs, IDs and titles to Open Library, Wikidata and Wikipedia), as the AI section does. |

Re-check after Phase 1: no violations. The risk to watch is CPU per scheduled run (research R2),
measured in the spike, with a smaller batch as the fallback.

Longshelf principles: one more Worker is a moving part, accepted because the adapter won't take a
scheduled handler (R1). Calibre is read-only. No device specifics. No new dependency. Plain SQL.

## Project Structure

### Documentation (this feature)

```text
specs/006-open-library/
├── spec.md
├── plan.md               # this file
├── research.md           # R1–R10
├── data-model.md         # D1 tables, R2 keys, the details document
├── quickstart.md         # local and live checks
├── contracts/
│   └── details-api.md    # /api/details, portraits, status, the switch; outbound rules
├── checklists/requirements.md
└── tasks.md              # /speckit-tasks
```

### Source Code (repository root)

```text
packages/shared/src/
├── library/types.ts          # Book gains isbn
├── library/snapshot.ts       # merges details into author and book pages
└── details.ts                # NEW: Zod schemas for the document and status

packages/sync-cli/src/
└── calibre.ts                # reads identifiers (isbn), read-only

apps/web/
├── wrangler.jsonc            # unchanged bindings
├── wrangler.lookups.jsonc    # NEW: longshelf-lookups, cron */10, same D1 and R2, no routes
├── lookups-worker.ts         # NEW: scheduled() entry, calls lib/server/lookups
├── migrations/0005_lookups.sql
└── src/
    ├── service-worker.ts     # /api/details network-first, portraits cache-first
    ├── lib/library/mirror.ts # fetches /api/details beside the catalogue
    ├── lib/server/lookups/   # NEW: run.ts, queue.ts, openlibrary.ts, wikidata.ts,
    │                         #      wikipedia.ts, match.ts, publish.ts
    └── routes/
        ├── api/details/+server.ts
        ├── api/details/status/+server.ts
        ├── api/details/enabled/+server.ts
        ├── api/portraits/[sha]/+server.ts
        ├── book/[id]/+page.svelte        # first-published year (after mock approval)
        └── settings/ai/+page.svelte      # author details block (after mock approval)

docs/
├── DEPLOY.md                 # the second Worker
└── decisions/DR-0013-author-lookups-in-the-mirror.md
```

**Structure Decision**: the existing workspace. The lookups code sits in `lib/server/lookups/`,
beside `ai/` and `mirror/`, so it shares the D1 helpers and migrations.
Only its entry file and wrangler config are separate.

## Delivery order

1. **Spike (first task):**
   - deploy the empty lookups Worker with its cron and bindings; read D1, write R2; measure CPU per run;
   - from a laptop script, run the owner's ISBNs through Open Library and the Wikidata query, read-only,
     and count coverage (SC-001's 60%, living authors included) and requests (R7).

   Record results in `docs/PLAN.md`'s spike log. A CPU overrun lowers the batch size;
   coverage well under 60% goes back to the owner before building.
2. Mocks of the book-page year and the Settings block, with public-domain data, for the owner's approval.
   Open question for the mock: Settings is one page titled "AI settings"; the block may need it retitled "Settings".
3. ISBN in the CLI and shared types; migration.
4. Lookups Worker: queue, sources, matching, publish (US1, US2 data).
5. `/api/details`, portraits, the browser merge and the service worker (US1, US2 in the app).
6. Settings status and switch (US3).
7. DEPLOY.md, deploy, the owner's first fill, the 30-author review and the SC timings (quickstart 6).

## Complexity Tracking

No constitution violations.
