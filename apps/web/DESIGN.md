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

<!-- impeccable:design-map -->
Name: Longshelf
Colors: primary: accent oklch(0.413 0.106 13); neutral: bg oklch(0.976 0.003 106); primary: accent-surface oklch(0.934 0.012 17); primary: focus oklch(0.413 0.106 13) (+9 more in the sidecar)
Fonts: Literata (display, page, heading, title, reading); Atkinson Hyperlegible Next (body, label, meta)
Spacing: 1 0.25rem, 2 0.5rem, 3 0.75rem, 4 1rem, 6 1.5rem, 8 2rem, 12 3rem, 16 4rem
Radius: cover 0.125rem, sm 0.375rem, md 0.75rem, pill 999rem
North Star: "The Bedside Page"
Rules:
- The One Oxblood Rule. Oxblood means your place, a way onward, or the current state.
- The Other Device Is Grey Rule. This device's progress is oxblood.
- The Night Is Quieter Rule. Night removes the grain and lowers contrast from pure white while keeping reading text comfortably legible.
- The Two Voices Rule. Book names and titles speak in Literata.
- The Weight For Emphasis Rule. Interface emphasis uses weight (650), not italics or underline.
- The Natural Chapter Rule. A chapter heading keeps the book's natural size and spacing, in Literata at weight 500 and line height 1.15.
- The Tabular Progress Rule. Percentages and counts in the interface use tabular figures so they do not jitter between rows.
- The Book Leads Rule. On Home, the current book comes first.
- The Same Place Rule. Navigation, tabs and reader tools keep their order and position on every device and visit.
- The Only Books Lift Rule. Do not use shadows on content sections or rows.
Elevation:
- Cover: --r-shadow-cover
- Tile: --r-shadow-tile
Don't:
- Don't add a second accent or use oxblood as decoration.
- Don't put a small label above a heading, in the reader or anywhere else.
- Don't wrap books or page sections in content cards.
- Don't put shadows on anything except covers and temporary overlays.
- Don't add decorative or automatic motion; the reader-bar reveal is the only animated transition.
- Don't float notices or controls over book text.
- Don't overwrite a reading position silently.
Do:
- Do use the semantic `--r-` tokens for all color, type, radius and shadow values, so light, dark and Night stay correct.
- Do keep the 3px focus ring at a 2px offset visible on every interactive element.
- Do keep primary controls at least 44px, and never let any target fall below the 24px product floor.
- (+4 more)
Full: .impeccable/design-full.md (read a section when you need its detail)
