# Journal

## 2026-11-14: Spec Kit adopted; spec 001 (visual design) planned

- Adopted Spec Kit (AI-Team constitution, as in navarraluxe). PLAN.md is now the spec index plus spike log.
- Added spec 001, visual design, ahead of the mirror: calm, ND-friendly design built on calm-ds
  v0.1.0, with one catalogue page per element.
- Planned 001: research.md covers typefaces, polarity, contrast, colour, line length, motion,
  focus, preferences and testing. Every value is sourced or marked ASSUMPTION.
- DR-0001: custom catalogue route over Storybook. Histoire and Kitbook lack Svelte 5
  support (npm, 2026-11-14).
- The workspace scaffold (pnpm, SvelteKit, shared) moves from 002 into 001. Deploy stays in 002.
- Owner accepted DR-0001 (build our own catalogue).
- Owner approved `@axe-core/playwright` (dev dependency).
- Tasks generated: 57 (specs/001-visual-design/tasks.md).
- **Next:** `/speckit-implement` for 001, MVP = Setup → Foundational → US1 → US2.

## 2026-11-14: Spec 001 Phase 1 (setup) done; scope narrowed to defaults

- Workspace scaffolded:
  - pnpm 12 (via corepack); build scripts allow-listed in `pnpm-workspace.yaml` (esbuild, workerd);
  - `apps/web`: SvelteKit 3, Svelte 5.57, Tailwind 4.3, Vite 8, adapter-cloudflare;
  - `packages/shared`: Zod.
