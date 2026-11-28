# Data model: Author details and first-published years

Spec: [spec.md](spec.md) · Research: [research.md](research.md).
New D1 tables only, in `apps/web/migrations/0005_lookups.sql`. Additive: no existing table changes.

## Book metadata gains `isbn`

`Book` in `packages/shared/src/library/types.ts` gains `isbn?: string`, ISBN-13 digits only.
The CLI fills it from Calibre's `identifiers` table (research R8).
It travels in the `book.metadata` JSON the mirror already stores.

## D1 tables

### `work_detail` (spec entity: work details)

One row per book that has been looked up, hit or miss.

| Column | Type | Notes |
|---|---|---|
| `book_id` | TEXT PK | Calibre book UUID, as in `book.id` |
| `isbn` | TEXT NOT NULL | The ISBN it was looked up with; a changed ISBN means look again |
| `ol_work` | TEXT | e.g. `OL66554W`; NULL when Open Library had no match |
| `first_year` | INTEGER | NULL when unknown |
| `ol_authors` | TEXT | JSON `[{ "key": "OL21594A", "name": "Jane Austen" }]` |
| `fetched_at` | TEXT NOT NULL | ISO time; refresh after the refresh period |

### `author_detail` (spec entity: author details)

One row per Calibre author that has been considered.

| Column | Type | Notes |
|---|---|---|
| `author_id` | TEXT PK | Calibre author id, as in `AuthorRef.id` |
| `state` | TEXT NOT NULL | `matched`, `unmatched` or `conflict` |
| `via_book_id` | TEXT | The book it was matched through (FR-004) |
| `ol_author` | TEXT | Open Library author key |
| `wikidata` | TEXT | e.g. `Q36322` |
| `details` | TEXT | JSON, the `Author` fields below; NULL unless `matched` |
| `photo_sha256` | TEXT | R2 key `portrait/<sha>`; NULL without a clearly licensed photo |
| `fetched_at` | TEXT NOT NULL | |

`details` holds what the page shows, in the existing `AuthorSchema` shape:
`lifeDates`, `bio { text, source }`, `portrait { credit, licence, source, alt }`
(its `url` is filled from `photo_sha256` when the document is built),
and `bibliography` (notable works with years, after DR-0005's date rule).

### `lookup_queue` (spec entity: lookup queue)

| Column | Type | Notes |
|---|---|---|
| `book_id` | TEXT PK | |
| `step` | TEXT NOT NULL | `work`, then `author` (per book's authors), then done and removed |
| `tries` | INTEGER NOT NULL DEFAULT 0 | |
| `next_at` | TEXT NOT NULL | Not before this time; backs off after a failure |

### `lookup_state`

A single row (`id = 1`).

| Column | Type | Notes |
|---|---|---|
| `enabled` | INTEGER NOT NULL DEFAULT 1 | The Settings switch (FR-010) |
| `last_run_at` | TEXT | |
| `paused` | TEXT | JSON `{ "<source>": "<until>" }` while a source is resting |
| `details_sha256` | TEXT | The current details document in R2 |
| `previous_sha256` | TEXT | Kept so a browser mid-fetch never gets a 404 |

## R2 keys

- `portrait/<sha256>`: author photos, 400 px wide, as Wikimedia served them.
- `details/<sha256>`: the details document.

These sit outside the `blob` table, so the upload's garbage collection never touches them.
The lookups Worker deletes its own objects: a photo when no `author_detail` row names it,
a document when it's neither current nor previous.

## The details document

Served at `GET /api/details` (see [contracts/details-api.md](contracts/details-api.md)).

```json
{
  "version": 1,
  "builtAt": "2026-11-28T10:00:00Z",
  "authors": {
    "<calibre author id>": { "lifeDates": "…", "bio": {}, "portrait": {}, "bibliography": [] }
  },
  "works": { "<book uuid>": { "firstYear": "1813" } }
}
```

`works` lists a book only when its first year is known and differs from the edition's year (US2).

## Life of a lookup

1. **Reconcile** (start of each run): books with an ISBN and no current `work_detail` go in the queue;
   `work_detail` rows for removed books are deleted, and `author_detail` rows for authors with no books left.
2. **Work step:** Open Library search (R3). Write `work_detail`, move the book to `author`.
3. **Author step:** for each of the book's Calibre authors without a current `author_detail`,
   pair names (R9), then Wikidata (R4) and Wikipedia (R5). Write `author_detail`.
4. **Publish:** if anything changed, build the details document and swap it in `lookup_state`.

A failure adds one to `tries` and sets `next_at` an hour, then a day, then a week later.
Nothing already stored is removed by a failure.
Refresh period: 180 days for hits, 30 days for misses. (ASSUMPTION; adjust after the first fill.)

## Off and on (FR-010)

- **Off:** set `enabled = 0`, delete every row in `work_detail`, `author_detail` and `lookup_queue`,
  delete `portrait/*` and `details/*`, clear the document. The app then shows today's simple pages.
- **On:** set `enabled = 1`. The next run's reconcile queues every book again.
