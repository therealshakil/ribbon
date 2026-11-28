---
name: Longshelf
description: A private, calm reading home for a Calibre library.
colors:
  bg: 'oklch(0.976 0.003 106)'
  surface: 'oklch(0.940 0.004 91)'
  raised: 'oklch(0.986 0.002 90)'
  ink: 'oklch(0.214 0.002 68)'
  text: 'oklch(0.314 0.008 85)'
  text-muted: 'oklch(0.491 0.011 78)'
  border: 'oklch(0.894 0.008 91)'
  control: 'oklch(0.600 0.011 82)'
  accent: 'oklch(0.413 0.106 13)'
  accent-surface: 'oklch(0.934 0.012 17)'
  action: 'oklch(0.235 0.004 85)'
  on-accent: 'oklch(0.982 0.003 85)'
  focus: 'oklch(0.413 0.106 13)'
typography:
  display:
    fontFamily: 'Literata, Georgia, serif'
    fontSize: 'clamp(2rem, 1.4rem + 1.8vw, 3rem)'
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: '-0.015em'
  page:
    fontFamily: 'Literata, Georgia, serif'
    fontSize: '2.25rem'
    fontWeight: 600
    lineHeight: 1.1
  heading:
    fontFamily: 'Literata, Georgia, serif'
    fontSize: '1.75rem'
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: 'Literata, Georgia, serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.25
  reading:
    fontFamily: 'Literata, Georgia, serif'
    fontSize: '1.25rem'
    fontWeight: 400
    lineHeight: 1.7
    fontFeature: 'onum'
  body:
    fontFamily: 'Atkinson Hyperlegible Next, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Atkinson Hyperlegible Next, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: 'Atkinson Hyperlegible Next, system-ui, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 400
    lineHeight: 1.5
rounded:
  cover: '0.125rem'
  sm: '0.375rem'
  md: '0.75rem'
  pill: '999rem'
spacing:
  '1': '0.25rem'
  '2': '0.5rem'
  '3': '0.75rem'
  '4': '1rem'
  '6': '1.5rem'
  '8': '2rem'
  '12': '3rem'
  '16': '4rem'
components:
  button-primary:
    backgroundColor: '{colors.action}'
    textColor: '{colors.on-accent}'
    rounded: '{rounded.pill}'
    padding: '0.65rem 1.4rem'
    height: '2.75rem'
  button-primary-hover:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-accent}'
  button-outline:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.pill}'
    padding: '0 1.1rem'
    height: '2.75rem'
  button-icon:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.pill}'
    size: '2.75rem'
  input-search:
    backgroundColor: '{colors.raised}'
    textColor: '{colors.text}'
    rounded: '{rounded.pill}'
    padding: '0 1rem'
    height: '2.75rem'
  chip-calibre:
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '1rem'
    padding: '0.25rem 0.8rem'
    height: '2rem'
  chip-suggested:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '1rem'
    padding: '0.25rem 0.3rem 0.25rem 0.8rem'
    height: '2rem'
  segmented-selected:
    backgroundColor: '{colors.action}'
    textColor: '{colors.on-accent}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '0.35rem 0.9rem'
    height: '2.25rem'
---

# Design System: Longshelf

## Overview

**Creative North Star: "The Bedside Page"**

Longshelf is a reading place before it is an application. The current book leads, the other books follow as a quiet ledger, and the interface recedes once a page is open. Neutral grained paper, near-black ink and a single oxblood accent carry every screen, so the same place looks and behaves the same on a phone, a tablet and a laptop.

Literata gives titles and book text the voice of a printed book. Atkinson Hyperlegible Next handles the apparatus: labels, metadata, controls and progress. Structure comes from hairline rules, alignment and space. Book covers are the only objects that lift from the paper.

The system serves one neurodivergent owner in long, often low-light sessions. Stillness, plain words, visible focus and predictable placement are design materials here. The product name is Longshelf and the mark is the Bookend; the code's `--r-` token prefix remains from the working name until the separate codebase rename.

**Key Characteristics:**

- Paper, ink and one oxblood accent, in light, dark and Night.
- Literata for titles and reading; Atkinson Hyperlegible Next for apparatus.
- Hairlines and space instead of content cards.
- Covers carry the only soft shadows.
- State changes are instant, except the reader bars the owner summons.
- Every saved place is visible, and another device's place is offered, never applied silently.

## Colors

A warm, almost colorless paper-and-ink palette, with one oxblood voice for place, links and current state. Light values are normative in the frontmatter; dark and Night values live in the generated `tokens.css` and the sidecar. Always use the semantic token, because each one changes with the theme.

