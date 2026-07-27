# Communication Center — Figma parity audit & rebuild spec

Source: `Cadence UI` / page **Communication Centre** (file `8vxBGnqMjbRrCBoMEjWDI0`)
Target: [public/case-studies/communication-center.html](../../public/case-studies/communication-center.html), section 03 "Five moments"

---

## 1. What is actually in the Figma file

Eleven frames, **all 1366px wide**, heights 560–1029:

| Node | Name | Size |
|---|---|---|
| 258:757 | 01 Dashboard · Default | 1366×995 |
| 75:952 | 02 IP Requests | 1366×913 |
| 215:2866 | 3 Thread Center · Cadence Redesign | 1366×773 |
| 282:1028 | 4 Overlay (Raise a Ticket drawer) | 1366×1029 |
| 311:720 | 5 BO Management | 1366×768 |
| 336:841 | 6 Document Template | 1366×768 |
| 360:767 / 420:1522 | 07 IP Catalog · Cadence Redesign | 1366×806 / 780 |
| 468:1468 | 8 Admin Dashboard | 1366×919 |
| 485:1855 | 09 LT Contract Review | 1366×920 |

## 2. Mapping to the five case-study screens

| Case study screen | Figma source | Status |
|---|---|---|
| 01 The entry point — any workflow page | **485:1855** 09 LT Contract Review | real frame, recreated loosely |
| 02 The Communication Center — all threads | **none** | invented from scratch |
| 03 Inside the thread | **215:2866** 3 Thread Center | real frame, recreated loosely |
| 04 Tagging a reply | **none** (composer dropdown exists in 215:2866) | picker UI invented |
| 05 Start Customer Thread | **none** (drawer pattern exists in 282:1028) | drawer invented |

**This is the core of the problem.** Three of five screens have no Figma source, so they drifted
into a different design language — `.cad-dash` / `.cad-metric` / `.cad-topic` / `.cad-row`
/ `.cad-tagpicker` / `.cad-panel` are all my own inventions.

The fix is not to invent better — it is to rebuild 02/04/05 out of patterns that **do** exist:

- **Screen 02** → the *BO Management* language (311:720): page title 24px on gray → one white
  rounded card containing a metric strip (active tile = `#FFF1F3` tint + 3px red bottom rule) →
  search + filter selects row → tab row with red active underline → data table.
- **Screen 04** → the real composer from 215:2866, with the "Providing update ⌄" select opened.
- **Screen 05** → the *Overlay* drawer language (282:1028): full-height right drawer, scrim over
  the dimmed app, 24px title + × close, two-column label/field form, radius-4 inputs with
  `#717680` placeholders, chip row for single-select, red primary bottom-right.

## 3. Design tokens — already correct

Pulled from Figma variables; `.cad` in the HTML already matches. No change needed.

| Token | Value |
|---|---|
| font-family-body | **Rubik** |
| brand-action / bg-brand-solid / border-brand | `#EA0029` |
| Action / Primary Fill | `#E51836` |
| text-primary (900) | `#181D27` |
| Text / Primary | `#33393D` |
| text-secondary (700) | `#414651` |
| text-quaternary (500) / placeholder | `#717680` |
| fg-quaternary (400) | `#A4A7AE` |
| border-primary | `#D5D7DA` |
| bg-primary / _hover | `#FFFFFF` / `#FAFAFA` |
| utility-purple-500 (Update badge) | `#7A5AF8` |
| avatar neutral bg | `#E0E0E0` |
| radius | xs 4, sm 6, full 9999 |
| spacing | xxs 2, xs 4, sm 6, md 8, lg 12 |
| text-sm | 14 / 20 |
| text-xs | 12 / 18 |
| shadow-xs | `0 1px 2px #0A0D120D` |
| shadow-lg | `0 2px 2px -1px #0A0D120A, 0 4px 6px -2px #0A0D1208, 0 12px 16px -4px #0A0D1214` |

**Type scale is only 16/21, 14/20, 12/18 (+24 for page titles).** The current HTML uses
13px, 12.5px, 11.5px, 11px in the rail — all off-spec. That alone reads as "not the same design".

