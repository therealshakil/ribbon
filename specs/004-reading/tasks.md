---
description: "Tasks for spec 004, reading offline and across devices"
---

# Tasks: Reading offline and across devices

**Input**: `specs/004-reading/` (plan.md, spec.md, research.md, data-model.md, contracts/,
quickstart.md). Decision: DR-0013 (accepted 2026-11-25).

**Tests**: included, because plan.md lists them (Vitest, pool-workers, the FR-016 Playwright
smoke test).

**Rules for every task**:
- Calibre is never written.
- No new npm dependencies (plan: none needed). Ask the owner before adding one.
- Use `#lib/...` imports.
- Test fixtures are licence-free (sample books, or the spec 003 test library).
- No UI code before the owner approves its mock (T003). Mocks use licence-free data.
- Each change is tried on its PR preview (DR-0012) before production.
- A task is done when its code, any doc it changes, and its `docs/JOURNAL.md` line land together.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: US1 to US3 from spec.md

---

## Phase 1: Setup, spike and mocks

**Purpose**: check the one risky assumption (research R1), and get the new screens approved
before building them (plan "Delivery order" steps 1 and 2).

- [X] T001 **Spike** in a throwaway Playwright test `apps/web/tests/e2e/spike-cache.spec.ts`, run on the Chromium and WebKit projects (add a WebKit project temporarily if the config has none; the Playwright WebKit browser is part of the existing dependency). Record in the spike log in `docs/PLAN.md`:
  - (a) Serve a route whose body stream errors halfway (`page.route` with a `ReadableStream` that errors after 1 MB). Call `caches.open('t').then(c => c.put(url, res))`. Does `put` reject? Does `c.match(url)` return anything afterwards?
  - (b) Put a sample EPUB and a sample PDF in a cache. Register the app's service worker serving that cache (or a minimal one). Go offline with `context.setOffline(true)`. Does `/read/<id>` open both with foliate-js? Does foliate send `Range` requests?
  - (c) `navigator.storage.persist()` and `estimate()` results in each engine.

  Delete the spike test afterwards. If (a) shows a partial entry in either engine, stop and tell the owner: R1 switches to OPFS (DR-0013's fallback) before Phase 3.
- [X] T002 (Folded into T028, owner 2026-11-25: the storage page shows whether downloads are kept, so it is read there on both phones.) Ask the owner to run `navigator.storage.persist()` on their phone's installed app, using a temporary button on `/settings/ai`, or from the devtools console over USB. Record the result in the spike log. Remove the button.
- [X] T003 (Approved by the owner 2026-11-25: `design-mocks/offline-states.html` and `design-mocks/storage.html`. Build note: keep the chapter and percent in the device notice at phone width.) **Mocks for owner approval** (memory: preview design before building), in the existing static mock site `design-mocks/` (served on :8411, see `design-mocks/README.md`; Standard Ebooks data only):
  - `design-mocks/book.html`: add the Download states: not downloaded, downloading with progress, downloaded (menu with Remove), update available, and a no-space message;
  - `design-mocks/library.html`: a small "on this device" mark on downloaded covers, and the offline look;
  - `design-mocks/reader.html`: the offline "not downloaded" message, and the FR-009 notice naming a device ("Android phone: 45%… Jump there?");
  - `design-mocks/storage.html` (new): Settings → Storage, with books and sizes, total, "about N GB available", kept or not kept, Remove, Remove all, and this device's name with Rename.

  Show screenshots to the owner (light and dark, phone width). Record the approval and any changes in `docs/JOURNAL.md`. **Stop until approved.**

**Checkpoint**: the spike log answers (a)–(c). R1 is confirmed or switched. Mocks are approved.

---

## Phase 2: Foundational (blocks every story)

- [X] T004 [P] Create `packages/shared/src/progress.ts`, with Zod schemas per [contracts/progress-api.md](contracts/progress-api.md):
  - `PlaceSchema` (`bookId`, `deviceId`, `deviceName` non-empty strings; `percent` "0–100"; `fraction` "0–1"; `chapterLabel`, `href` strings; `cfi`, `fileSha256` optional; `furthestPercent` "≥ percent"; `furthestHref`; `readAt` ISO datetime);
  - `ProgressGetSchema` `{ places: Place[] }`;
  - `ProgressPutSchema` `{ places: Place[] }`, "1 to 100 places";
  - `ProgressPutResultSchema` `{ accepted, stale }`.

  Export it from the package. Add unit tests beside it for the range and refine rules.
- [X] T005 [P] Create `apps/web/src/lib/offline/device.ts`: `thisDevice()` returns `{ id, name }` from localStorage key `longshelf.device.v1`, creating it on first use: `crypto.randomUUID()` and a name from the user agent ("Android phone", "iPhone", "iPad", "Mac", "Windows PC", "Linux PC", else "This browser"); research R7. Also `renameDevice(name)`. Reads and writes never throw (private mode returns an in-memory device). Unit tests in `apps/web/tests/unit/device.test.ts` cover the UA mapping and persistence.
- [X] T006 Extend `SavedPlace` in `apps/web/src/lib/reader/settings.ts` per [data-model.md](data-model.md): add `href`, `percent`, `furthestPercent`, `furthestHref`, `fileSha256?`, `readAt` and `syncedAt: string | null`.
  - `loadPlace` upgrades old entries: `readAt = savedAt`, `syncedAt = null`, and `percent = fraction × 100` if missing.
  - `savePlace` ignores a write whose `readAt` is older than the stored one (the two-tab rule).

  Update `apps/web/src/routes/read/[id]/+page.svelte` to fill the new fields on relocate (`readAt = now`, furthest = max). Add tests to the existing reader settings test file, or a new `apps/web/tests/unit/place-storage.test.ts`. (Done in `src/lib/reader/place-storage.test.ts`. Opening a book doesn't count as a move: a relocate to the stored CFI is not saved.)

**Checkpoint**: `pnpm test`, `pnpm typecheck` and `pnpm lint` pass. Reading still saves and restores the place as before.

---

## Phase 3: User Story 1, read a downloaded book with no connection (P1) 🎯 MVP

**Goal**: Download on the book page keeps the file on the device. The installed app opens and
reads it with no network.

**Independent test**: quickstart step 2 on the PR preview: download, airplane mode, cold open,
read.

### Tests for US1

- [X] T007 [P] [US1] Unit tests `apps/web/tests/unit/downloads.test.ts` for `lib/offline/downloads.ts`, using a fake `caches` (in-memory Map) and a fake `fetch`:
  - the stored headers (`x-longshelf-book`, `-format`, `-size`, `-title` URI-encoded, `-saved-at`);
  - a size mismatch deletes the entry and rejects with `Failed`;
  - a stream error leaves nothing;
  - `QuotaExceededError` gives `NoSpace { needed }`;
  - `status()` returns `none`, `downloaded` or `update`;
  - `persist()` is called on the first download only.
- [X] T008 [P] [US1] The FR-016 smoke test, `apps/web/tests/e2e/offline-reading.spec.ts`, in the default `main` project (sample mode), per research R8:
  1. open a sample book's page and wait for the service worker to control the page (reload once);
  2. tap Download, then wait for "Downloaded";
  3. `context.setOffline(true)`;
  4. reload, go to the library (the book shows the device mark), and open the book;
  5. turn 3 pages and check the place label changes;
  6. open a not-downloaded book and check the calm offline message, not an error page.

### Implementation for US1

- [X] T009 [US1] Create `apps/web/src/lib/offline/downloads.ts` per [contracts/client-storage.md](contracts/client-storage.md):
  - `download`: fetch, pipe through a byte-counting `TransformStream` for `onProgress`, `cache.put` into `books-v1` with the headers, compare the stored size with the expected size, call `navigator.storage.persist()` on the first download and store the answer in localStorage `longshelf.storage.persisted`;
  - also `remove`, `removeAll`, `list`, `status` and `storageInfo` (used = sum of sizes; available = `quota − usage` from `estimate()`, "about");
  - before fetching, refuse with `NoSpace` if size > available;
  - the cache key is the file URL path without its query.
- [X] T010 [US1] Update `apps/web/src/service-worker.ts`:
  - for `GET` on `/api/files/*` and `/sample/books/*`, answer from `books-v1` if the path is there; with `?download=`, add `Content-Disposition` as the Worker does; a `Range` request gets the full 200 (or what T001 found foliate needs);
  - otherwise use the network and don't cache;
  - update the header comment (book files are now cached when downloaded).
- [X] T011 [US1] Replace the placeholder toggle in `apps/web/src/lib/components/BookHeader.svelte` with the approved states (T003): Download, downloading with progress, Downloaded with Remove in its menu, Update, and the no-space and offline messages. It uses `downloads.ts` with the book's current file URL and size (from the library's `files()` / `bookFileUrl()`). Keep the `downloaded` binding or remove it from `apps/web/src/routes/book/[id]/+page.svelte`.
- [X] T012 [US1] Mark downloaded books in the library grids, per the approved mock. Read `list()` once per page load and pass a `Set` of book ids to the cover tiles (`apps/web/src/lib/components/` cover/tile component used by `routes/library` and the home page).
- [X] T013 [US1] Offline reader state in `apps/web/src/routes/read/[id]/+page.svelte` and `+page.ts`: when `navigator.onLine` is false (or the file fetch fails) and `status()` is `none`, show the approved calm message with a link to the library instead of `ErrorState`. A book that has left the catalogue but is downloaded still opens: fall back to the cached entry's title and file URL from `list()`.
- [X] T014 [US1] Update the catalogue edge cases: if a downloaded book's catalogue file URL differs, the book page shows Update (FR-007). After updating, the old entry is removed only once the new one is stored.

**Checkpoint**: T007 and T008 pass. On the PR preview, quickstart step 2 works on the owner's phone. Journal line with SC-001 and SC-005 timings.

---

## Phase 4: User Story 2, pick up on another device (P2)

**Goal**: places reach the mirror (sent later if offline), come back to every device, and the
reader opens at the right place per FR-009.

**Independent test**: quickstart step 3 on the PR preview, with the phone and the laptop.

### Tests for US2

- [X] T015 [P] [US2] Pool-workers tests `apps/web/tests/unit/progress-api.test.ts` (D1 in miniflare, as `mirror-read.test.ts` does):
  - PUT then GET round-trips;
  - an older `readAt` lands in `stale` and doesn't overwrite;
  - a `readAt` more than 5 minutes in the future is clamped to server time;
  - 101 places or a bad field give 400 and write nothing;
  - no identity or the service token gives 403;
  - GET's `ETag` and `If-None-Match` give 304;
  - every response has `X-Robots-Tag: noindex, nofollow`.
- [X] T016 [P] [US2] Unit tests `apps/web/tests/unit/places.test.ts` for the FR-009 decision (research R6):
  - no newer remote: open here;
  - newer remote and `readAt <= syncedAt`: open there and adopt with the remote `readAt`;
  - newer remote and `readAt > syncedAt`: open here and offer;
  - a remote place for another file falls back from CFI to href + fraction to percent.

  Also for merging mirror rows into `book.positions` (this device's row is replaced by the local place as `this-device`).
- [X] T017 [P] [US2] Unit tests `apps/web/tests/unit/outbox.test.ts`:
  - pending = `syncedAt === null || readAt > syncedAt`;
  - after a 200, `syncedAt = readAt` only if the place hasn't moved meanwhile;
  - `stale` counts as sent;
  - 403 or network failure keeps everything pending and reports "sign-in" or "offline";
  - at most one send in flight;
  - the 10 s debounce.

### Implementation for US2

- [X] T018 [US2] Migration `apps/web/migrations/0005_reading_place.sql`: table `reading_place` with the columns in [data-model.md](data-model.md) (`book_id`, `device_id`, `device_name`, `percent`, `chapter_label`, `href`, `fraction`, `cfi`, `file_sha256`, `furthest_percent`, `furthest_href`, `read_at`, `received_at`), `PRIMARY KEY (book_id, device_id)`, and no foreign key to `book`. Apply it locally (`wrangler d1 migrations apply longshelf --local`). The preview database gets it from CI (DR-0012).
- [X] T019 [US2] `apps/web/src/lib/server/mirror/progress.ts` and `apps/web/src/routes/api/progress/+server.ts`:
  - GET: all rows, weak ETag from `max(received_at)` and the count;
  - PUT: validate with `ProgressPutSchema`, clamp `readAt`, then one D1 `batch` of `INSERT … ON CONFLICT(book_id, device_id) DO UPDATE SET … WHERE excluded.read_at > reading_place.read_at`;
  - work out `accepted` and `stale` from the rows after the batch.

  Owner-only: add `/api/progress` to the owner routes in `apps/web/src/lib/server/mirror/gate.ts`, and update `gate.test.ts`. Also add it to `apps/web/scripts/test-access.ts` as an owner-only route.
- [X] T020 [US2] Service worker: `GET /api/progress` network-first with the `catalog-v1` cache fallback and the `x-longshelf-source` header, exactly like `catalogue()` in `apps/web/src/service-worker.ts`.
- [X] T021 [US2] Create `apps/web/src/lib/reader/outbox.ts`:
  - `queueSend()` (debounced 10 s), `flush({ keepalive })` and `pendingPlaces()`, which scans `longshelf.reader.place.*` keys;
  - wire `flush` on app start, `online` and `visibilitychange` (hidden → `keepalive: true`) in `apps/web/src/routes/+layout.svelte`;
  - on 403, set the existing sync status to "Sign in again", keeping places pending.
- [X] T022 [US2] Create `apps/web/src/lib/reader/places.ts`: `fetchPlaces()` (GET `/api/progress`, mirror mode only; sample mode returns the sample positions as now), `mergePositions(book, rows, local)`, and `chooseOpen(local, remotes)` (research R6). Make mirror-mode `positions()` and `book.positions` use it: in `apps/web/src/lib/library/mirror.ts`, load places alongside the catalogue and join them into the snapshot's positions. Device names come from the rows, falling back to `deviceName()` for `kobo`.
- [X] T023 [US2] (Built 2026-11-26. Draft wording awaiting the owner: a more recent place that is not further on reads "Read more recently on <device>"; shown on /design/kobo-notice. Filename kept as KoboNotice, the text is now device-neutral.) Reader open rule in `apps/web/src/routes/read/[id]/+page.svelte`:
  - use `chooseOpen` for `startCfi`, `startHref` and `startFraction`;
  - when it adopts, `savePlace` with the remote `readAt` and `syncedAt`;
  - when it offers, show the existing `KoboNotice` with the device's name and place (rename the component to `PlaceNotice` if its text is Kobo-specific);
  - on relocate, `savePlace` and then `queueSend()`.
- [X] T024 [US2] Use the device's real name from `thisDevice()` in every place sent, and show other devices by their `deviceName` wherever `deviceName()` is used (`apps/web/src/lib/library/format.ts` and its callers).

**Checkpoint**: T015 to T017 pass. Quickstart step 3 passes on the preview with two devices. Journal line with SC-002 and SC-003.

---

## Phase 5: User Story 3, see and manage what's stored (P3)

**Goal**: Settings → Storage lists downloads and space, and removes them.

**Independent test**: quickstart step 4.

- [X] T025 [US3] Create `apps/web/src/routes/settings/storage/+page.svelte` per the approved mock (T003), using `list()` and `storageInfo()`:
  - rows with title and size, plus a mark for books no longer in the library;
  - total, "about N available", and kept or not kept, with a "Keep downloads" button that calls `persist()` again if not kept;
  - Remove per row, and Remove all with one confirmation;
  - this device's name with Rename (`renameDevice`).

  Removing never touches places (FR-015). Add a link to it wherever settings are reached (the header menu or `/settings/ai`). (Nothing links to settings today; Storage is reached from the book page's More menu, "Downloads on this device", and from the no-space message. Owner to confirm.)
- [X] T026 [US3] On app start, reconcile: if a book's place says it was downloaded but `books-v1` has no entry (storage cleared), there's nothing to fix in data. Make sure every view reads `list()` rather than a cached flag, so a cleared cache shows as "not downloaded" (edge case "device cleared its storage"). Add a test to `downloads.test.ts` by clearing the fake cache.
- [X] T027 [P] [US3] Add the storage page, and the book page's download states, to the a11y matrix (`apps/web/tests/e2e/a11y.spec.ts`) and to `pnpm design:compare` (`apps/web/scripts/design-compare.ts`) against `design-mocks/storage.html`.

**Checkpoint**: quickstart step 4 passes on the preview.

---

## Phase 6: Polish and production

- [X] T028 (Approved by the owner 2026-11-28; offline start fixed, see JOURNAL.) Run quickstart steps 1 to 5 on the PR preview. Fix anything found. Record the results in `docs/JOURNAL.md`.
- [X] T029 Update the docs:
  - `CLAUDE.md` Commands (no new commands expected; note the smoke test in `pnpm test:e2e`);
  - `docs/DEPLOY.md` (the migration runs with `pnpm run deploy`);
  - `docs/PLAN.md` Phase 2 checkboxes and spec table (004 done);
  - mark the spec 002 "Download" placeholder as resolved where it's mentioned.
- [ ] T030 After merge, `pnpm run deploy`, then `pnpm --filter web test:access https://library.longshelf.app`. The owner runs quickstart step 6 on their devices with the real library. Record SC-001 and SC-002 in `docs/JOURNAL.md`.

---

## Dependencies and execution order

- **Phase 1:** T001 first. T002 needs the owner. T003 needs the owner's approval and gates all UI tasks (T011–T013, T023's notice, T025).
- **Phase 2:** T004, T005 and T006 in parallel. Blocks the stories.
- **US1:** T007 and T008 (tests) first. Then T009 → T010 → T011, T012, T013 → T014.
- **US2:** needs Phase 2. It is independent of US1 except T024 (device name, shared with US3). T015–T017 first; then T018 → T019 → T020; T021 and T022 → T023 → T024.
- **US3:** needs T009 (downloads module) and T005 (device).
- **Polish:** after the stories.

```
T001‖T002 ─► T003 (approval) ─┐
T004‖T005‖T006 ───────────────┼─► US1 (T007–T014) ─► US3 (T025–T027) ─► T028–T030
                              └─► US2 (T015–T024) ──────────────────────┘
```

## Parallel examples

- **Phase 2:** T004, T005 and T006 (different packages and files).
- **US1:** T007 and T008 together. T012 and T013 after T011.
- **US2:** T015, T016 and T017 together. T018–T020 (server) alongside T021–T022 (browser).
- **Across stories:** US2's server tasks (T018–T020) can run while US1 is under review on its preview.

## Implementation strategy

1. **MVP = Phases 1, 2 and US1.** Offline reading of chosen books on the phone. Open a PR, try it
   on the preview, merge and deploy.
2. **Then US2** (places across devices), on its own PR. It's the larger change, with server and
   migration.
3. **Then US3** (storage page) and polish.
4. **Stop and ask the owner** at:
   - T001, if the spike forces OPFS;
   - T002 (phone check) and T003 (mock approval);
   - any new dependency or fixed cost.

## Notes

- Out of scope: the public showcase, Kobo places and `native_location` (spec 005), finished
  status, highlights, Dexie (DR-0013), automatic downloads.
- FR-017's accessibility standard: the existing axe matrix (`pnpm test:a11y`, on demand).