- shadcn-svelte initialised (vega preset, Lucide), but its theme CSS was not applied, because Ribbon's tokens replace it.
- Dependencies added: `cn` (shadcn's class merger, approved by the owner) and `@axe-core/playwright` (approved).
- Fonts are self-hosted from the googlefonts repos (variable woff2, OFL): Atkinson Hyperlegible Next and Literata.
- Deviation from T002: the adapter generated a minimal `wrangler.jsonc` (no bindings), and the build and typecheck scripts depend on it. It is kept; deploy is still spec 002.
- Scope change (owner): good defaults first. User-adjustable appearance (US3, FR-009–011, SC-007) is deferred. The app follows the system light/dark and reduced-motion settings, and calm-ds VII is marked "deferred". Spec, plan, tasks, data model and contract are amended.
- `CLAUDE.md` Commands section filled in.
- **Next:** Phase 2 (tokens, contrast test, CSS generation, base styles).

## 2026-11-14: Spec 001 Phase 2 (tokens) done

- Tokens live in `packages/shared/src/tokens`: 11 colours (light and dark, OKLCH), 12 type, 8 space, 2 radius, motion (0ms), 2 focus, 1 target size. Each has a rationale and sources, or is marked ASSUMPTION.
- Source registry: `packages/shared/src/design/sources.ts`, taken from research.md.
- Contrast is measured, not eyeballed. A dependency-free OKLCH → sRGB → WCAG ratio function is checked against reference values. Measured results:
  - body text 11.5:1 (light) and 11.8:1 (dark), inside the 9–12 calm band;
  - every one of the 19 pairs meets AA in both themes;
  - the light focus colour was out of gamut at first; its chroma was reduced to 0.075.
- `tokens.css` is generated before `dev`, `build`, `test` and `typecheck`, and is gitignored. Tailwind's default colour palette is removed, and the shadcn names point at the tokens.
- Global rules: no transitions or animations; bold for emphasis instead of italics; a 66ch measure on prose; a 3px focus ring.
- The token-only lint test is in place.
- **Next:** US1, the catalogue shell.

## 2026-11-14: Spec 001 US1 (catalogue shell) done

- `/design` built:
  - an index in the same place on every page (a sidebar on wide screens, a collapsed list on narrow ones), with the current page marked by a bar, weight and `aria-current`;
  - `EntryPage` wraps each page as Examples, then Why, then Sources, then calm-ds Checks;
  - `StatesGrid` shows every state at once, with no controls;
  - `/design` opens the last page you visited (stored in localStorage; falls back silently).
- The About page is the first entry. A "guide" kind was added to `CatalogueMeta` for pages that aren't tokens or components.
- Tests: catalogue completeness (schema, 7 checks, a page per entry, a page per component, ASSUMPTION under 20%) and an e2e test (every page has all its blocks and no animations).
- Toolchain fixes:
  - SvelteKit 3's lint rule requires `resolve()` for internal links; external source links are exempted inline;
  - `wrangler types` output depends on whether a build exists, so `worker-configuration.d.ts` is now generated on demand and gitignored, and `checkJs` is off (Ribbon is TypeScript-only).
- **Next:** US2, the token pages.

## 2026-11-14: Spec 001 US2 (token pages) done; MVP ready for owner review

- Seven token pages: Colour (both themes side by side, with a live contrast table), Type, Space, Corners, Motion, Focus (static ring plus measured contrast), Target size.
- Shared catalogue pieces: `TokenTable`, plus `meta-helpers` (calm-ds VII defaults to "deferred"; sources are de-duplicated).
- SC-001 is now measured per decision, as the spec words it (analysis F3): 6 of 38 token decisions rest only on ASSUMPTION (type steps, heading leading, both radii), which is 16%.
- An interim axe check (`a11y-smoke.spec.ts`) covers every page in light and dark: zero violations. The full matrix is T052.
- Tests: 47 shared unit, 28 web unit, 4 e2e, all passing. Typecheck and lint are clean.
- **Learning:** axe found links distinguished only by colour. Tailwind's preflight removes link underlines, and Lightning CSS then dropped our longhand `text-decoration-line: underline` from the merged `a {}` rule. The `text-decoration: underline` shorthand survives. Check the built CSS, not only the source, when a base style seems to have no effect.
- **Efficacy so far:** 0 reworks after implementation; running cost £0.
- **Next:** owner review of the defaults (colours, type, spacing) before US4 components.

## 2026-11-18: Redesign with Impeccable; full design approved (no app code yet)

- Adopted Impeccable v0.1.24 as a project skill (telemetry off, design hook not wired). `PRODUCT.md` written by `init`.
- A first build went ahead without a preview; the owner rejected it ("muddy and basic") and it was removed. New rule: preview and owner approval before any UI code.
- Five direction rounds on Impeccable's decision page; the owner locked "Bedside Stack" (round 5), which was then reworked into "Now reading".
- Live review, one page at a time, on static mocks in `design-mocks/`, served by Vite on :8411 so changes reload. Approved:
  - Home: current book, Also reading ledger, Read next, Latest news & magazines;
  - Story so far panel;
  - Library: tabs, author page, shelf page;
  - the book page;
  - the reader: tap to hide bars, Night theme.
- Mocks use Standard Ebooks public-domain books and covers, so they can be committed. The owner's Calibre covers were used for the earlier decision rounds only; they stay git-ignored.
- Decisions:
  - DR-0002: the redesign, oxblood accent, calm-ds as guidance;
  - DR-0003: AI features designed, with genres kept in Ribbon first and promoted to Calibre on the owner's say. Implementation and cost are still open.
- **Learning:** Impeccable live mode wires itself into the SvelteKit app when its target sits inside `apps/web`. Static mocks work cleanly from a folder outside the app, with `--target design-mocks/index.html`.
- **Next:** a new spec for the redesign and AI features (`/speckit-specify`), then plan, tasks and the build against the mocks.

## 2026-11-18: Spec 002 (redesigned screens and AI features) specified

- Owner chose one spec for the screens and the AI features together. Mirror, read and device progress are renumbered 003–005 in PLAN.md.
- Screens run on licence-free sample data until the mirror lands (FR-007).
- AI provider: Cloudflare Workers AI only, for now. No Anthropic (owner). Ceiling £5/month, target £0 within the free allowance. Content stays in the owner's account. DR-0003 is updated with the options compared and their prices, read today.
- A Claude subscription cannot power the app: subscription login is for Anthropic's own apps (Claude Code legal page).
- **Next:** `/speckit-plan` for 002.

## 2026-11-18: Spec 002 planned

- `plan.md`, `research.md` (R1–R10), `data-model.md`, `contracts/` (LibrarySource, AI API) and `quickstart.md` written.
- Key calls:
  - screens read through one `LibrarySource`, served by public-domain sample data until the mirror lands;
  - foliate-js rendering and minimal Wrangler config (AI and D1 bindings) are pulled forward from 004 and 003;
  - Story so far is built from per-chapter summaries, so it is spoiler-safe by construction;
  - suggestion reasons come from rules and embeddings, never from a model;
  - a daily spend guard sits at 8,000 neurons (free allowance 10,000);
  - spec 001's US4 component tasks are superseded.
- Owner action needed before the reader tasks: download three Standard Ebooks EPUBs (their robots.txt blocks automated downloads).
- **Next:** `/speckit-tasks` for 002.

## 2026-11-18: Spec 002 tasks generated

- 69 tasks in `specs/002-redesign-and-ai/tasks.md`. The MVP is Home and the reader on sample data (T001–T031).
- **Next:** the owner downloads the three sample EPUBs, then `/speckit-implement` for the MVP.

## 2026-11-18: Spec 002 setup, foundation and US1 (Home) built

- Setup:
  - foliate-js pinned as a submodule (78914ae, 2026-05-01);
  - shadcn-svelte `sheet` and `dialog` added, which installed Bits UI, tailwind-variants and @internationalized/date (agreed stack);
  - sample covers copied;
  - a README asks the owner to save three EPUBs.
- Tokens:
  - measured from the approved mocks: an oxblood accent (`ACCENT_HUE` 12), a new `ink` (headings) and `action` (primary button);
  - a `night` theme;
  - depth tokens (paper grain, cover and tile shadows);
  - new type steps (`text-xs`, `text-display`, `text-reading`, `leading-reading`, `weight-title`) and radii (`radius-cover`, `radius-pill`);
  - contrast pairs pass in light, dark and night.
  
  Light `control` was darkened to keep 3:1 on surfaces. Night control was darkened from the mock to reach 3:1.
- `LibrarySource` contract, the read-status rule (FR-005) and `SampleLibrary` (Standard Ebooks data, invented progress) are in `packages/shared`, with tests.
- Components:
  - AppHeader, SyncStatus, BookTile, EmptyState, ErrorState, CurrentBook ("Spread"), LedgerRow ("Compact band") and PeriodicalRow;
  - each has a catalogue page.
- Routes: Home is built against the mock; `/read/[id]` is a stub; `/library`, `/book/[id]` and `/search` are placeholders.
- Tests: 90 shared unit, 56 web unit; e2e home (8, including axe in light and dark at 390 and 1440), catalogue and a11y-smoke all pass.
- **Learning:**
  - SvelteKit 3 renders relative hrefs during SSR, so the catalogue e2e tests had matched no links: the a11y smoke test was scanning zero pages. The tests now resolve hrefs to pathnames; all 16 catalogue pages pass axe in light and dark.
  - A stale `wrangler dev` preview on :4173 from 14 Nov had been serving old builds to the e2e run (`reuseExistingServer`). It was killed.
- **Next:** US2, the reader. Blocked until the owner saves the three EPUBs in `apps/web/static/sample/books/`.

## 2026-11-18: Spec 002 US2 (reader) built: MVP ready for owner review

- **Reader:**
  - `Reader.svelte` wraps foliate-js and injects book typography from the tokens: Literata at reading size, ragged right, no hyphenation, old-style figures, first-line indents. It sets the book frame's `color-scheme` to match the page, so dark and night don't paint a white canvas.
  - ReaderChrome: thin bars; a tap in the middle toggles them; they slide only without reduced motion, using the new `duration-reveal` token and the `.reveal` class.
  - KoboNotice is a pill in the top bar.
  - TextPanel and ContentsPanel are Bits UI sheets.
  - Settings (one versioned localStorage key) and this device's place persist.
- **Sample books:** Middlemarch and Moby Dick from Project Gutenberg's official mirror (gutenberg.pglaf.org); Dracula, The King in Yellow and Paradise Lost are Gutenberg editions from the owner's machine (no personal Calibre data inside). Anna Karenina and Meditations have no file and show the "not on this device" state.
- **Robots.txt:** Standard Ebooks' robots.txt disallows `/ebooks/*/downloads/*` and `/ebooks/*/text*` for AI agents, so no Standard Ebooks file is fetched. Disclosure: earlier today, before I read the robots.txt, one Standard Ebooks chapter page (Middlemarch ch. 40) was fetched for the reader mock. The text is public domain.
- **Tests:**
  - reader e2e (11), including axe on the chrome in light, dark and night at 390 and 1440;
  - unit tests: 90 shared, 74 web.
- **Learning:**
  - Cloudflare's worker types override the DOM `Element.append` signature in this project, so `appendChild` is used instead.
  - `pkill -f <pattern>` killed the very shell running it; use the port's pid instead.
- **Next:** owner review of Home and the reader against the mocks (the MVP checkpoint), then US3 (library).

## 2026-11-20: Spec 002 US3 (library) and US8 (news) built

- **Library page:**
  - six tabs in a fixed order (ARIA tabs, state in `?tab=`);
  - Recently added grouped This week / Earlier;
  - Authors list, Collections stacks, an empty Genres tab until AI lands;
  - News & magazines by publication;
  - All Books by title with the scrubbable letter rail.
- **Other pages:**
  - author page: portrait, sourced bio, books, and a bibliography marking owned and not-owned books;
  - shelf page: Title / Author / Recently added sort;
  - book page: header, progress, Continue reading, Download toggle, More menu, description, details.
- News issues open in the reader; with no file they show the "not on this device" state.
- **Accessibility:** axe found the letter rail's letters below the 24px target size. They are now 24px tall, and the dimmed letters hide on short screens.
- **Tests:**
  - e2e library spec (9), including axe on 8 library pages in light and dark at 390 and 1440;
  - all 32 e2e pass;
  - unit tests: 90 shared, 100 web.
  
  The catalogue test now has a 4-minute limit (33 pages), and the Playwright web server a 180-second start limit.
- **Learning:**
  - SvelteKit 3's `goto` options are now `replace` and `reset` (`noScroll`/`keepFocus` are gone).
  - A component that renders an `h1` needs a heading-level prop if it also appears on catalogue pages.
- **Next:** AI groundwork (Phase 7). It needs the owner to run `wrangler login` and `wrangler d1 create ribbon`.

## 2026-11-20: Spec 002 AI groundwork (Phase 7) built

- `wrangler.jsonc`:
  - Workers AI binding `AI` (remote) and D1 binding `DB`;
  - the database is local only, with a placeholder id; spec 003 creates the real one at deploy;
  - no cloud resource created.
- `migrations/0001_ai.sql`: the data-model tables plus `ai_setting` (off switch and ceiling), applied locally. `preview` and `dev:remote` apply migrations first.
- Zod schemas for every `/api/ai/*` shape are in `packages/shared/src/ai`.
- Spend guard: 8,000 neurons/day by default, the UTC day resets it, and switching AI off blocks every AI call. It is unit-tested with an in-memory store.
- `MODELS` (model ids as config) with a neuron estimate per call.
- Operator page `/settings/ai`: on/off switch, today's use, and where content goes. `GET /api/ai/usage` and `PUT /api/ai/enabled`.
- Tests: e2e ai-off spec (every route opens with AI off; operator page passes axe); 104 web unit tests.
- **Learning:**
  - SvelteKit 3 exposes Cloudflare bindings through `import { env } from 'cloudflare:workers'`, emulated in `vite dev`. `event.platform.env` is not populated.
  - Running Prettier from `apps/web` on `packages/shared` without `--config` reformatted shared files in Prettier's default style. Shared has no Prettier config or lint script, so pass apps/web's config explicitly.
- **Next:** US4 Story so far (chapter summaries on Workers AI, recap assembly, eval).

## 2026-11-20: Spec 002 US4 server side: chapter summaries and recaps

- New endpoints:
  - `POST /api/ai/chapter-summary` (idempotent per book and chapter; the text is not stored);
  - `GET /api/ai/chapter-summary/[bookId]` (which chapters already have summaries);
  - `GET /api/ai/recap/[bookId]` (built only from summaries before the current chapter, cached per cut-off).
- First real Workers AI calls:
  - the planned model (`qwen3-30b-a3b`) was deprecated by Cloudflare today, so the defaults moved to `gemma-4-26b-a4b-it` and `bge-m3` (research R4 update);
  - Gemma's default reasoning used up the output budget; it is now switched off per call;
  - an empty chapter got a "Please provide the text" reply, so short sections are skipped and non-summary replies are never stored.
- Result: Moby Dick chapters 1–2 summarised accurately, and the recap stopped at the end of chapter 2. About 86 neurons in total.
- Tests: 109 web unit tests (cut-off and summary sanity).
- **Next:** the reader sends finished chapters (T049); then the Story so far sheet (T051), "Away N days" (T052) and the recap eval (T053).

## 2026-11-20: Spec 002 T049: the reader sends finished chapters

- A chapter is a contents entry, not a file section. Gutenberg EPUBs put many chapters in one file (Moby Dick chapters 8–12+ are all in section 2), so section-level summaries would be far too coarse.
- **How "finished" works:**
  - a chapter counts as finished when the reader moves from contents entry N to N+1; jumps don't count;
  - its text runs from its anchor to the next entry's anchor (foliate `book.resolveHref`);
  - the order number is the entry's position in the flattened contents, which is the recap cut-off.
- **Sending:**
  - chapters under 400 characters aren't sent;
  - offline or paused requests wait in a 12-entry local queue and are sent on the next chapter or reader visit;
  - with AI off they are dropped.
- **Verified in a browser:** paging through Moby Dick chapters 10–12 sent exactly those three chapters, and the stored summaries are accurate.
- **Accessibility gap fixed:** the reader had no keyboard page turning. Arrow keys and Page Up/Down now turn pages, including when focus is inside the book. There's an e2e test for it.
- **Flaky e2e start:** one run had all 13 tests fail because the preview server didn't start, while the dev server on :5199 was also using the local D1 state. The same tests passed on rerun. ASSUMPTION: a state lock; watch for a repeat.

## 2026-11-20: Spec 002 T051–T052: Story so far sheet

- `StorySoFar.svelte` on the Bits UI Sheet: from the right on wide screens and from the bottom on phones.
  - States: ready, writing, unavailable, too early, plus "No recap yet", per `design-mocks/index.html#recap`.
  - The footer stays pinned while the recap scrolls.
  - A catalogue page shows all four states; axe passes in every state in light and dark, at 390 and 1440.
- **Where it opens:**
  - Home: the "Away N days · Story so far" pill on ledger rows (7+ days away);
  - the reader: the footer link, with the cut-off at the current chapter.
  - Not on the book page: the approved book mock has no entry, so it is left for owner review.
- **AI off (FR-016):** the layout loads an AI-on flag, and the entry points hide when AI is off. The e2e ai-off spec checks Home and the reader.
- Recap endpoint:
  - without a chapter number it uses every stored summary; these exist only for chapters you finished, so they are already behind you;
  - "No recap yet" explains that recaps come from chapters finished in Ribbon;
  - the AI note now uses the approved mock copy.
- **Bug fixed:** sheet titles rendered in Inter, not Literata. `cn()` (tailwind-merge) treats `font-reading` and `font-title` as clashing and drops one. TextPanel and ContentsPanel had the same bug; all three now use a `.title-reading` class.
- Tests: 119 web unit tests; e2e ai-off, catalogue, a11y-smoke and home suites pass (14).
- **Open question for the owner:** for a book read mostly on Kobo, Ribbon has summaries only for chapters finished in Ribbon. The recap then covers only those chapters, while the cut-off line still names your place. Options: say how much the recap covers, or summarise the earlier chapters on demand when the recap opens (costs more neurons, still within the free tier).

## 2026-11-21: On-demand recap summaries (DR-0004)

- **Owner decisions:** summarise chapters not read in Ribbon on demand, then keep the cost down.
- **Tested:** five long chapters with full text, head only, head and tail, and spaced slices. Slicing cost 18–29% of full text but lost main plot beats, so chapters are always sent whole.
- **Built:**
  - a recap summarises the newest 40,000 words before your place, in whole chapters;
  - the sheet says what it covers and offers "Include earlier chapters" with its estimated cost;
  - on-demand summaries stop at 3,000 neurons per UTC day, reserved atomically on the server;
  - closing the sheet stops the work, and finished summaries are kept.
- **Cache fix:** the recap key now includes the summary count, so filling an earlier gap rebuilds it.
- **Sample data:** the Moby Dick position now uses a real contents link.
- **Checked:** typecheck, lint, unit tests, and targeted e2e runs for recap backfill (AI stubbed) and the catalogue.
- **Not checked:** a real Workers AI recap through the new flow, or "Include earlier chapters" clicked in a browser. The sample Moby Dick place is inside the 40,000-word window, so it doesn't show the coverage line.

## 2026-11-21: Author bios, photos and notable works (DR-0005)

- **Built:** author pages now show a Wikipedia bio, free-licensed photo with credit and licence, life dates, and Wikidata notable works marked against the library.
- **Coverage (67 sample authors):** 67 bios, 64 photos, 57 with notable works. Boethius, Laozi and Henry Seton Merriman have no photo.
- **Held back:** the full bibliography. About a third of 50 reviewed Open Library entries were wrong, and Wikidata's alternative is untested because its query service was rate-limiting.
- **Data fixes:** implausible Wikidata years are hidden, and Seneca is matched to Seneca the Younger.
- **Checked:** typecheck, targeted unit tests, all 67 author pages loading in a browser with their photos, and no sideways scroll at phone width on the page checked.
- **Long lists:** notable works show 12 entries, always including owned books, with a "Show all" control.
- **Not checked:** the full e2e suite. Real Calibre authors have no lookup yet; this is sample data until the mirror exists (spec 003).

## 2026-11-21: Recap quality check parked (T053)

- **Owner decision:** park recap work; it isn't worth more effort at this point.
- **Built:** `pnpm eval:recaps`, using the shipped window and prompts, with a resumable cache and a 6,000-neuron daily cap.
- **Result:** 10 of 20 recaps built before the cap. SC-004 is not met or judged. Two quality problems are recorded in DR-0004.
- **Hidden:** Story so far no longer appears on Home or in the reader, and the reader no longer sends finished chapters for AI summaries. The code stays behind `RECAPS_ENABLED`.

## 2026-11-21: Spec 002 T054: book profiles and embeddings

- **Built:** a text profile per book (title, author, genres, description), `bge-m3` embeddings in D1, and `POST /api/ai/jobs/embeddings`.
- **Behaviour:** only new or changed books are embedded, books that left the library are removed, and each run does at most 144 books inside the spend guard. Run it again while `remaining` is above 0.
- **Checked:** 10 unit tests, typecheck, lint, and a real Workers AI run with local D1: 96 sample books embedded for about 1 unit, then 0 on the second run.
- **Not checked:** suggestion quality. Only 1 of the 96 sample books has a description and all share one genre, so the vectors mostly reflect titles and authors. Check this on richer data in T055.
- **No UI yet:** the job has no button on the AI settings page.

## 2026-11-21: Spec 002 T055: suggestion engine

- **Built:** Read next and More like this in `suggest.ts`: series, Reading List, author, collection, then similarity, with reasons from templates only. Not yet reachable from an endpoint or the UI (T056, T057).
- **Real-library check:** with the owner's approval, Calibre metadata was read read-only and embedded through Workers AI in the owner's account, about 200 units. Book text was not sent. The data and results stayed in a local scratchpad and are not in this repo.
- **Fixes from that check:** a higher similarity cut-off, room for every rule, new authors from similarity, author spelling variants, and repeat records.
- **Limits:** the real library has no reading history yet, so Read next was only tried with simulated history. Some matches are still weak, and about a fifth of books get no More like this, which is better than claiming a weak match.
- **Checked:** 17 unit tests, typecheck and lint.

## 2026-11-22: Spec 002 T056: suggestion endpoints

- **Built:** `GET /api/ai/read-next`, `GET /api/ai/more-like/[bookId]`, and `POST`/`DELETE /api/ai/dismiss`. "Not now" lapses after 30 days, and "Never" lasts until undone. With AI off, the two suggestion reads return `ai_off`.
- **Risk found:** on 631 real books, Read next used about 70 ms of CPU including vector decoding. The Workers Free limit is 10 ms. Fixed in the next entry.
- **Checked:** 31 targeted unit tests, typecheck, ESLint, Prettier on the changed code, and all endpoints against the local dev server with sample data, including dismiss and undo.
- **Not checked:** the full e2e suite, or a deployed Worker. There is no UI yet (T057).

## 2026-11-22: Precomputed suggestion matches

- **Owner decision:** store each book's closest matches instead of paying for Workers or adding Vectorize (research R6).
- **Built:** `pnpm ai:neighbours`, which runs on the operator's machine, calls no AI model and writes only changed rows to the new `book_neighbours` table. Read next and More like this now load only the rows they need.
- **Measured in Node on 631 real books:** ranking fell from about 50 ms to about 2 ms for Read next, and from about 12 ms to under 1 ms for More like this. Results matched an unlimited comparison for all 631 books. Real data stayed in the scratchpad.
- **Checked:** 33 targeted unit tests, typecheck, ESLint, Prettier on the changed code, and both endpoints on the local dev server with sample data.
- **Not checked:** total CPU on a deployed Worker, or the full e2e suite. The script only targets local D1 until a production database exists.
- **Fix:** the script now reads the app's library source, so spec 003's switch reaches it, and it stops without changes if no stored embedding belongs to the current library.

## 2026-11-23: Spec 002 T057: Read next shelf

- **Built:** Read next on Home and More like this on book pages, from the approved design, with a catalogue page. Each book shows its reason and a menu for "Not now" or "Never suggest". The undo line stays until the owner leaves or acts again.
- **Hidden when empty:** with AI off, no suggestions, or no close matches, the section doesn't appear. In the sample data, Middlemarch has no close match, so its page shows none.
- **Test port:** Playwright now picks a free port and never reuses a running server, because a stale preview on port 4173 could have been tested instead of the current code.
- **Checked:** 5 shelf browser tests run twice on a production build, Home and AI-off browser tests on the dev server, typecheck, ESLint, Prettier on changed code, the Impeccable detector, and screenshots at desktop, phone and dark.
- **Not checked:** the full e2e suite, or a deployed Worker.
- **Test fix:** the AI-off browser tests switch AI off for the shared local database, which made two Read next tests fail when run alongside them. They now run alone, after the other browser tests. The shelf, Home and AI-off tests then passed, 15 of 15, on a production build.

## 2026-11-23: Spec 002 T058: genre suggestion job

- **Built:** `POST /api/ai/jobs/genres`. It suggests 1 to 3 genres per book from a fixed list of 41, inside the spend guard, up to 60 books per run. Run it again while `remaining` is above 0.
- **Rules:** removed genres never come back, Calibre tags aren't repeated, promoted genres are kept, and checked books aren't paid for twice. Nothing is written to Calibre.
- **Real model check:** 20 public-domain sample books with Gemma cost about 12.5 estimated neurons. Results went to an in-memory database. Most labels looked right, but *Mrs. Dalloway* was wrongly labelled Drama.
- **Not checked:** quality on the owner's real library, or the full e2e suite. Genres aren't visible until T059 and T060.

## 2026-11-23: Spec 002 T059: genre choices API

- **Built:** `GET` and `POST /api/ai/genres/[bookId]`, to list a book's genres and promote or remove one.
- **Rules:** suggested can be promoted or removed, promoted can be removed, and removed genres stay as tombstones. A genre already in Calibre can't be changed from Ribbon. Promotion only queues the change, and nothing touches Calibre until the CLI in spec 003.
- **Checked:** 14 genre unit tests, typecheck, ESLint, and promote, repeat, remove and a refused move through the real endpoints on local D1, with the test row removed afterwards.
- **Not checked:** the full e2e suite. There is no UI yet (T060).

## 2026-11-23: Spec 002 T060: genre chips and Genres tab

- **Built:** genre chips on the book page, the Genres tab, genre shelves, and a catalogue page, from the approved mocks. Calibre genres are solid. Suggestions are outlined with Promote and Remove, and promoted genres say "Waiting for sync".
- **Added to the approved design:** Undo after removing a genre, because the mock's one-click remove was otherwise permanent. A promoted genre returns as promoted.
- **Limit:** the sample data has no saved genres until the genre job runs, so the screens were checked with stubbed data. Nothing is written to Calibre until spec 003.
- **Checked:** genre unit tests, browser tests for genres, library, Read next and AI off on a production build, typecheck, ESLint, the Impeccable detector, and screenshots at desktop, phone and dark.
- **Not checked:** the full e2e suite.

## 2026-11-23: Ask your library parked

- **Owner decision:** park AI search (T061 to T063), because each question would have to be compared with every book and that is likely over the Workers Free CPU limit. FR-013 is not met while parked.
- **Changed:** the header now says "Search your library", so it doesn't promise a feature that is parked. The search page is still a placeholder.
- **Compared free fuzzy search:** PostgreSQL, SQLite FTS5 in D1, and MiniSearch in the browser, using the owner's metadata locally. Nothing was sent to a service, and no dependency was added to the project. Results are in research R6.

## 2026-11-23: MiniSearch feasibility check

- **Result:** MiniSearch suits Ribbon's library size, including on the owner's iPad. Details and limits are in research R6.
- **Not done:** no dependency was added and search is still parked until the owner approves it.
- **Not tested:** other Apple devices, Firefox results, or iPad service worker and persistent storage, which need HTTPS.

## 2026-11-23: Plain library search

- **Owner decision:** use MiniSearch in the browser (DR-0008). This is the one new dependency.
- **Built:** the `/search` page from the owner's edited design: one list with cover, title, author and which details matched, plus a no-results state. It searches titles, authors and tags and tolerates typos.
- **Changed from the draft:** the no-results hint no longer suggests "a few words about the book", because descriptions aren't searched.
- **Checked:** 7 unit tests, 15 browser tests on a production build including axe in light and dark at phone and desktop sizes, typecheck, ESLint, the Impeccable detector, and screenshots.
- **Not checked:** the full e2e suite, the page on the iPad itself, or offline search, which needs the catalogue stored on the device (spec 003 onward).

## 2026-11-23: Spec 002 T064: design compare

- **Built:** `pnpm design:compare`, which captures six pages beside their approved mocks at 390, 820 and 1440 px in light and dark, plus Night for the reader, with a review page in `apps/web/test-results/design-compare/`.
- **Stays fast:** it runs only when asked and is not part of build, tests, push or deploy. The repo has no Git hooks or CI. A full run took about 3 minutes, and one page took about 50 seconds, mostly starting the dev server. `--url` can reuse a running one.
- **Checked:** 39 of 39 pairs captured, a filtered retake kept the other pairs, typecheck and ESLint.
- **For the finish review (T066):** the reader opens Middlemarch at Chapter XXXIII at 38%, while the sample data and mock say Chapter 40.

## 2026-11-23: Spec 002 T065: accessibility matrix

- **Built:** `pnpm test:a11y`, 68 checks across every route at 390 and 1440 px in light and dark, Night for the reader, and the design catalogue in both themes.
- **Stays fast:** the owner chose to keep this on demand. The old catalogue scan moved out of `pnpm test:e2e`, so everyday runs are lighter. Each feature's spec keeps a quick axe check.
- **Found and fixed:** missing pages used SvelteKit's bare error page, with no main landmark. They now use Ribbon's error state and offer a way back to the library.
- **For the finish review (T066):** Library tabs ignore a tap made before the page becomes interactive. One test failed intermittently because of this, so it now waits. The product behaviour is unchanged.
- **Limits:** the matrix excludes the book's own text inside foliate's frame. Genre shelves need saved genres, so they are covered by `genres.spec.ts` and the catalogue instead.

## 2026-11-23: Spec 002 T066: finish review, first fixes (in progress)

- **Fixed from the review:** real Middlemarch places (Chapter 40 at 47%, Kobo at Chapter 41, 49%), a 570 px reader column, epigraph styling, the Home news block, heading sizes, Author and Book phone layouts, and Library tabs as real links.
- **Not changed:** Middlemarch still shows no More like this, because it has no close match in the sample and inventing one would make the reason untrue.
- **Also:** Playwright now writes to its own folder, because each run was deleting `design:compare` captures.
- **Checked:** 38 browser tests for Home, Library, reader, Read next and genres before the last reader change, then the 12 reader tests after it, plus unit tests and typecheck.
- **Still open from the reviewer's second pass:** saved mid-chapter resume under the top bar, the chapter heading size, a populated More like this capture, and a test for a tab tap before the page is interactive. T066 stays open until these are done and the owner signs off.

## 2026-11-23: Product name is Longshelf

- **Owner decision:** the product will be called Longshelf. Reasons and alternatives are in DR-0006.
- **Domains:** the owner registered `longshelf.app` for the hosted version and `longshelf.org` for the open-source project. Both sites will be specified separately.
- **Not done:** internal names (packages, database, CLI, repo) still say Ribbon.
- **Not checked:** official trademark registers. This must happen before a public launch.

## 2026-11-23: Longshelf logo and visible name

- **Built:** the Bookend logo (DR-0007), favicon, app and maskable icons, web manifest, theme colours, and the logo in the header. Visible text and page titles now say Longshelf.
- **Header:** tighter spacing on phones, and the logo alone on the narrowest screens, so the longer name fits.
- **Checked:** typecheck, formatting, ESLint, the catalogue test, all icon URLs on a production build, nested-route icon paths, and the header at 320 to 430px wide, light and dark.
- **Known failures:** the token-only test fails on `ReadNextShelf.svelte` and the author page, from styles this change did not touch. The home page also scrolls sideways at 320px because of its content below the header.
- **Not checked:** the full e2e suite, or installing the app on a real device.

## 2026-11-23: Token and narrow-phone fixes

- **Fixed:** Read next and the author page now use design tokens for shadows, focus rings and borders. The author page's animated arrow now changes instantly, as the design requires.
- **Fixed:** long book titles no longer make the home page scroll sideways at 320px. The narrowest phones get a smaller cover and title.
- **Checked:** all 192 unit tests, typecheck, formatting, ESLint on the changed files, and no sideways scroll at 320px on home, library, search, AI settings, book, author and shelf pages.
- **Not checked:** the full e2e suite, or a real device.

## 2026-11-23: Merged the Longshelf branch

- **Merged:** `redesign-impeccable-wt`, with the Longshelf name, Bookend logo, app icons and token fixes, into `redesign-impeccable`.
- **Resolved:** the search page keeps plain search with the Longshelf title, and both journals are kept. Two decisions had claimed DR-0006, so plain search is now DR-0008.
- **Still named Ribbon:** the repository, packages and internal identifiers, because DR-0006 makes the codebase rename a separate step.

## 2026-11-23: Spec 002 T066: finish review, second fixes

- **Owner decision:** the mock's small label above the reader's chapter heading stays removed, and the heading keeps its natural size and spacing. The reviewer's request to enlarge it is declined.
- **Fixed:** a saved mid-chapter place resumed with its first line about 20 px under the top bar. It now shows that line whole.
- **Added:** a browser test for a Library tab tapped before the page is interactive, a resume test, and a `book-similar` design-compare page showing More like this filled in.

## 2026-11-23: Spec 002 T066: owner sign-off

- **Result:** the finish reviewer returned `ship` with no material findings, and the owner signed off the design (SC-002).
- **Review limits:** no capture covered other Library tabs, the Aa and Contents panels, ⋯ menus, a solid Calibre genre chip, the expanded bibliography, or hover and focus states.
- **Not checked:** the full e2e suite and `pnpm test:a11y` after the Longshelf merge.

## 2026-11-23: Spec 002 T067: design system record

- **Built:** `apps/web/DESIGN.md` and its sidecar, written from the shipped Longshelf build. `docs/DESIGN.md` stays the architecture document.
- **Checked:** token parity, references, section order and Prettier. No page changed.
- **Left as known drift, not made into rules:** the uppercase "New" mark, the stock Sheet close button and shadow, two ⋯ menu styles, a few off-scale sizes and ink tints, the phone reader's default text size, and `PRODUCT.md` still saying Ribbon.

## 2026-11-23: Spec 002 closing (T068, T069)

- **Fixed:** slide-out panel close buttons now use the solid 3 px focus ring, checked in light and dark.
- **Closed:** spec 001's unbuilt component tasks are marked superseded, `docs/PLAN.md` is updated, and `design-mocks/` is marked as the approved reference.
- **Still open in spec 002:** T053 (Story so far quality) and T061 to T063 (AI search), both parked by the owner. FR-013 and SC-004 are not met.
- **Efficacy:**
  - **Time:** specified 2026-11-18, design signed off 2026-11-23, so 5 days. It is not deployed, so this is not idea-to-ship time.
  - **Reworks:** the finish review raised 8 material findings, then 4 on its second pass. Ten were fixed or covered by tests, one was closed by the owner, and one (inventing Middlemarch matches) was declined. Earlier live-review rounds were not counted.
  - **AI running cost:** recorded estimates total about 365 neurons, plus the T053 recap evaluation, which had a 6,000-per-day cap and no recorded total. Cloudflare's actual usage and bill were not checked. No production service is running yet.


## 2026-11-23: Internal rename to Longshelf

- **Renamed:** `@ribbon/*` packages, the root package, the planned CLI command, code comments, `PRODUCT.md`, `CLAUDE.md`, `docs/DESIGN.md`, `docs/PLAN.md` and the GitHub repository.
- **Kept:** the D1 name, `ribbon.*` browser storage keys, applied migrations, and historical records. DR-0006 records why.
- **Cloudflare:** checked read-only. No Longshelf or Ribbon Worker, D1 database or R2 bucket exists.

## 2026-11-23: Remaining Longshelf names

- **Renamed:** the local D1 database name and browser storage keys, because nothing is deployed. Reader settings saved locally under the old keys reset.
- **Fixed:** Prettier now ignores the generated `.eval/` output, so `pnpm lint` can pass.

## 2026-11-23: Local Calibre mode (DR-0009)

- **Built:** `pnpm dev:calibre` runs the dev server on the local Calibre library, read-only. Production builds still use sample data.
- **Limits:** AI is off in this mode, Calibre reading progress isn't shown yet, and the reader opens EPUB only.

## 2026-11-24: Magazine covers

- **Changed (owner request):** news and magazine issues show their own cover, with the date beneath. An issue without a cover keeps the plain binding from the approved mock.
- **Data:** `PeriodicalIssue` gains an optional `cover`. Local Calibre mode fills it from the issue's `cover.jpg`. Sample data has no issue covers, so it is unchanged.

## 2026-11-24: Spec 003 specified (library mirror)

- **Written:** `specs/003-library-mirror/spec.md`: upload command, the spec 002 screens on real data, owner-only access, installable app, and a repeatable deploy. Reading progress stays in specs 004 and 005.
- **Owner decisions:** upload every format (download-only where the reader can't open it), and AI on by default with a plain disclosure in Settings.
- **Sized against:** the owner's library on this date: 670 books, about 3.3 GB.
- **Planned (same day):** `specs/003-library-mirror/plan.md`, research R1–R10, data model, three contracts and a quickstart. DR-0010 (accepted by the owner) supersedes DESIGN.md on presigned uploads, normalised metadata tables and CI deploy.
- **Measured:** largest file 419 MB (two over the Worker's 100 MB request limit), covers 201 MB in total, catalogue 1.3 MB (475 KB gzipped).
- **Cost:** $0 a month expected. Risk: AI routes may exceed the Free plan's 10 ms CPU; measured in the first task before any fixed cost.
- **Tasks:** `specs/003-library-mirror/tasks.md`, 42 tasks. MVP is setup, foundation, US1 to US3; never deploy the real library before the access probe passes.

## 2026-11-24: Spec 003 T001–T002

- **Config:** the Worker is now named `longshelf`, with an R2 binding (`BUCKET`) and an Images binding (`IMAGES`). The D1 id is still the local placeholder until the first deploy.
- **Deploy:** `pnpm run deploy` builds, applies D1 migrations remotely and deploys. `.dev.vars` is ignored by git.

## 2026-11-24: Spec 003 T003 spike (in progress)

- **Created on Cloudflare (owner approved):** D1 `longshelf`, R2 bucket `longshelf`, Worker `longshelf` on workers.dev. It serves the sample library only, plus a temporary `/api/spike` route.
- **Results:** in `docs/PLAN.md` spike log. The Images binding works. Read next is too heavy for the Free plan's CPU limit, so the owner ruled it moves to the browser (T027 rewritten). The Access identity check waits for Access to be enabled.
- **Domain (owner):** the library is served only at `library.longshelf.app` (a custom domain in `wrangler.jsonc`). workers.dev and preview URLs are off, so Access on that hostname is the only way in. The bare `longshelf.app` stays free for a public page. Spec, plan, research R5 and quickstart updated.
- **T003 done:** Access works on `library.longshelf.app`. The owner's browser token carries an email, and the upload token carries its Client ID as `common_name`; Access needed a Service Auth policy for the token. T011 is rewritten to verify the Access token signature itself. The spike route and test data are removed and redeployed.

## 2026-11-24: Spec 003 T004–T008

- **Shared:** `Book` gains `sort` and `rating`. `bookSortKey` uses Calibre's title sort when present. New `MirrorCatalog` with `canonicalJson`, and the ingest Zod contract (`@longshelf/shared/ingest`).
- **CLI package:** `packages/sync-cli` now holds the Calibre reader, moved from the web app's local mode and extended with title sort, rating and every format's path. `pnpm dev:calibre` reads the owner's library as before (670 items).
- **CLI config (T018, done early):** `config.ts` (XDG or macOS path, mode 0600, option > env > file).
- **Dev and tests behind Access:** Access on the Worker also covers the remote connection that dev uses for Workers AI. Unit tests now run with no remote connections. `pnpm dev` passes Access with the CLI's service token, and applies local D1 migrations first, because the real D1 id gave dev a fresh local database.

## 2026-11-24: Spec 003 T009–T010

- **Test library:** `packages/sync-cli/test/fixtures/library/`, 4.8 MB, made with `calibredb`. It has 6 items: three EPUBs, one with EPUB plus PDF, one with no cover, and one news issue. Only public-domain texts and text written for the tests.
- **Migration:** `0004_mirror.sql` (`book`, `book_file`, `blob`, `catalog` with `previous_sha256`, `ingest_run`), applied locally. It reaches the live database at the next `pnpm run deploy`.

## 2026-11-24: Spec 003 T011–T012

- **Access check in the Worker:** `lib/server/mirror/access.ts` verifies the `Cf-Access-Jwt-Assertion` token with WebCrypto against the team's keys (RS256), checking `aud`, `iss` and expiry. An email means the owner; the configured `common_name` means the CLI. `gate.ts` lets only the CLI reach `/api/ingest/*` and only the owner reach everything else. With no valid token the response is 403, so it fails closed.
- **Hook:** `hooks.server.ts` applies the gate and sends `X-Robots-Tag: noindex, nofollow` on every response. `robots.txt` disallows everything.
- **Local runs:** `vite dev`, and the e2e preview (with `--var LONGSHELF_DEV_IDENTITY:1`), act as the owner on localhost only.
- **Secrets:** `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` and `CLI_CLIENT_ID` are set on the Worker. They were read from Access's own redirect and the CLI config, never printed. `.dev.vars.example` lists them.
- **Note:** SvelteKit 3 renamed `$app/environment` to `$app/env`.

## 2026-11-24: Spec 003 T013–T022 (US1 code)

- **Server:**
  - `lib/server/mirror/blobs.ts`: single uploads are hash-checked by R2. Multipart uploads are size-checked. Covers get a 400 px WebP thumbnail, quality 75, with no `blob` row because it shares the cover's hash.
  - `ingest.ts`: plan with the run lock, books, commit and abort, plus garbage collection that keeps the previous catalogue.
  - Routes under `/api/ingest/*`.
- **Contract change:** book records go up in batches of 100 to `/api/ingest/books`, and `commit` only removes books and publishes the catalogue. One 1.3 MB commit body would take longer than the Free plan's 10 ms of CPU just to parse. `plan` also returns `newBooks`.
- **CLI:** `longshelf library` (`library.ts`, `upload.ts`, `hash-cache.ts`, `report.ts`, `main.ts`) and `longshelf config set|show`.
- **Tests:** ingest tests run on a real local D1 and R2 through wrangler's `getPlatformProxy`, instead of adding `@cloudflare/vitest-pool-workers` (same miniflare engine, no new dependency). The CLI has 19 tests.
- **Fixed:** the e2e preview runs `wrangler dev --local-upstream localhost`. Otherwise wrangler rewrites the host to `library.longshelf.app` and the hook refuses the local identity. Dev and e2e pass Access to the remote AI binding with the CLI's token (`accessEnv()`).
- **T023 (US1 checkpoint):** the CLI was run on a copy of the test library against a local preview. First run: "Uploaded 6 books (4.0 MB)". Second: "Nothing changed". After a title edit in Calibre: "updated 1". Fixed along the way:
  - the hash cache didn't create its folder on a fresh machine;
  - SvelteKit refused PUTs with no content type as cross-site form posts, so the CLI now sends `application/octet-stream`;
  - the CLI blamed the upload key for any 403. It now does so only for the gate's or Access's refusal.

## 2026-11-24: Spec 003 T024–T025

- **Read routes:** `/api/catalog` (ETag, and 304 when unchanged), `/api/covers/:sha` (thumbnail first, `?size=full` for the original), and `/api/files/:sha` (Range support for the reader; `?download=` gives a safe RFC 6266 file name). All stream from R2, and a hash is served only as the kind it was stored as. 6 tests.

## 2026-11-24: Spec 003 T026

- **Screens on the mirror:** `#lib/library/index.ts` stays the one switch.
  - In a deployment (`LONGSHELF_LIBRARY=mirror`, set by `pnpm run deploy`), `library` is a lazy source. It fetches `/api/catalog` once and answers through the existing snapshot code, so none of its 19 importers changed.
  - The mirror build renders in the browser only. The sample build keeps server rendering, so e2e keeps its fixed data and its progressive-enhancement test.
- **Checked:** a mirror build on the T023 local data. Library shows the test books with covers and "Synced 7 min ago". Home shows the news cover. The reader opens Moby Dick from `/api/files` (HTTP 200). No page errors. 5 unit tests for the loader (format order, empty mirror, Access redirect, retry).

## 2026-11-24: Spec 003 T027

- **Read next and More like this in the browser (owner ruling):** in a deployment, `loadSuggestions` runs the spec 002 rules (moved to `#lib/ai/suggest.ts`, with the server path re-exporting) on the catalogue the browser holds. A new `/api/ai/suggestion-data` returns only stored matches for the seed books, known copies and dismissals, so the Worker loads no library. Sample and local modes still use the server routes, so e2e is unchanged.
- **Server book data:** `serverLibrary()` reads D1 `book` rows in a deployment (`book`, `allBooks`) and is the shared library elsewhere. Dismiss, genres and the two jobs use it.
- **Risk kept open:** the genre and embedding jobs still load every book in one request. They're owner-started and rare. Measure them on the real library before relying on them.

## 2026-11-24: Spec 003 T030, and T028/T029 decisions

- **T030:** Settings, under "Where your books go", now says that while AI is on, book details (titles, authors, descriptions) and some book text are sent to Workers AI. It's checked by a new e2e test with AI on. The text sits in the existing paragraph, with no layout change.
- **T029 (owner):** the mirror e2e is on demand (`pnpm test:e2e:mirror`), like `test:a11y`, so everyday e2e stays fast.
- **T028 (owner):** the "Save a copy" sketch (book page ⋯ menu, one item per format with its size) was not approved as is. The design is to be changed before building.
- e2e: 50 passed, 1 skipped, before the disclosure test moved. The moved test passes.
- **Owner request:** the public-domain test library becomes a public showcase library on its own subdomain, with books the owner picks to represent them. Planned for Phase 2 (spec 004) in `docs/PLAN.md`, with its needs listed. Not part of spec 003.

## 2026-11-24: Spec 003 T028 (Save a copy)

- **Design:** the owner rejected the first sketch, a ⋯ menu group with mixed type sizes. Three options were researched and rendered: a tidied menu, a Files row in Details, and a line under the actions. Sources: NN/g says hidden menu commands are less discoverable; Apple HIG says group with separators and use submenus sparingly; Material 3 uses one label style for menu items. The owner chose **B, a Files row in Details**.
- **Built:** each stored format links to its file with its size, saved as `Title - Author.ext`. Books with no EPUB or KEPUB get a plain "Can't be read here" line in place of the Read action. Checked on a mirror build: the PDF saved as "The King in Yellow - Robert W. Chambers.pdf".
- **Also fixed:** the T030 Settings paragraph had been committed without formatting, which failed `pnpm lint`.
- **Tests:** 370 unit tests; e2e 52 passed, 1 skipped; lint clean.

## 2026-11-24: OPDS spike started

- **Opened:** branch `opds-spike`, with questions and desk findings in `docs/PLAN.md` (Spike: OPDS).
- **Main finding so far:** OPDS on a stock Kobo needs KOReader. KOReader's Basic auth can't pass Cloudflare Access, so the feed needs its own route and auth. KOReader's own progress sync (kosync) is a possible Wi-Fi alternative to the USB and Calibre-columns path in spec 005.

## 2026-11-24: OPDS spike parked

- **Parked (owner decision):** OPDS and KOReader sync are a future nice-to-have, to be specced another time. The desk findings and open questions stay in `docs/PLAN.md`, and the item is listed under "Later, optional".

## 2026-11-24: Portable deployment parked

- **Parked (owner decision):** a Docker image others can install is a future idea, listed in `docs/PLAN.md` under "Later, optional" with the sketch, the case against, and the cost of waiting. Longshelf stays Cloudflare-only for now.

## 2026-11-24: Spec 003 T029

- **`pnpm test:e2e:mirror` (on demand, owner):** a mirror build. The real CLI uploads the test library, then 4 tests check Library with covers, the Files row and a saved file's name, the reader on a mirrored EPUB, and the news cover, with axe on Library and the book page. 4 passed. Everyday `pnpm test:e2e` is unchanged (53 tests, the mirror spec left out). Listed in `CLAUDE.md`.

## 2026-11-24: Spec 003 US3 (T031–T033), and the first real deploy

- **Deployed** the mirror build to `library.longshelf.app` (migration 0004 applied remotely). The real CLI uploaded the public-domain test library to the live mirror ("Uploaded 6 books (4.0 MB)"). A second run: "Nothing changed (checked 6 books in 2 s)".
- **T031 live access probe** (`pnpm --filter web test:access <url>`), all 17 checks passed:
  - Anonymous: every page, API and file route gets 302 to Access sign-in, with no library data.
  - The service token gets 403 on every browser route and 200 on ingest.
  - `X-Robots-Tag: noindex, nofollow` is present.
- **T032:** a refused upload key exits 2 with the `config set` steps. This was already built and tested in T020.
- **T033:** `docs/DEPLOY.md`, the full procedure: cost table with sources, resources, deploy, Access including the Service Auth policy and Worker secrets, rotating the key without a redeploy, the probe, and uploading. This is also the T037 draft.
- **CLI:** `pnpm longshelf …` from the repository root.

## 2026-11-24: Spec 003 US4 (T034–T036)

- **Service worker** (`src/service-worker.ts`, SvelteKit's own, with SvelteKit 3's `$app/manifest`, `$app/env` and `$app/service-worker`):
  - The shell is precached per version, leaving out the sample data.
  - Covers are cache-first, the catalogue network-first with the cached copy as fallback, and pages network-first with the cached start page offline.
  - Book files, AI and ingest are never cached.
  - A new version takes over on the next open, never mid-read.
- **Sign in again:** when Access redirects the catalogue fetch, the worker serves the cached copy marked `sign-in`, and the header shows a "Sign in again" link that reloads into Access. Offline shows "Offline". The manifest already had `crossorigin="use-credentials"`.
- **T036:** a mirror e2e test opens Library, goes offline, reloads, and sees the shell, a loaded cover and "Offline". Mirror e2e: 5 passed. Everyday e2e: 51 passed plus the disclosure test, which was fixed after Prettier re-wrapped its text. 370 unit tests pass.
- **Owner:** the tests are too slow. T043 is added to optimise them next.

## 2026-11-24: Spec 003 T043, faster tests (owner: "tests are way too slow")

| Suite | Before | After | What changed |
|---|---|---|---|
| `pnpm test:e2e` | 5.4 min | 3.4 min | `fullyParallel` with 6 workers, so single tests are spread out instead of whole files (genres alone was about 55 s in a row); `wrangler dev --local`, so no remote AI proxy and no Access token needed; `scripts/build-if-changed.ts` reuses an identical build instead of spending about 50 s rebuilding |
| `pnpm test:e2e:mirror` | 1.8 min | 1.6 min | the same, though the mirror and sample builds invalidate each other |
| unit tests (all packages) | about 42 s | unchanged | measured: the start-up cost is module imports, not Tailwind or the pool. The floor is the 10 s ingest file (local D1/R2 calls). No cheap win |

- **Stability:** under 6 workers, a hydration-driven redirect needed more than the 5 s expect default, so it is raised to 10 s. Two full runs passed (52 passed, 1 skipped).
- **Build reuse is safe:** the stamp sits in `.svelte-kit/cloudflare`, which the adapter deletes on every build, so a deploy build always forces e2e to rebuild.
- **Still slow:** each e2e test spends most of its time loading pages from one local Worker. The next step would be fewer full-library page loads per test, which means test-by-test changes. Not done.

## 2026-11-24: Spec 003 US5 (T037–T038)

- **T037:** `docs/DEPLOY.md` is complete. There is a new root `README.md` (there was none, and the repository is public), linking deploy, design, plan and decisions.
- **T038 on the live deployment:**
  - `pnpm run deploy` twice: both said "No migrations to apply" and deployed cleanly (versions `9083b943`, then `a8a0b55e`). FR-023.
  - A Worker that throws at start-up was rejected by Cloudflare at upload (error 10021). The live site kept serving `a8a0b55e`, and its upload route still answered from the real Worker. FR-024.

## 2026-11-24: Spec 003 T040–T041

- **T040 (SC-008):** a CLI test copies the test library, runs a full dry run through the real code, and checks every file's hash and modification time is unchanged.
- **T041:** `docs/DESIGN.md` now describes what was built (the CLI flow, D1 row per book, the catalogue document, browser-only rendering and suggestions, Access verified in the Worker, the service worker). The "see DR-0010" banner is gone. `docs/PLAN.md` Phase 1 is ticked, except the real-library upload.

## 2026-11-24: Showcase collection research (authors of African descent)

- **DR-0011 (owner):** the showcase follows the US public-domain rule. Standard Ebooks and Gutenberg books are accepted on those sites' own copyright checks. Other sources are accepted only if first published in 1930 or earlier.
- **`docs/showcase/african-descent.md`:** 240 authors searched; 175 have at least one digital copy.
  - 520 cleared books: 62 on Standard Ebooks, 458 on Gutenberg.
  - 866 archive.org leads still to check.
  - Every book is listed in `african-descent-candidates.csv`.
- **Gaps:**
  - DocSouth refused connections, so its slave narratives need a manual search.
  - Authors writing in French, Portuguese and African languages are under-covered.
  - 65 authors have nothing found yet; their search links are in the doc.
- **Next:** the owner picks the first books from the cleared list.

## 2026-11-24: Spec 003 T039, first attempt failed, upload fixed

- **Dry run on the real library:** 670 books, would upload 3.2 GB and remove the 6 test books (74 s, mostly hashing).
- **First real run failed** after 298 s with "fetch failed", having stored nothing new. The lock was released correctly.
- **Cause, measured:** uploads through the Worker ran at 5–10 Mbit/s per stream (50 MB parts took 42 s and 86 s), against 58 Mbit/s raw upload to Cloudflare. A 95 MB single request with another upload in parallel ran past Node's 300 s response wait (undici `headersTimeout`).
- **Fix:**
  - single uploads up to 20 MB, larger files in 10 MB parts (R2's minimum is 5 MiB), so every request finishes in seconds;
  - network failures and 5xx answers are retried 3 times with growing pauses, which is safe because objects are content-addressed;
  - 4 uploads at a time;
  - a network failure now names its cause and the request.
  - 29 CLI tests, including retry tests. Redeployed. Research R1, the contracts and DESIGN updated.
- **Also fixed:** two Prettier runs had used Prettier's defaults instead of the project config on `packages/` (Prettier in `pnpm lint` only covers `apps/web`), which left `calibre-untouched.test.ts` committed with the wrong style. All are reformatted with the project config.

## 2026-11-24: Spec 003 T039, the real library is online

- **Upload:** "Uploaded 670 books (3.2 GB), updated 0, removed 6. 0 problems" in **38.4 min** (2,305 s). SC-001 is under 1 hour. The upload link was 58 Mbit/s raw, but the effective rate through the Worker was about 11 Mbit/s.
- **Re-run:** "Nothing changed (checked 670 books in 5 s)", **6.4 s** wall. SC-002 is under 30 s.
- **Live D1:**
  - 670 books, 39 of them news, and the catalogue has 670.
  - 714 files, including both over 100 MB (the largest is 418 MB) via multipart.
  - 0 orphaned files, 0 locks.
- **Access probe re-run with real data:** all checks passed.
- **Open:** SC-003 (first covers within 3 s on a phone over 4G) needs the owner's phone.

## 2026-11-24: Spec 003, offline fix after the owner's phone check

- **Owner's phone check:** reading, saving and installing worked. But the header never said "Offline", and reopening the installed app offline showed the browser's own blocking offline screen.
- **Cause:** SvelteKit 3's `$app/manifest` lists paths without a leading slash (`_app/immutable/…`), while requests arrive as `/_app/immutable/…`. The service worker never served the app's code from its cache, so the app couldn't start offline. The sample-data filter didn't match either. The T036 test missed it because it reloaded the same tab, where Playwright's memory cache supplied the code.
- **Fix:** paths are normalised to a leading slash. The header now also turns to "Offline" the moment the connection drops, through the `online`/`offline` events, not only at the next load.
- **Test made real:** it reopens offline in a new tab, checks every `/_app/immutable/` response came from the service worker, and looks for "Offline" in the header (banner). Without the fix it fails, and with it it passes. Mirror e2e 5 passed; everyday e2e 52 passed; lint clean. Deployed.

## 2026-11-25: Spec 003 SC-003, covers on the owner's phone

- **How:** owner's phone (Galaxy S24, Android 17, Chrome 158) over wireless debugging, driven by Playwright over CDP. Wireless debugging needs Wi-Fi, so 4G was **simulated** with Chrome's network throttling (Fast 4G: 9 Mbit/s, 165 ms; Slow 4G: 1.44 Mbit/s, 563 ms). Real phone, browser and live site; simulated network. The clock runs from navigation start until every cover in the first screen (6 covers) has loaded. 3 runs each; medians below.

| Network | Warm (installed app, cached) | Cold (first ever visit, no cache, no SW) |
|---|---|---|
| Fast 4G | **1.3 s** (1.26 to 1.43) | **3.0 s** (2.84 to 3.61) |
| Slow 4G | **2.5 s** (2.49 to 2.59) | **10.6 s** (10.5 to 11.0) |

- **Verdict:** SC-003 passes for opening Library, which is the installed app with its cache, on both profiles. A first-ever visit passes on Fast 4G (median) and fails on Slow 4G.
- **Why the cold Slow 4G is slow:** a first visit fetches the catalogue (1.4 MB uncompressed), the Literata font (387 KB) and 52 code chunks (287 KB uncompressed). At 563 ms per round trip, the request count matters as much as the bytes.
- **Research R2 (descriptions out of the catalogue) not opened:** it would shrink only one of those three, and only for a one-off first visit. Revisit if a cold first visit on a slow link becomes a real use.
- **Also seen:** the page loads Cloudflare's Web Analytics beacon (`/cdn-cgi/rum`), injected by Cloudflare and not by our code. Nothing in the docs mentions it.

## 2026-11-25: Spec 003 closed (T042)

- **Checks:** `pnpm lint` clean, `pnpm typecheck` 0 errors, `pnpm test` 374 passed (102 + 26 + 246), `pnpm test:e2e` 52 passed, 1 skipped.
- **Quickstart steps not yet run, now run** on a local mirror preview with throwaway storage and a copy of the test library, so the live mirror was not touched:
  - **FR-007 failed first.** A Ctrl-C 1.2 s into the first upload left the upload lock held. The re-run was refused with "Another upload is running" (exit 3) and would have stayed refused for 2 hours. **Cause:** Ctrl-C arrived while the plan request was still waiting for an answer. The CLI didn't know the run id yet, so it quit without releasing anything, and then the server took the lock. **Fix:** the CLI gets the pending run id as soon as the plan request goes out, and on Ctrl-C it waits for it (up to 15 s; a second Ctrl-C quits at once) and then releases the lock. A new test, `interrupt.test.ts`, fails without the fix and passes with it. After the fix, the same interrupt was followed by "Uploaded 6 books" and then "Nothing changed". CLI tests: 27.
  - **FR-006 passes.** Pointed at an empty Calibre library, the CLI lists all 6 books and asks "Remove these 6 books from the mirror? [y/N]". On "n" it says "Nothing changed: the removals were not confirmed" (exit 4), and the next normal run says "Nothing changed". Without a terminal it refuses removals without asking.
  - Already recorded earlier: costs and resources (T033), access (T031), upload and re-run (T023, T031), phone (2026-11-24, SC-003 above), FR-024 (T038), SC-008 (T040).
- **Cloudflare Web Analytics:** the owner keeps it on for now. Cloudflare injects its beacon (`/cdn-cgi/rum`) into every page; our code doesn't load it. It is disclosed here; revisit it before anyone but the owner uses a deployment.
- **Efficacy:**
  - **Time:** spec written 2026-11-24, real library online the same day, closed 2026-11-25, so 2 days from spec to a deployed, used mirror.
  - **Reworks after implementation:** 4.
    - Uploads of the real library failed on large files and flaky links; fixed with smaller parts and retries (T039).
    - The app did not reopen offline on the owner's phone; the T036 test had passed through Playwright's memory cache.
    - The Ctrl-C lock bug above.
    - Two Prettier runs used defaults instead of the project config. It nearly happened again here: `apps/web/prettier.config.js` is the config, and there is no `.prettierrc`.
  - **Actual Cloudflare usage**, dashboard and `wrangler d1 info`, last 24 hours on 2026-11-25. That day included the SC-003 runs and 5 deploys.
    - **Worker:** 2,050 invocations and 1,070 asset requests (92% from cache), 0 errors. The free allowance is 100,000 requests a day.
    - **D1:** 2.52 MB stored, 40,322 rows read and 6,352 written. The free allowance is 5 M read and 100 k written a day, and 500 MB.
    - **R2:** about 3.2 GB stored, taken from our own D1 records rather than the dashboard. The free allowance is 10 GB-month.
    - Allowances: `docs/DEPLOY.md` cost table, read 2026-11-24.
    - **Bill:** £0. R2 storage is the nearest limit, at about a third of the allowance.

## 2026-11-25: Showcase research, DocSouth recovered from the Wayback Machine

- **DocSouth was archived on 2026-03-30** and the live host refuses connections. Its four bulk ZIPs (text, TEI/XML and a contents CSV) are intact in the Wayback Machine. The licence is CC BY 4.0, with credit to the UNC library.
- **Matched 711 titles** with `docs/showcase/scripts/docsouth.py`:
  - 37 new cleared books for seed authors; 10 authors move off the "nothing found" list;
  - 215 leads by authors not on the seed list.
- **Totals now:** 557 cleared and 1,081 leads, for 185 of 240 authors. `docs/showcase/african-descent.md` has a DocSouth section with the Wayback links.

## 2026-11-25: Showcase list keeps author-only books

- **Owner rule:** a book counts only if the person is its author.
- Dropped 44 Gutenberg rows where the person was editor, contributor, translator, compiler, commentator, introduction writer or "dubious author". Examples: *The Negro Problem* essays, Braithwaite's anthologies, Booker T. Washington's introductions. `combine.py` now skips these rows.
- **Cleared books:** 513 (62 Standard Ebooks, 414 Gutenberg, 37 DocSouth). This is still 185 of 240 authors.
- **Dumas (père):** 167 of the Gutenberg books, many of them editions of the same novels. Pick one edition per novel.
- **archive.org leads** can't show the person's role, so each one is checked by hand.

## 2026-11-25: Showcase becomes a complete catalogue

- **Owner direction:** keep every book by these authors.
  - Public-domain books are hosted.
  - In-copyright books link to legal ebook stores.
  - Each 1 January, the newly public-domain books are added.
- Recorded in `docs/PLAN.md` Phase 2, with open questions for its spec: which stores, whether links earn money (disclosed if so), and how the yearly batch runs.
- **HathiTrust:** the catalogue search is behind Cloudflare's bot check, but the full Hathifile (1.2 GB, every volume with a rights code) downloads directly. Matching is in progress.

## 2026-11-25: GitHub checks and PR previews (DR-0012)

- **Why:** there was no CI, and the only way to try a change on Cloudflare was production.
- **Checks:** `.github/workflows/ci.yml` runs lint, typecheck, unit tests and the mirror build on every pull request and push to `main`. Playwright and the accessibility matrix stay on demand.
- **Previews:** Cloudflare Worker Previews (open beta), not version URLs, because version URLs run on production D1 and R2. Each pull request gets `pr-<N>`; `preview-cleanup.yml` deletes it on close.
  - Separate data: D1 `longshelf-preview` (4 migrations applied) and R2 `longshelf-preview`, to be seeded with the test library.
  - A trial `wrangler preview` from the laptop deployed with the preview bindings but returned no URL while `preview_urls` was off. It is now `true` in `wrangler.jsonc`, waiting for the owner to apply it.
- **Owner setup left:** API token, GitHub secrets, Access app for previews, preview secrets, seed (`docs/DEPLOY.md` section 7).

## 2026-11-25: Showcase stays public domain only

- **Owner:** the showcase lists and hosts only public-domain books; there are no store links for in-copyright books. This replaces the "complete catalogue" entry above. `docs/PLAN.md` is updated.
- **Annual batch stays:** each 1 January, books entering the US public domain are added.
- **`hathi.py`** now keeps only HathiTrust records with rights `pd` or `pdus`. It has not been run yet.

## 2026-11-25: HathiTrust added (public domain only)

- **Source:** the full Hathifile (1 Nov 2026, 1.2 GB), matched with `docs/showcase/scripts/hathi.py`, which keeps only `pd` and `pdus` records. A first, looser pass took in other people with the same name (Samuel Johnson the English writer, President John Quincy Adams). The rule is now:
  - match the author's known birth or death year, or else a full three-part name;
  - authors who came only from DocSouth are left out.
- **Matched:** 3,198 public-domain records across 110 authors. 1,381 were already listed from other sources.
  - Dropped 123 John Brown records (the Scottish doctor) and 106 edited books.
  - Added 1,572 cleared books, plus 16 possible sheet-music titles as leads.
- **Totals:** 2,085 cleared books and 1,097 leads. 187 of 240 authors now have a copy; Duse Mohamed Ali and Plácido are newly found.
- **Format:** the HathiTrust books are page scans and need OCR text or an EPUB.

## 2026-11-25: PR previews live (DR-0012)

- **PR #1** has a working preview at `pr-1-longshelf.berealshakil.workers.dev`, seeded with the 6-book test library (2.9 MB). `test:access` passes on the preview and on production.
- **CI on GitHub:** install, lint, typecheck, unit tests, build, preview migrate, deploy, comment: all green.
- **First CI runs found two clean-checkout bugs**, both fixed: lint needs the generated `tokens.css`, and the generator didn't create its folder.
- **No second Access app:** the Worker's All traffic app already covers previews and version URLs (same AUD in the sign-in redirect).
- **Gotchas:**
  - Preview base-config secrets apply only to previews created after they are set; `pr-1` needed `wrangler preview secret bulk`.
  - A seed attempt during the secrets rollout took the upload lock and then failed. Cleared on the preview D1.
  - On workers.dev, Cloudflare sends `X-Robots-Tag: noindex` instead of the Worker's `noindex, nofollow`. `test:access` accepts that on workers.dev only.
  - One of three `test:access` runs on the preview failed without a captured cause; the next two passed.

## 2026-11-25: Spec 004 specified (reading offline and across devices)

- **Scope:** download books for offline reading, sync the reading place between devices (offline places queue and send later), and a storage page. Spec 003 already covers reading online and the offline library list, so they aren't repeated.
- **Owner ruling (FR-009):** opening a book that another device read further goes straight there, unless both devices moved since they last synced; then it offers the jump, like the Kobo notice.
- **Left out:** the public showcase (its own spec), Kobo progress (spec 005), finished status, highlights.
- New screens get mocks for approval before code (FR-017).

## 2026-11-25: Spec 004 planned (DR-0013 proposed)

- **Downloads:** Cache Storage (`books-v1`), keyed by the file's content-addressed URL and served by the service worker, so the reader needs no change. OPFS (DESIGN.md's plan) is kept as the fallback if spike T001 finds `cache.put` can leave partial entries.
- **Places:** the existing per-book localStorage place gains `readAt` and `syncedAt`. Latest-wins means one pending place per book, so no Dexie. On the mirror: a `reading_place` table with `GET`/`PUT /api/progress`.
- **Spec wording:** FR-010 and SC-003 now ask for the latest place per book, not every intermediate one (research R4).
- **Unchanged:** no new dependencies; expected cost £0.
- **Next:** `/speckit-tasks`; mocks of the new screens before any UI code.
- **Tasks:** 30 in `specs/004-reading/tasks.md`. DR-0013 accepted by the owner. MVP is US1 (offline reading), on its own PR.

## 2026-11-25: Spec 004 T001 spike, Cache Storage confirmed

- A download whose body fails halfway leaves nothing in Cache Storage in Chromium (`NetworkError`) or WebKit (`TypeError`), so DR-0013's choice holds for Android and iPhone. Firefox wouldn't launch on this OS.
- foliate-js fetches a book whole (no `Range`), so a cached full response is all the reader needs.
- T002 (phone `persist()` check) folded into the preview check: the storage page shows it.
- Installed Playwright WebKit and Firefox locally; WebKit needed `libavif16` (owner installed it).
- **T003 mocks approved** (owner, 2026-11-25): `design-mocks/offline-states.html` (Download button's 7 states, ✓ on downloaded covers, offline line, offline reader message, device notice) and `design-mocks/storage.html`. Build note: keep chapter and percent in the device notice on phones.
- **T003 mocks approved** (owner, 2026-11-25): `design-mocks/offline-states.html` (Download button's 7 states, ✓ on downloaded covers, offline line, offline reader message, device notice) and `design-mocks/storage.html`. Build note: keep chapter and percent in the device notice on phones.
- **Phase 2 (T004–T006):** shared `progress.ts` schemas with the 5-minute clock clamp; `lib/offline/device.ts` (id + name from the browser, renamable); the saved place gains `readAt`/`syncedAt`/percent/furthest, upgrades spec 002 entries, and never moves back (two-tab rule). Opening a book no longer counts as moving (FR-009). Web places send chapter `fraction` 0; the CFI is the exact place.

## 2026-11-25: Spec 004 US1 and storage page built

- **Downloads (US1):** `lib/offline/downloads.ts` keeps a book in Cache Storage `books-v1`; the service worker answers `/api/files/*` and `/sample/books/*` from it. The book page's Download button has the 7 approved states; covers show ✓; the library shows "Offline. Books marked ✓…"; the reader shows "<title> isn't on this device" offline instead of an error. A downloaded copy is read even online until Update (FR-004, FR-007). A book that left the library still opens from its download.
- **Storage page (US3, T025):** `/settings/storage`, as the approved mock. Reached from the book page's More menu ("Downloads on this device") and the no-space message, since nothing links to settings yet.
- **Tests:** 15 unit tests for downloads (partial body, size mismatch, quota, offline, update keeps the old copy until the new one is stored); the FR-016 smoke test passes in the full e2e run (53 passed).
- **Known limit (spec 003 behaviour):** offline, a full page load of a deep address gets the cached start page; moving around inside the app works. The installed app always starts at Home, so reading offline works as intended.
- **Found by the checks:** the token-only rule (no raw radius, no transitions) and the catalogue rule (every component has a design page): added `design/download-button` and `design/offline-note`.

## 2026-11-28: Spec 004 approved; the app starts offline

- **T028:** the owner approved spec 004 on their devices. Left: deploy (T030).
- **Owner's report:** offline, the app was blocked entirely on startup. Two causes, both on a mirror build:
  - The cached start page used relative asset paths (`./_app/…`). Served for a deeper address offline, such as a book page or the reader, they resolved under it and the screen stayed blank. Fixed with `paths.relative: false`. This also removes the 2026-11-25 known limit: a full load of any address now works offline.
  - On a weak signal, requests don't fail, they just never answer, and the service worker and layout waited on them with no limit. Now the network gets 2 seconds before the saved copy answers, and a slow answer still finishes and is kept for next time. The AI check is skipped offline and limited to 3 seconds; reading places to 4. Layout data loads side by side.
- **Measured:** with every request hanging, Home, Library and a book page open in under 7 seconds (before: never).
- **Test:** `pnpm test:e2e:mirror` gains "the app starts offline and on a weak signal, at any page".
- **Still open:** the owner finds offline navigation and viewing saved content poor in general. Specifics to gather before any design.
