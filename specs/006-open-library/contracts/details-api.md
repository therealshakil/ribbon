# Contract: details API (browser → app Worker)

All routes sit behind Cloudflare Access and the Worker's own identity check, like the rest of `/api` (spec 003).
Zod schemas live in `packages/shared/src/details.ts`.

## `GET /api/details`

The details document ([data-model.md](../data-model.md#the-details-document)).

- `200` with `ETag: "<sha256>"` and `Cache-Control: no-cache`; streamed from R2, never built per request.
- `304` when `If-None-Match` matches.
- `404` when there is no document: the service is off or hasn't finished a run.
  The app treats this as "no details" and shows today's pages, without a message.
- The service worker caches it network-first, as it does the catalogue.

## `GET /api/portraits/<sha256>`

An author photo from R2.

- `200`, `Content-Type` as stored, `Cache-Control: public, max-age=31536000, immutable`.
- `404` if unknown.
- The service worker caches it cache-first, as it does covers.

## `GET /api/details/status`

What Settings shows (US3).

```json
{
  "enabled": true,
  "authorsWithDetails": 231,
  "authorsTotal": 367,
  "booksWaiting": 12,
  "lastRunAt": "2026-11-28T10:00:00Z",
  "resting": ["wikidata"]
}
```

`resting` names sources paused after a 429 or an outage. Settings says, calmly,
that it'll try again later (US3 scenario 2). Nothing asks the owner to act.

## `PUT /api/details/enabled`

Body `{ "enabled": false }` or `{ "enabled": true }`.

- Off removes fetched details and photos (data-model.md, Off and on), then answers
  `200 { "enabled": false, "removed": { "authors": 231, "photos": 198 } }`.
- On answers `200 { "enabled": true }`; lookups start at the next run, within 10 minutes.
- The confirmation is in the UI, before the request (FR-010).

## Outbound requests (lookups Worker → sources)

Not an API we serve, but a contract we keep (FR-002, FR-003):

- Every request carries `User-Agent: Longshelf/<version> (+<contact URL>)`.
  The contact defaults to the project's repository URL; a deployment can override it.
- Request bodies and URLs hold only ISBNs, Open Library and Wikidata IDs, and Wikipedia and Commons titles.
- One request at a time per source; 1 a second for Open Library; 429 and `Retry-After` honoured.
