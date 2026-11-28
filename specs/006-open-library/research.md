# Research: Author details and first-published years

Spec: [spec.md](spec.md).
Limits and policies read 2026-11-28 unless marked.
Each item ends with what the spike (plan, delivery step 1) must confirm.

## R1. Where the lookups run

**Decision:** a second, small Worker, `longshelf-lookups`, with a Cron Trigger every 10 minutes.
It shares the app's D1 database and R2 bucket, and has no routes.

**Rationale:**

- The app Worker can't take a `scheduled` handler today.
  `@sveltejs/adapter-cloudflare` 8.0.2 writes its generated worker to whatever wrangler's `main` names
  (adapter `index.js`, lines 56–66, read locally), so a hand-written entry would be overwritten.
  The handlers option in the adapter's preview docs isn't in 8.0.2
  ([adapter-cloudflare docs](https://svelte.dev/docs/kit/adapter-cloudflare)).
- A Worker with no routes and `workers_dev: false` has nothing to reach from outside,
  so it needs no Access policy.
- Free plan: 5 Cron Triggers per account, 10 ms CPU per scheduled run, 15 minutes wall time,
  50 outside subrequests per run
  ([Workers limits](https://developers.cloudflare.com/workers/platform/limits/)).
  Waiting on `fetch` doesn't count as CPU.
- Lookup state lives in D1 (the spec's lookup queue), so a run that stops halfway loses nothing (FR-007).

**Alternatives considered:**

- Cloudflare Queues or Workflows: both now on the Free plan, and both built for retries.
  Set aside because each needs a consumer or class export, the same entry-point problem as above,
  plus a second store of state beside D1. A D1 table is one table we already know how to test.
- A Vite plugin or adapter fork that patches `_worker.js`
  (for example `@joshthomas/sveltekit-adapter-cloudflare`): a new dependency that sits on our build.
  Principle 4 says ask first, and the second Worker does the job without it.
- Lookups during upload, on the owner's laptop: ruled out by the spec (FR-001).

**Spike:** deploy the empty Worker with the cron and bindings; confirm it reads D1 and writes R2;
measure CPU per run with `wrangler tail`.

## R2. Pacing inside the Free plan

**Decision:** each run does at most 40 outside requests and stops at 8 ms of measured CPU or
10 minutes wall time, whichever comes first.
Requests to one source go one at a time, with a gap that keeps under its limit (R3–R5).
A 429 or 5xx pauses that source until the next run, or until `Retry-After`.

**Rationale:** 144 runs a day × 40 requests is far more than the ~1,500 the first fill needs (R7),
so a run can be small and still meet SC-003 (a day) and SC-004 (an hour).
The 10 ms CPU limit is the tight one. JSON parsing is the main cost,
so responses are kept small (R4 asks Wikidata only for the fields we use).

**Spike:** CPU of one run at 40 requests. If it's over 10 ms, lower the per-run cap;
the schedule has room.

## R3. Open Library: ISBN to work, year and authors

**Decision:** one search request per ISBN:
`/search.json?isbn=<isbn>&fields=key,first_publish_year,author_key,author_name&limit=1`.
That gives the work, its first-published year and its authors' IDs and names in one small response.

**Rationale:**

- The search index already computes `first_publish_year` across a work's editions,
  which is what US2 shows. The work record's own `first_publish_date` is often empty.
- Rate: 1 request a second unidentified, 3 a second with a User-Agent naming the app and a contact
  ([Open Library API](https://openlibrary.org/developers/api)).
  We send `Longshelf/<version> (+<repo URL>)` and pace at 1 a second, well inside either.
- The contact is the project's public repository URL, not the owner's email.
  A deployment can set its own contact in config.

**Alternatives considered:** `/isbn/<isbn>.json`, then the work, then each author:
three or more requests per book, and still no reliable first year.
Batched `/api/books?bibkeys=…`: returns edition data without the work's first year.

**Spike:** run the 542 ISBNs (counted 2026-11-26) from a laptop script, read-only:
how many hit, how often `first_publish_year` is set, and whether `limit=1` ever picks the wrong work.

## R4. Wikidata: Open Library author ID to the author entry

**Decision:** one SPARQL query per batch of up to 25 Open Library author IDs, matching on
[P648](https://www.wikidata.org/wiki/Property:P648) (Open Library ID).
It returns, per author: the item, birth and death dates (P569, P570), the English description,
the English Wikipedia article title, and notable works (P800) with their earliest publication date (P577).

**Rationale:**

- One query replaces about 25 entity fetches, and the response holds only what the page shows,
  which keeps parsing inside the CPU limit.
- Wikidata Query Service: 60 seconds of query time per minute per client, a 60-second timeout,
  and the User-Agent policy applies
  ([WDQS manual](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual),
  [Wikimedia API access policy](https://www.mediawiki.org/wiki/Wikimedia_APIs/Access_policy)).
  These queries are simple lookups by ID, far under that.
- An Open Library author ID that maps to two Wikidata items, or two IDs for one Calibre author that
  map to different items, is a conflict, and the author stays unmatched (FR-004, SC-002).

**Alternatives considered:** `wbgetentities` (up to 50 items a call): returns every claim,
which for a well-known author is hundreds of KB, too much to parse in 10 ms.
The Wikibase REST API per property: small, but 5+ requests per author.
Kept as the fallback if the query service is down (it rate-limited during DR-0005's test).
The query service is moving to a new backend in 2026–27; the query is plain SPARQL, so it should carry over.

**Spike:** run the batched query for the authors matched in R3: how many Open Library IDs have a
Wikidata item. This is the check on SC-001's 60% for living authors.

## R5. Wikipedia and Commons: bio and photo

**Decision:** per matched author, two requests, then a third for the photo:

1. `https://en.wikipedia.org/api/rest_v1/page/summary/<title>`: the introduction (`extract`)
   and the lead image.
2. Commons `imageinfo` with `extmetadata` for that file: licence and credit.
3. The image itself, at 400 px wide, stored in R2 (FR-009).

The photo is kept only with a clear free licence: public domain, CC0, CC BY or CC BY-SA (DR-0005).
Bio text is shown with CC BY-SA 4.0 and a link, as the page does now.

**Rationale:** the same route DR-0005 used on the sample authors (66 of 67 matched, 62 with a clear
licence). Wikimedia asks for a descriptive User-Agent and honouring 429 and `Retry-After`
([access policy](https://www.mediawiki.org/wiki/Wikimedia_APIs/Access_policy)).

**Spike:** none beyond R1's write to R2. The licence rules are the ones already in use.

## R6. How the app gets the details, offline

**Decision:** after a run that changed something, the lookups Worker writes one JSON document,
the **details document**, to R2 by its SHA-256, and records it in D1.
The app Worker serves it at `GET /api/details` with an ETag, like `/api/catalog`.
The service worker caches it network-first, and photos cache-first, like covers.
The browser merges it into the snapshot library: author pages get their details,
book pages get the first-published year.

**Rationale:**

- FR-008: separate from the Calibre catalogue, which only the CLI builds, and readable offline the same way.
- The Worker only streams a stored document, so requests stay inside 10 ms CPU,
  the rule that spec 003's spike set for `/api/catalog`.
- Size estimate: 367 authors × about 1 KB, plus 542 years, is under 500 KB before gzip. (ASSUMPTION; measured in the first fill.)

**Alternatives considered:** building the JSON from D1 on each request (CPU risk at this size);
folding details into the catalogue (the catalogue is the CLI's, and the CLI must not depend on the cloud's lookups).

## R7. Request count for the first fill

ASSUMPTION, checked by the spike: 542 Open Library searches, about 15 Wikidata queries,
and up to 3 Wikimedia requests for each of about 250 matched authors, so about 1,300 requests.
That's under the spec's 2,500 estimate, and under a day at 40 a run (about 33 runs, under 6 hours).

## R8. ISBNs into the mirror

**Decision:** the CLI reads Calibre's `identifiers` table (type `isbn`), normalises to ISBN-13,
and adds `isbn` to each book's metadata.
The lookups Worker reads ISBNs from the `book` table's metadata, so nothing else in the upload changes.

**Rationale:** Calibre is read-only here (FR-012). The first upload after this change rewrites every
book row once, because each book's metadata hash changes. 631 rows are well inside D1's 100,000 writes a day.

## R9. Matching names (FR-004)

**Decision:** a Calibre author pairs with an Open Library author on the same work only when their
normalised names agree: accents and punctuation removed, "Last, First" turned around,
and each initial matching a full name in the same place.
A Calibre author whose books lead to more than one Wikidata item is left unmatched.

**Rationale:** no name match without a shared book (FR-004); no match is better than a wrong one (SC-002).
Checked by a hand review of 30 matched authors after the first fill.

## R10. Dev mode, previews and the showcase

- `pnpm dev:calibre` and sample mode never call `/api/details`, and make no outside requests (FR-001).
- PR previews: the lookups Worker isn't deployed for previews, so previews show sample details only.
- The showcase deployment gets no lookups Worker (FR-013).
