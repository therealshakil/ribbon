# DR-0013: Author lookups run in the mirror, matched through Open Library

Status: **rejected** (owner, 2026-11-28). Drafted the same day with the spec 006 plan.
Refines: [DR-0005](DR-0005-author-data.md). Spec: [006](../../specs/006-open-library/spec.md).

## Context

DR-0005 chose Wikipedia and Wikidata for author content, tested on 67 sample authors gathered by hand.
Real Calibre authors have only a name, and the lookup must run without the owner's laptop (spec 006 FR-001).

## Decision

- **Matching:** through the owner's own books. ISBN → Open Library work → the work's author whose name
  agrees with Calibre's → that Open Library ID on Wikidata (P648). No match by name alone.
- **Content:** unchanged from DR-0005: Wikipedia bio and licensed photo, Wikidata dates and notable works.
- **New:** first-published years from Open Library's search index (`first_publish_year`).
- **Runner:** a second Worker with a 10-minute Cron Trigger, sharing the app's D1 and R2, no routes.
  The app's SvelteKit adapter can't take a scheduled handler (spec 006 research R1).
- **Delivery:** one details document in R2, served at `/api/details`; photos copied into R2.

## Options for the runner

| Option | Verdict |
|---|---|
| **Second Worker + Cron + D1 queue (chosen)** | Free plan; one entry file and one config; state in D1 |
| Queues or Workflows | Free plan too, but the same entry-point problem and a second store of state |
| Adapter fork or build patch | A new dependency on the build path |
| On the laptop during upload | Ruled out by the spec |

## Challenger

Strongest case against: "Longshelf's first principle is few moving parts. A second Worker, three outside
sources and a queue is a lot for author bios. Ship first-published years only, from the laptop,
and leave the author page as it is."

Ruling: rejected by the owner, 2026-11-28. The proposer's answer had been: the moving parts are contained.
Each source only hides its own section when it fails, the queue is one table,
and the off switch removes everything the feature added.

## Privacy and cost

Open Library, Wikidata and Wikipedia see ISBNs, IDs and article titles, from Cloudflare, not the owner's
connection (owner judged acceptable, 2026-11-26). Expected cost $0: Cron Triggers, D1 and R2 within the Free allowances.

## Sources (read 2026-11-28)

- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Open Library API](https://openlibrary.org/developers/api)
- [Wikidata Query Service manual](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual)
- [Wikimedia API access policy](https://www.mediawiki.org/wiki/Wikimedia_APIs/Access_policy)
