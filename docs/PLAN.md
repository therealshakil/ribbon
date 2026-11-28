# Plan

Work is done as Spec Kit features in `specs/NNN-name/` (spec, plan, tasks). This file is the index
and the spike log. Each phase's checklist below is the starting scope for its spec; once the spec
exists, its `tasks.md` is the source of truth and the list here is not updated.

## Specs
| # | Feature | Depends on | Status |
|---|---|---|---|
| 001 | [Visual design](../specs/001-visual-design/spec.md): calm, ND-friendly design system + per-element design pages | calm-ds constitution | MVP built (US1+US2); US4 superseded by 002 |
| 002 | [Redesigned screens and AI features](../specs/002-redesign-and-ai/spec.md) (DR-0002, DR-0003) | 001 | Built and design signed off 2026-11-23 on sample data. Not deployed. Story so far (T053) and AI search (T061–T063) are parked; plain search shipped instead (DR-0008) |
| 003 | [Library mirror](../specs/003-library-mirror/spec.md) (Phase 1 below) | 002 | Done 2026-11-25. Deployed 2026-11-24; the owner's 670 books are online at library.longshelf.app |
| 004 | Read (Phase 2) | 003 | not started |
| 005 | Device progress (Phase 3) | 004, spike | not started |
| 006 | [Richer library data from Open Library](../specs/006-open-library/spec.md) | 003 | Locked 2026-11-27 (Wikipedia and Wikidata content per DR-0005, Open Library matching, runs in the mirror). Plan drafted 2026-11-28; DR-0013 accepted by the owner the same day; next `/speckit-tasks` |

## Spike (manual, on the desktop with the Kobo; record findings here)
- [ ] Install Kobo Utilities, configure columns, confirm store and restore round-trip a position.
- [ ] Can restore run automatically on connect, or is it a menu click?
- [ ] Hand-edit the location column to a chapter start, restore, confirm the Kobo opens there.
- [ ] How does `calibredb set_custom` behave with the Calibre GUI open?
- [ ] Add KEPUB as a library format for one book, send it, and check whether the file on the device is
      byte-identical to the library copy (if so, exact web -> Kobo positions are possible).
- [ ] Note the exact column names and the format of the location value for a KEPUB and a plain EPUB.

## Spike: OPDS (parked 2026-11-24: future nice-to-have, to be specced another time)
Nothing below has been tested. Pick it up from the first unchecked item.

Question: could an OPDS feed served by the Worker replace USB for getting books onto the e-reader, and
does KOReader's own progress sync change the plan for spec 005?