## 4. Structural diffs — screen 03 (measured against 215:2866)

| # | Figma | Current HTML | Impact |
|---|---|---|---|
| 1 | Rail and conversation are **two separate white rounded cards floating on gray**, 20px apart, 30px page gutter (rail x=118 w=248, conv x=386 w=950, both y=112 h=636) | one flush pane pair, `border-right`, no gutter, no radius | **highest** — changes the whole read of the screen |
| 2 | Page title sits **on the gray page** (back circle 26px + 16px label at x=118 y=70) | 44px white bar with `border-bottom` | high |
| 3 | Active sidebar item = **filled blue hexagon glyph**, blue label | blue rounded-square chip behind icon | medium |
| 4 | Conversation header: title 16/21, meta 12/18, segmented 163×36 at x=360, three 36px buttons right, full-width divider at y=76 | approximately right | low |
| 5 | Message rows: card x=58 w=731 h=97, **pitch 117 (20px gap)**, avatar 32px at x=20 outside the card, card padding 10/20/10/16 | close; avatar `margin-top:13px` guesswork | low |
| 6 | Composer 926×110 at x=12 y=514; toolbar is a **flush full-width 48px bar** with top border; Submit 84×30 at right inset 8 | toolbar inset with `margin:0 8px 8px` and its own border+shadow | medium |
| 7 | Rail item: 216 wide, h51, pitch 52; avatar 32 at x0, name x42 (14px/17), meta 11px/13, unread 12px | name 13px, meta 11.5px, ad-hoc padding | medium |

## 5. Resolution — the consistency fix

Current state, which is exactly the inconsistency you spotted:

| Screen | `.cad-app` height | Rendered width | Aspect |
|---|---|---|---|
| 01 | 864px (`--lt`) | ~1152 | 4:3 |
| 02 | 600px | ~1152 | 1.92:1 |
| 03 | 600px | ~1152 | 1.92:1 |
| 04 | 600px | ~1152 | 1.92:1 |
| 05 | 720px (`--tall`) | ~1152 | 1.6:1 |

Five aspect ratios, five effective scales, so the same 14px Figma text renders at a different
size in every screen.

**Recommendation: one 1366×768 stage for all five screens, presented at 1920×1080.**

- 1366×768 is the native authoring width of every Figma frame, so every value in the CSS is a
  literal Figma value — no arithmetic, no drift, directly verifiable against the file.
- 1366×768 × 1.40625 = 1920×1080 exactly. So the stage is authored at 1366 and `transform:
  scale()` presents it at whatever the container allows; the *output* resolution is 1920×1080
  and identical for all five screens.
- Authoring natively at 1920 would mean inventing 554px of width that does not exist in the
  design — sidebar 88 + gutter 30 + rail 248 + gap 20 + conversation 950 + gutter 30 = 1366
  exactly. Stretching those would be guesswork, and the type scale would no longer be Figma's.
- Three frames are taller than 768 (920 / 995 / 1029). Those are full-page designs taller than a
  real 1366×768 viewport, so the stage clips the bottom exactly as a real browser would. No
  reflow, no invented layout.

Net effect: one aspect ratio, one scale factor, one type scale, five screens.

## 6. Build order

1. `.cad-stage` wrapper — 1366×768, `transform-origin:top left`, scaled to container width; replaces `.cad-app` / `--tall` / `--lt` height variants.
2. Rewrite `.cad` shell to the floating-card layout: gray page, 30px gutter, rounded rail + conversation cards, page title on the page.
3. Normalise the type scale to 16/21, 14/20, 12/18, 24 only.
4. Screen 03 → exact 215:2866 geometry.
5. Screen 01 → exact 485:1855 geometry (incl. the right-hand *Internal Review* panel with the amber checklist card, which is currently missing).
6. Screen 02 → rebuild in the BO Management language (311:720).
7. Screen 04 → screen 03 + composer select open.
8. Screen 05 → rebuild in the Overlay drawer language (282:1028).