### Primary

- **Oxblood** (`accent`): progress fills and percentages, links, current navigation, read status, recommendation reasons, the Bookend's book, text selection and hover on primary actions.
- **Oxblood Wash** (`accent-surface`): the small hover and current-item tint on suggested-genre controls and lists.
- **Focus Oxblood** (`focus`): the 3px focus ring. It matches the accent in every theme.

### Neutral

- **Grained Paper** (`bg`): the page, always under the fine paper grain except in Night.
- **Shaded Paper** (`surface`): cover placeholders, quiet status panels and highlighted menu items.
- **Raised Paper** (`raised`): the search field, menus and sheets.
- **Ink** (`ink`): titles, headings and icons.
- **Body Ink** (`text`): running text and table values.
- **Faded Ink** (`text-muted`): authors, secondary metadata and inactive navigation.
- **Hairline** (`border`): rules, row dividers and empty progress tracks.
- **Control Grey** (`control`): control outlines, the other device's progress and unavailable rail letters.
- **Action Black** (`action`): primary action fills and selected segments.
- **Paper on Action** (`on-accent`): text and icons on action or accent fills.

### Named Rules

**The One Oxblood Rule.** Oxblood means your place, a way onward, or the current state. Never use it as decoration, and never add a second accent.

**The Other Device Is Grey Rule.** This device's progress is oxblood. Another device's progress is a neutral bar or tick, so the two places can never be confused.

**The Night Is Quieter Rule.** Night removes the grain and lowers contrast from pure white while keeping reading text comfortably legible. Do not add texture or bright fills to it.

## Typography

**Display Font:** Literata (with Georgia, serif)
**Body Font:** Atkinson Hyperlegible Next (with system-ui, sans-serif)

**Character:** Literata is a book face commissioned for e-reading and gives titles a quiet literary weight. Atkinson is plain, highly distinguishable and stays out of the way. Both are self-hosted so the app keeps its voice offline.

### Hierarchy

- **Display** (600, fluid 2rem to 3rem, 1.05): the current book on Home and a book's title on its page. One per page.
- **Page** (600, 2.25rem, 1.1): Library, author and shelf page titles.
- **Heading** (600, 1.75rem, 1.25): major Home sections such as Read next.
- **Title** (600, 1.5rem, 1.25): ledger book titles and the wordmark.
- **Reading** (400, 1.25rem default, 1.7): book text in Literata with old-style figures, ragged right, no automatic hyphenation, first-line indents and no paragraph gaps. The owner can change size, font, spacing and margins.
- **Body** (400, 1rem, 1.5): interface prose, capped at 66ch.
- **Label** (400 or 650, 0.875rem, 1.5): controls, chips and compact values.
- **Meta** (400 or 650, 0.8125rem, 1.5): device progress, table terms, notes and read status. Never body text.

### Named Rules

**The Two Voices Rule.** Book names and titles speak in Literata. Controls and data speak in Atkinson.

**The Weight For Emphasis Rule.** Interface emphasis uses weight (650), not italics or underline. Italics belong to the book's own typography, such as epigraphs and verse.

**The Natural Chapter Rule.** A chapter heading keeps the book's natural size and spacing, in Literata at weight 500 and line height 1.15. The reader adds no label above it.

**The Tabular Progress Rule.** Percentages and counts in the interface use tabular figures so they do not jitter between rows.

## Layout

Pages sit in a centered column up to 90rem wide, with a fluid side gutter from 1rem to 3.5rem. Spacing draws on a 0.25rem-based scale, with larger gaps separating page sections and hairlines marking the major divisions.

Home runs in reading order: the current book as a spread (a 15rem cover beside its title, place table and Continue reading), the Also reading ledger, Read next, then latest news and magazines. Library keeps six tabs in a fixed order. Book grids use six columns on wide Home shelves and four below 64rem; at 40rem they become sideways-scrolling rows of 7.5rem tiles.

At 40rem and below, the header search takes its own row, tables stack and primary actions fill the width. At 22rem and below, the header keeps only the Bookend. Sizes are in rem so browser zoom and text size work everywhere.

### Named Rules

**The Book Leads Rule.** On Home, the current book comes first. Do not put a grid, dashboard or stat above it.

**The Same Place Rule.** Navigation, tabs and reader tools keep their order and position on every device and visit.

## Elevation & Depth

The system is flat paper with one physical exception: book covers. Tonal paper steps separate surfaces, hairlines structure them, and the grain gives the page texture. Menus may borrow a cover shadow because they briefly sit above the page.