Desk findings so far:
- OPDS is a one-way catalogue: the reader browses and downloads, nothing comes back. Clients named:
  KOReader, Thorium, Moon+ Reader, Librera. Servers named: the Calibre content server (`/opds`),
  Calibre-Web, Kavita, Komga, COPS. ([The Open Shelf, 2026-09-23][os]; the author promotes their own
  app, BookShelves, so treat the setup advice as one user's view.)
- Stock Kobo firmware has no OPDS client, so the Libra 2 would need KOReader installed alongside
  Nickel. That conflicts with DESIGN.md's "stock firmware" assumption, so it is the owner's call. ([os])
- KOReader's OPDS form takes a username and password and sends them as HTTP Basic auth
  ([Booklore docs][bl]; [Standard Ebooks][se]). It cannot send Cloudflare Access service-token headers
  (`CF-Access-Client-Id`/`-Secret`, [Cloudflare][cf]). So the feed needs a path outside Access with its
  own Basic auth. ASSUMPTION: an Access Bypass policy on a path-scoped app does this; check the docs.
- KOReader also has its own progress sync ("kosync"): `PUT /syncs/progress`,
  `GET /syncs/progress/{document}`, with the book identified by a partial MD5 of the file and the
  position stored as a percentage plus a KOReader position string ([koreader-sync-server][ks];
  [korrosync][kr]). A Worker could serve this API too. It would be layer 1b: sync over Wi-Fi with no
  USB and no Calibre running. KOReader positions are not EPUB CFIs, so moving between the web reader and
  the device would be accurate to the chapter or percentage.

[os]: https://medium.com/@theopenshelf/i-havent-plugged-my-e-reader-into-a-computer-in-months-opds-is-why-485f8fb405aa
[bl]: https://booklore-app.github.io/booklore-docs/docs/integration/opds
[se]: https://standardebooks.org/help/how-to-add-an-opds-feed-to-your-ereader
[cf]: https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/
[ks]: https://www.github.com/koreader/koreader-sync-server
[kr]: https://docs.rs/crate/korrosync/latest

To check:
- [ ] Owner: is running KOReader on the Libra 2 acceptable? If not, OPDS only helps phone and desktop apps.
- [ ] Throwaway OPDS 1.2 feed (Atom) from local Calibre mode; browse and download it in a desktop client.
- [ ] KOReader on the device: Basic auth, covers, search, and download of EPUB and KEPUB from the feed.
- [ ] Confirm an Access Bypass path plus Worker-side Basic auth (or another way past Access for the feed).
- [ ] kosync: confirm the routes and auth in the official server's `config/routes.lua`; how the partial
      MD5 is computed, so the Worker can match a device book to a Calibre book; the position string format.
- [ ] Outcome: a DR on whether OPDS and/or kosync enter specs 003 and 005.

## Spike log: spec 003 T003 (deployed Worker, 2026-11-24)

Measured on `longshelf.<account>.workers.dev` with `wrangler tail` CPU times. The catalogue was a
licence-free synthetic one: 670 records, 1.2 MB.

- **(b) Images binding on workers.dev:** works. One 400 px WebP thumbnail came out at 138 KB, so
  set a quality option in T015.
- **(c) CPU:**
  - Parsing the catalogue took 8 ms warm and 19 ms cold.
  - Read next over 640 books took 20–24 ms warm and 59 ms cold, over the Free plan's 10 ms
    (research R9). Cloudflare didn't stop those requests, but that isn't something to rely on.
  - **Owner ruling:** Read next and More like this run in the browser on the catalogue it
    already holds. The server returns only stored matches and dismissals. Cost stays $0. This
    changes T027.
- **(a) Access identity:** `platform.ctx.access` isn't exposed through SvelteKit's adapter, so
  the Worker uses the `Cf-Access-Jwt-Assertion` header (research R5 fallback).
  - The owner's browser token carries `email`.
  - The service token's token carries `common_name`, equal to the Client ID, and no email.
  - Both have `type: app` and the app's `aud`.
  - Access needed a **Service Auth** policy that includes the token. Without it, the token was
    redirected to sign-in like an anonymous request.
  - The library is served at `library.longshelf.app` only, with workers.dev off.

## Starting scope per spec

### Phase 1: mirror → spec 003 (does not depend on the spike)
- [x] Wrangler config, `pnpm run deploy` from the laptop (CI deferred, DR-0010; scaffold moved to spec 001)
- [x] D1 schema + migrations
- [x] Ingest API (`plan`, `books`, `commit`) with Zod contract
- [x] `longshelf library` (upload every format; KEPUB when present, per spec 003 FR-004)
- [x] Library UI: wire the spec 002 screens to real data (save a copy from Details)
- [x] PWA manifest + service worker (app shell, covers)
- [x] Cloudflare Access + service token
- [x] Upload the owner's real library and record the SC timings (spec 003 T039; phone check SC-003 by the owner)

### Phase 2: read → spec 004
- [ ] foliate-js submodule + `Reader.svelte`
- [ ] Offline downloads (OPFS), storage settings page
- [ ] Web progress, outbox, catalog snapshot in Dexie
- [ ] Playwright smoke test: open app, go offline, open a book
- [ ] Public showcase library (owner, 2026-11-24): a second, public deployment on its own
      subdomain that anyone can browse and read. It holds public-domain books the owner picks to
      represent them, and it grows out of the spec 003 test library. Needs:
      - a separate Worker, D1 and R2, so the private library's data and key never touch it;
      - a public, read-only mode: no Access, the fail-closed gate off for reading, ingest still
        locked to a service token;
      - AI off, or capped hard, because anyone can call it;
      - no personal reading progress shown;
      - a recorded cost check, because public traffic counts against the free allowances.
      - First collection: authors of African descent, under the US public-domain rule (DR-0011).
        Candidates are in `docs/showcase/african-descent.md`, built with the scripts in
        `docs/showcase/scripts/`.
      - Public domain only (owner, 2026-11-25). The showcase lists and hosts only
        public-domain books. Each 1 January, books entering the US public domain are added.
        (This replaces a same-day idea to also list in-copyright books with links to ebook stores.)

### Phase 3: device progress via Calibre columns → spec 005
- [ ] Store device location verbatim in `native_location`; merge status and position by separate timestamps
- [ ] Column config; `longshelf progress` (read columns, push; pull, `calibredb set_custom`)
- [ ] "Jump to Kobo position" prompt
- [ ] `longshelf install-timer` (systemd, launchd)

### Later, optional
- [ ] Layer 2 Kobo adapter: highlights, exact positions
- [ ] Reading stats
- [ ] OPDS catalogue and KOReader progress sync (parked spike above)
- [ ] Portable deployment (parked 2026-11-24): a Docker image others can install, beside the Cloudflare
      deploy. Sketch: `adapter-node`; `node:sqlite` for D1 (same SQL and migrations); a volume folder for
      R2; covers pre-sized by the CLI instead of the Images binding; AI off or any OpenAI-compatible
      endpoint; built-in single-owner login instead of Access. Case against: Calibre-Web, Kavita,
      Booklore and Komga already fill this space, and two hosts roughly double the test and support
      surface. Cost of waiting: spec 003 is building D1 and R2 access directly, so this would need
      storage interfaces retrofitted across the routes.
