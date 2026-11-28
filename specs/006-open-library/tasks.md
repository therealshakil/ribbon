---
description: "Tasks for spec 006, author details and first-published years"
---

# Tasks: Author details and first-published years

**Input**: `specs/006-open-library/` (plan.md, spec.md, research.md, data-model.md,
contracts/details-api.md, quickstart.md). Decisions: DR-0005, DR-0013.

**Tests**: included, because plan.md lists them (Vitest with saved fixtures, pool-workers, Playwright + axe).
Keep runs targeted: the tests for the files touched, not the full suite.

**Rules for every task**:

- Calibre is never written (FR-012).
- No new npm dependencies without asking the owner.
- Use `#lib/...` imports.
- Fixtures and mocks use public-domain authors and Standard Ebooks titles only, never the owner's Calibre data.
- Nothing calls an outside source from the app Worker, the browser, sample mode or `pnpm dev:calibre` (FR-001).
- Outbound requests carry only ISBNs, Open Library and Wikidata IDs, and Wikipedia and Commons titles (FR-002).
- A task is done when its code, any doc it changes, and its `docs/JOURNAL.md` line land together.
- Commit after each task or logical group, and push the branch after each commit.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: US1 to US3 from spec.md

---

## Phase 1: Setup and spike

**Purpose**: check the three assumptions the plan rests on, before building (plan "Delivery order" step 1).

- [ ] T001 **Spike, with the owner.** Before anything is created on the owner's Cloudflare account, show the exact commands and the expected $0 cost, and get a yes. Then create `apps/web/wrangler.lookups.jsonc` (`name: longshelf-lookups`, `main: lookups-worker.ts`, `workers_dev: false`, no routes, `triggers.crons: ["*/10 * * * *"]`, the same `DB` D1 and `BUCKET` R2 bindings as `apps/web/wrangler.jsonc`, `compatibility_date` matching it) and a throwaway `apps/web/lookups-worker.ts` whose `scheduled()` reads `SELECT COUNT(*) FROM book`, writes `spike/ping` to R2, deletes it, and makes 40 `fetch` calls to `https://openlibrary.org/search.json?isbn=<a Standard Ebooks ISBN>&fields=key,first_publish_year,author_key,author_name&limit=1`, one a second, parsing each. Deploy it with `wrangler deploy -c wrangler.lookups.jsonc`. Record in the spike log in `docs/PLAN.md`: whether D1 and R2 work from it, and the CPU time per run from `wrangler tail`. If CPU is over 10 ms, record the batch size that fits.
- [ ] T002 **Spike, read-only on the owner's laptop.** Write a throwaway script `packages/sync-cli/scripts/spike-coverage.ts` (not committed with any results that name the owner's books) that reads the owner's library read-only with `readCalibreSnapshot` plus `SELECT book, val FROM identifiers WHERE type = 'isbn'`, then runs research R3 (Open Library search, 1 a second, User-Agent `Longshelf/spike (+https://github.com/therealshakil/longshelf)`) and research R4 (the batched P648 SPARQL query, 25 IDs a query). Print counts only: ISBNs, Open Library hits, hits with `first_publish_year`, Calibre authors paired by name (research R9), authors with a Wikidata item, authors with an English Wikipedia article, and total requests made. Record the counts in the spike log in `docs/PLAN.md`. If authors with details are well under 60% (SC-001), stop and take it to the owner before Phase 2. Delete the script after.

**Checkpoint**: the spike log answers CPU per run, D1/R2 access from the second Worker, coverage and request count.

---

## Phase 2: Foundational (blocks every story)