### Shadow Vocabulary

- **Cover** (`--r-shadow-cover`): a large book resting on the page, as in the current-book spread and book header.
- **Tile** (`--r-shadow-tile`): small covers in grids, ledgers and collection stacks, light enough that a grid stays calm.

### Named Rules

**The Only Books Lift Rule.** Do not use shadows on content sections or rows. If it is not a cover or a temporary overlay, it stays on the paper.

## Shapes

Covers are almost square (0.125rem), like a real board. Interactive controls are fully rounded pills, including primary actions, search, segmented controls and icon buttons. Small rows use softened corners (0.375rem), and overlays and status panels use 0.75rem. The Bookend is an L-shaped shelf holding a leaning book, in ink and oxblood in the header; the app icon is a paper-colored mark on oxblood.

Progress is a thin, square-ended line from 2px to 3px. Rules are 1px hairlines.

## Components

### Buttons

Quiet, solid and always named in plain words.

- **Shape:** full pill, at least 44px tall for primary actions (2.75rem).
- **Primary:** Action Black with Paper on Action, weight 650. There is one main action in a view, such as Continue reading.
- **Hover / Focus:** the fill changes instantly to Oxblood; focus shows the 3px ring at a 2px offset.
- **Outline:** transparent with a Control Grey outline, moving to Ink on hover.
- **Icon:** a transparent 44px circle with a faint ink tint on hover and a Lucide icon.

### Chips

- **Calibre genre:** a solid faint-ink tint. It is the settled state because Calibre is the source of truth.
- **Suggested genre:** a dashed outline with Promote and Remove. Removing it offers Undo in a status line and moves focus there.
- **Waiting:** a promoted suggestion says "Waiting for sync" until Calibre has it.

### Cards / Containers

Longshelf does not put books or sections in content cards. Quiet status panels use Shaded Paper with a hairline and medium radius; menus use Raised Paper; sheets hold focused tasks such as Contents and text settings.

### Inputs / Fields

- **Search:** a Raised Paper pill, 44px tall, with a Control Grey outline and a muted search icon.
- **Focus:** the 3px ring wraps the whole field.
- **Segmented choices:** a real radio group in an outlined pill, with the selection filled Action Black.

### Navigation

- **Header:** Bookend and wordmark, Home and Library, search, then sync status. The reader replaces it with its own bars.
- **Current page:** Ink text with a 2px oxblood underline; other items are Faded Ink.
- **Library tabs:** real links with the tab in the URL, so they work before hydration, keep Back and reload, and follow the arrow-key tab pattern.
- **Letter rail:** a fixed, scrubbable A to Z rail for All Books. Letters with no entries stay visible in Control Grey unless the screen is short.

### Book Tile

A fixed 2:3 cover, a two-line Literata title, author and read status. Nothing shows at 0%, in-progress books show "N% read" in oxblood, and finished books say "Finished" plainly. Read next tiles add a templated reason in oxblood. A book without a cover gets a plain binding with its title.

### Ledger Row

One whole-row target for one book: cover, title, author, percentage and chapter, then a full-width oxblood line. A second grey line appears when another device has a place.

### Reader Bars

Two thin bars around the text: back, title and chapter, Contents, text settings and bookmark above; a full-width progress line with the other device's tick, percentage and time left in chapter below. A tap in the middle third toggles them with the only animated transition in the product (200ms ease-out, off under reduced motion).

### Device Notice

When another device is further on, a compact pill in the top bar names it and offers Go there or Stay. On phones it takes a second bar row. It never covers the text and never moves the reader without a choice.

## Do's and Don'ts

### Do:

- **Do** use the semantic `--r-` tokens for all color, type, radius and shadow values, so light, dark and Night stay correct.
- **Do** keep the 3px focus ring at a 2px offset visible on every interactive element.
- **Do** keep primary controls at least 44px, and never let any target fall below the 24px product floor.
- **Do** underline links in running text so they are not identified by color alone.
- **Do** show another device's place as a neutral mark and offer it as a choice.
- **Do** let the book's own italics, epigraphs and verse render inside the reader.
- **Do** keep book text ragged right with no automatic hyphenation.

### Don't:

- **Don't** add a second accent or use oxblood as decoration.
- **Don't** put a small label above a heading, in the reader or anywhere else.
- **Don't** wrap books or page sections in content cards.
- **Don't** put shadows on anything except covers and temporary overlays.
- **Don't** add decorative or automatic motion; the reader-bar reveal is the only animated transition.
- **Don't** float notices or controls over book text.
- **Don't** overwrite a reading position silently.
