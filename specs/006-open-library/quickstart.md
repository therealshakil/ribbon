# Quickstart: checking spec 006 works

Run in order. Each step names what it proves.
Setup and deploy are as in [docs/DEPLOY.md](../../docs/DEPLOY.md); this adds one Worker.

## 1. Unit tests (no network)

```sh
pnpm test
```

Proves: name pairing and conflicts (R9), DR-0005's date rule, licence filtering,
reconcile and back-off, building the details document, the merge into author and book pages.
Source responses come from saved fixtures of public-domain authors.

## 2. Lookups Worker, locally

```sh
pnpm --filter web exec wrangler dev -c wrangler.lookups.jsonc --test-scheduled
curl "http://localhost:8787/cdn-cgi/handler/scheduled"
```

Run against the licence-free test library seeded by `pnpm test:e2e:mirror`'s setup.
Expect: `work_detail` and `author_detail` rows in local D1, a `details/` object in local R2,
and fewer than 40 outside requests in the log.

## 3. App shows details (US1, US2)

On a mirror build with the local details document:

- Open a matched author: dates, bio, photo with credit and licence, notable works with owned ones marked.
- Open an unmatched author: the page looks as it does on main, with no empty boxes.
- Open a reprint: both years show, labelled.
- Go offline and reload both pages: still there.
- Check the network panel: no request leaves the app's own origin (SC-005).

## 4. Settings (US3)

- Status shows counts and the last run.
- Turn the service off, confirm: author details leave the pages, `/api/details` answers 404.
- Turn it on: details return after the next run.

## 5. Dev mode stays offline

```sh
pnpm dev:calibre
```

Expect: author pages as today, and no requests to `/api/details` or any outside host.

## 6. Live, on the owner's library

1. `pnpm run deploy` (deploys both Workers).
2. `pnpm longshelf library` once, to add ISBNs, then switch the laptop off.
3. Next day: Settings shows the fill finished (SC-003), and at least 60% of authors have details (SC-001).
4. Hand-check 30 matched authors for the right person (SC-002). Record the result in `docs/JOURNAL.md`.
5. Upload one new book; within an hour its details show (SC-004).
6. A month later: the Cloudflare bill is unchanged (SC-006).