- [ ] T003 [P] Add `isbn: z.string().regex(/^\d{13}$/).optional()` to `BookSchema` in `packages/shared/src/library/types.ts`, documented as "ISBN-13 digits only, from Calibre's identifiers (spec 006)".
- [ ] T004 Read ISBNs in `packages/sync-cli/src/calibre.ts`: `SELECT book, val FROM identifiers WHERE type = 'isbn'`, normalised by a new `isbn13(raw)` in the same file (strip hyphens and spaces; convert a valid ISBN-10 to ISBN-13; drop anything that fails its check digit). Set `book.isbn`. Unit tests for `isbn13` in `packages/sync-cli/src/calibre.test.ts` (valid 10, valid 13, hyphens, bad check digit, `X` check digit). Add an ISBN to one or two books in `packages/sync-cli/test/fixtures/library/` with `calibredb set_metadata --field identifiers:isbn:<isbn>` on the fixture copy only, using the real ISBNs of public-domain editions.
- [ ] T005 [P] Create `packages/shared/src/details.ts` with Zod schemas from `contracts/details-api.md` and `data-model.md`: `DetailsDocumentSchema` (`version: z.literal(1)`, `builtAt`, `authors: z.record(z.string(), AuthorDetailsSchema)`, `works: z.record(z.string(), z.object({ firstYear: z.string() }))`), where `AuthorDetailsSchema` is `AuthorSchema.pick({ lifeDates, bio, portrait, bibliography })`; `DetailsStatusSchema` (`enabled`, `authorsWithDetails`, `authorsTotal`, `booksWaiting`, `lastRunAt` optional, `resting: z.array(z.string())`); `EnabledRequestSchema` (`{ enabled: boolean }`). Add the `./details` export to `packages/shared/package.json`.
- [ ] T006 [P] Create `apps/web/migrations/0005_lookups.sql` exactly as in `data-model.md`: `work_detail` (`book_id` TEXT PK, `isbn` TEXT NOT NULL, `ol_work`, `first_year` INTEGER, `ol_authors` TEXT JSON, `fetched_at` TEXT NOT NULL); `author_detail` (`author_id` TEXT PK, `state` TEXT NOT NULL CHECK in `('matched','unmatched','conflict')`, `via_book_id`, `ol_author`, `wikidata`, `details` TEXT JSON, `photo_sha256`, `fetched_at` TEXT NOT NULL); `lookup_queue` (`book_id` TEXT PK, `step` TEXT NOT NULL CHECK in `('work','author')`, `tries` INTEGER NOT NULL DEFAULT 0, `next_at` TEXT NOT NULL); `lookup_state` (`id` INTEGER PK CHECK `= 1`, `enabled` INTEGER NOT NULL DEFAULT 1, `last_run_at`, `paused` TEXT JSON, `details_sha256`, `previous_sha256`) with its one row inserted. Additive only. Apply it to `wrangler.preview-migrations.jsonc`'s database as well, following DR-0012.
- [ ] T007 Replace the spike entry with the real `apps/web/lookups-worker.ts`: `export default { async scheduled(_c, env, ctx) { ctx.waitUntil(runLookups({ db: env.DB, bucket: env.BUCKET, contact: env.LOOKUPS_CONTACT })) } }`. Add `LOOKUPS_CONTACT` as a plain var in `wrangler.lookups.jsonc`, defaulting to `https://github.com/therealshakil/longshelf`. Generate its types with `wrangler types -c wrangler.lookups.jsonc`.
- [ ] T008 Create `apps/web/src/lib/server/lookups/http.ts`: `sourceFetch(source, url, ctx)` that sets `User-Agent: Longshelf/<version> (+<contact>)` and `Accept-Encoding: gzip`, keeps one request at a time per source with a minimum gap (`openlibrary` 1000 ms, `wikidata` 1000 ms, `wikipedia` and `commons` 200 ms), counts requests against a per-run budget (default 40, from T001's result), and on 429 or 5xx records a pause in `lookup_state.paused` until `Retry-After` or the next run, then throws a `SourceResting` error. Unit tests in `http.test.ts` with a mocked `fetch`: header present, budget stops at the limit, 429 records the pause.
- [ ] T009 Create `apps/web/src/lib/server/lookups/queue.ts`: `reconcile(db, now)` per data-model.md "Life of a lookup" step 1. It queues books whose `json_extract(metadata, '$.isbn')` is set and that have no `work_detail`, or whose `work_detail.isbn` differs, or whose `fetched_at` is older than 180 days (hit) or 30 days (miss, `ol_work IS NULL`). It deletes `work_detail` and `lookup_queue` rows for books no longer in `book`, and `author_detail` rows for author ids no longer in any book's metadata. Also `nextBatch(db, now, limit)`, `markDone`, and `markFailed(db, bookId, now)` (tries + 1, `next_at` +1 hour, then +1 day, then +1 week). Tests in `queue.test.ts` with `@cloudflare/vitest-pool-workers` and the real migrations.

**Checkpoint**: ISBNs upload; the second Worker runs an empty loop against D1 and R2.

---

## Phase 3: User Story 1 - Learn about an author (Priority: P1) 🎯 MVP

**Goal**: real authors' pages show dates, bio, photo and notable works, each with its source, offline too.

**Independent Test**: upload a library with one well-known author, let a run finish, open the author: details show with their sources. Go offline and open them again: still there.

### Tests for User Story 1

- [ ] T010 [P] [US1] Save source fixtures in `apps/web/src/lib/server/lookups/fixtures/` for three public-domain authors (Jane Austen, Mary Shelley, Herman Melville): an Open Library search response per ISBN, one SPARQL response covering all three, a Wikipedia summary and a Commons `imageinfo` response each, and one small test image. Add a fourth case of a shared name (two Open Library authors called "John Smith" leading to different Wikidata items) and a fifth with a photo whose licence is `All rights reserved`.
- [ ] T011 [P] [US1] Unit tests in `apps/web/src/lib/server/lookups/match.test.ts` for research R9: "Austen, Jane" pairs with "Jane Austen"; "H. G. Wells" pairs with "Herbert George Wells"; accents ignored; "John Smith" with books leading to two Wikidata items is `conflict`; no pairing without a shared book.
- [ ] T012 [P] [US1] Unit tests in `apps/web/src/lib/server/lookups/wikidata.test.ts`: life dates formatted as the sample authors' are (`1775–1817 · English novelist`); DR-0005's date rule hides a notable work's year under 12 years after birth or over 100 years after death; notable works keep the earliest P577 date.

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create `apps/web/src/lib/server/lookups/openlibrary.ts`: `searchByIsbn(isbn)` per research R3, returning `{ work, firstYear, authors: { key, name }[] } | null`.
- [ ] T014 [P] [US1] Create `apps/web/src/lib/server/lookups/match.ts`: `nameKey(name)` and `pairAuthor(calibreAuthor, olAuthors)` per research R9, and `resolve(candidates)` that returns `matched`, `unmatched` or `conflict` from the Wikidata items a Calibre author's books lead to.
- [ ] T015 [P] [US1] Create `apps/web/src/lib/server/lookups/wikidata.ts`: `byOpenLibraryIds(ids)` running the research R4 SPARQL query against `https://query.wikidata.org/sparql` for up to 25 ids, returning per id the item, birth, death, English description, English Wikipedia title and notable works with earliest P577 year, with DR-0005's date rule applied. Reuse `linkOwnedWorks` from `packages/shared/src/library/bibliography.ts` later, in the browser, not here.
- [ ] T016 [P] [US1] Create `apps/web/src/lib/server/lookups/wikipedia.ts`: `summary(title)` (REST `page/summary`, returning the extract and the lead image's file name), `licence(file)` (Commons `imageinfo` with `extmetadata`: `LicenseShortName`, `Artist` stripped of HTML, `DescriptionUrl`), `isFreeLicence(name)` accepting only public domain, CC0, CC BY and CC BY-SA, and `fetchPhoto(file)` fetching the 400 px thumbnail. Photo `alt` is `Portrait of <name>`, as in the sample data.
- [ ] T017 [US1] Create `apps/web/src/lib/server/lookups/run.ts`: `runLookups(env)`. Return at once when `lookup_state.enabled = 0`. Then `reconcile`, then take a batch with `nextBatch`. For each book at step `work`, call `searchByIsbn` and write `work_detail`. For each book at step `author`, gather its Calibre authors that need details, pair them (T014), batch their Open Library ids into one `byOpenLibraryIds` call, then fetch the summary, licence and photo for each matched author. Store the photo in R2 at `portrait/<sha256>` (SHA-256 by WebCrypto), and write `author_detail` with `state`, `via_book_id`, `ol_author`, `wikidata`, `details` and `photo_sha256`. Stop when the request budget is spent or 10 minutes have passed. A `SourceResting` error leaves the book queued without counting a try. Any other error calls `markFailed`. Set `last_run_at`. Depends on T008, T009, T013 to T016.
- [ ] T018 [US1] Create `apps/web/src/lib/server/lookups/publish.ts`: `publish(env)`, called at the end of `runLookups` when a row changed. Build the details document from `author_detail` rows in state `matched` (setting `portrait.url` to `/api/portraits/<photo_sha256>`) and `work_detail` rows whose `first_year` differs from the book's `pubYear`. Validate it with `DetailsDocumentSchema`, serialise with `canonicalJson`, store at `details/<sha256>`, and move the current sha to `previous_sha256` in `lookup_state`. Delete `details/*` objects that are neither current nor previous, and `portrait/*` objects no `author_detail` row names. Tests in `publish.test.ts` (pool-workers).
- [ ] T019 [US1] Integration test `apps/web/src/lib/server/lookups/run.test.ts` (pool-workers, fixtures from T010, `fetch` mocked): seed `book` with the five fixture cases, run `runLookups` until the queue is empty, and check: Austen, Shelley and Melville `matched` with details and photos in R2; "John Smith" `conflict` with no details; the unlicensed photo not stored; one details document published; no request URL contains anything but ISBNs, ids or titles (FR-002); and that a second run with nothing due makes no outside request.
- [ ] T020 [P] [US1] Create `apps/web/src/routes/api/details/+server.ts` per `contracts/details-api.md`: stream `details/<lookup_state.details_sha256>` from R2 with `ETag`, `Cache-Control: no-cache`, `304` on `If-None-Match`, `404` when there is no document. Reuse the catalogue's streaming helper in `apps/web/src/lib/server/mirror/serve.ts`.
- [ ] T021 [P] [US1] Create `apps/web/src/routes/api/portraits/[sha]/+server.ts`: serve `portrait/<sha>` from R2 with `Cache-Control: public, max-age=31536000, immutable`, `404` if missing, the sha checked against `Sha256Schema`. Reuse the cover route's helper.
- [ ] T022 [US1] Tests for T020 and T021 in `apps/web/src/routes/api/details/details.test.ts` (pool-workers): ETag and 304, 404 with no document, 403 without an Access identity, immutable caching on portraits.
- [ ] T023 [US1] Merge details in the browser. In `packages/shared/src/library/snapshot.ts`, `createSnapshotLibrary` takes an optional `details?: DetailsDocument`. `toAuthor(a)` fills `lifeDates`, `bio`, `portrait` and `bibliography` from `details.authors[a.id]` when present, with `bibliography` run through `linkOwnedWorks` against that author's books. Unit tests in `packages/shared/src/library/snapshot.test.ts`: with details, an author page has them and owned works are linked; without, the page is as today.
- [ ] T024 [US1] In `apps/web/src/lib/library/mirror.ts`, `fetchMirror` fetches `/api/details` beside `/api/catalog` (in parallel). A `404`, a network failure or a schema failure means no details and no message. Pass the document to `mirrorLibrary` and on to `createSnapshotLibrary`. Sample mode and `pnpm dev:calibre` never call it.
- [ ] T025 [US1] In `apps/web/src/service-worker.ts`, cache `/api/details` network-first with the cached copy as fallback (as the catalogue, its own cache `details-v1`), and `/api/portraits/*` cache-first (as covers, its own cache `portraits-v1`). Update the header comment.
- [ ] T026 [US1] e2e in `apps/web/tests/e2e/author-details.spec.ts` on a mirror build with a seeded details document for a Standard Ebooks author: details and each source line show; an author without details looks as today, with no empty boxes; offline reload keeps the details; no request leaves the app's origin (SC-005); axe passes.

**Checkpoint**: US1 works on its own: real authors have full pages, offline.

---

## Phase 4: User Story 2 - See when a book was first published (Priority: P2)

**Goal**: the book page shows the work's first year beside the edition's year, when they differ.

**Independent Test**: upload a reprint with an ISBN, let a run finish, and see both years on its page.

- [ ] T027 [US2] **Design, with the owner.** Using the impeccable skill, mock the book header with both years in `design-mocks/book.html`, with a Standard Ebooks title. Today `apps/web/src/lib/components/BookHeader.svelte:47` labels Calibre's edition year "First published", which is wrong for reprints; the mock shows the edition year and the first year, each labelled, and the single-year case. Show the owner a screenshot and wait for approval before T028.
- [ ] T028 [US2] Add `firstYear?: string` to `Book` in `packages/shared/src/library/types.ts` as a browser-only field (not uploaded). In `packages/shared/src/library/snapshot.ts`, set it on each book from `details.works[book.id]`. Unit test in `snapshot.test.ts`.
- [ ] T029 [US2] Update `apps/web/src/lib/components/BookHeader.svelte` to the approved mock: both years when `firstYear` is set, one year otherwise. Fix the "First published" label on the edition year. e2e case in `apps/web/tests/e2e/author-details.spec.ts` for a seeded reprint and a book with one year; axe passes.

**Checkpoint**: US1 and US2 both work on their own.

---

## Phase 5: User Story 3 - Glance at the author service (Priority: P3)

**Goal**: Settings shows the service's state and offers an off switch that removes what it fetched.

**Independent Test**: after an upload, Settings shows books waiting, later done. Turn it off: details leave the app. Turn it on: they return.

- [ ] T030 [US3] **Design, with the owner.** Using the impeccable skill, mock the Settings block in `design-mocks/` with public-domain numbers: plain counts, last run, the "resting" note (US3 scenario 2), the switch with its confirmation, and a line on what is sent to whom (constitution XI). Settings is one page titled "AI settings" (`apps/web/src/routes/settings/ai/+page.svelte`); include whether the title becomes "Settings". Show the owner a screenshot and wait for approval before T033.
- [ ] T031 [P] [US3] Create `apps/web/src/routes/api/details/status/+server.ts`: `GET` returns `DetailsStatusSchema` from D1 (`authorsWithDetails` = `author_detail` rows `matched`; `authorsTotal` = distinct author ids in `book` metadata; `booksWaiting` = `lookup_queue` rows; `resting` = sources in `lookup_state.paused` whose time hasn't passed).
- [ ] T032 [P] [US3] Create `apps/web/src/routes/api/details/enabled/+server.ts`: `PUT` with `EnabledRequestSchema`. Off sets `enabled = 0`, deletes all rows in `work_detail`, `author_detail` and `lookup_queue`, lists and deletes `portrait/` and `details/` in R2, clears `details_sha256` and `previous_sha256`, and returns the removed counts. On sets `enabled = 1`. Tests in `apps/web/src/routes/api/details/enabled.test.ts` (pool-workers): off removes everything and `/api/details` answers 404; on, then one `runLookups` with fixtures, refills.
- [ ] T033 [US3] Build the approved Settings block in `apps/web/src/routes/settings/ai/+page.svelte`, reading the status endpoint and calling the switch after the confirmation. After turning it off, the app drops its cached details (delete the `details-v1` cache, reload the library). e2e in a new `apps/web/tests/e2e/details-settings.spec.ts`: counts show, off with confirmation, details gone from an author page; axe passes.

**Checkpoint**: all three stories work on their own.

---

## Phase 6: Polish and cross-cutting

- [ ] T034 [P] Update `apps/web/package.json` `deploy` to also run `wrangler deploy -c wrangler.lookups.jsonc` after the app deploy. Add a "Lookups Worker" section to `docs/DEPLOY.md` (what it is, its cron, `wrangler tail -c wrangler.lookups.jsonc`, and that the showcase gets none, FR-013). Note in `docs/DESIGN.md` under "Cloud" that a second Worker runs lookups (DR-0013).
- [ ] T035 [P] Check dev mode stays offline (quickstart step 5): `pnpm dev:calibre` shows today's author pages and makes no request to `/api/details` or any outside host. Add a unit test in `apps/web/src/lib/library/` that the local and sample sources never fetch details.
- [ ] T036 Run quickstart steps 1 to 5. Then, with the owner: deploy (quickstart step 6), upload once to add ISBNs, and record in `docs/JOURNAL.md` the first-fill time (SC-003), the share of authors with details (SC-001), a hand check of 30 matched authors (SC-002), and a new book's time to details (SC-004). Update the spec 006 row in `docs/PLAN.md`.

---

## Dependencies and execution order

- **Phase 1** (T001, T002) comes first and needs the owner. Low coverage in T002 stops the work for a ruling.
- **Phase 2**: T003, T005 and T006 in parallel. T004 after T003. T007 after T001. T008 and T009 after T006 and T007.
- **US1** needs Phase 2. Fixtures and tests (T010 to T012) first; T013 to T016 in parallel; then T017, T018, T019. T020 and T021 in parallel with the Worker work; T022 after them. T023, then T024 and T025, then T026.
- **US2** needs US1's details document (T018) and merge (T023). T027 can start any time; T029 waits on its approval.
- **US3** needs Phase 2 and T018. T030 can start any time; T033 waits on its approval.
- **Polish** after the stories. T036 needs the owner.

```
T001 ─┬─ T007 ─┐
T002  │  T003─T004
      │  T005, T006 ─► T008, T009 ─► US1 (T010…T026) ─► US2 (T028, T029) ─► Polish
      │                                     └────────► US3 (T031…T033) ─┘
      └ T027 and T030 (mocks) any time after T001
```

## Parallel examples

- **Phase 2:** T003, T005 and T006 together (three different packages).
- **US1:** T010, T011 and T012 together; then T013, T014, T015 and T016 together; T020 and T021 alongside T017.
- **US3:** T031 and T032 together.

## Implementation strategy

1. **MVP = Phase 1, Phase 2 and US1.** Real authors get full pages. Deploy only after T019 and T026 pass.
2. Then US2 (first-published years), then US3 (Settings).
3. Stop and ask the owner at T001 (account changes and cost), T002 (coverage under 60%), T027 and T030 (design), and T036 (live run).

## Notes

- Out of scope: the full bibliography (DR-0005), books without an ISBN, sorting by first year, new pages, the showcase.
- Totals: 36 tasks. US1 17, US2 3, US3 4; the rest are setup, foundation and polish.
