# Responsive Pass — Effort / Time / Token Estimate

Target: iPad (tablet) + mobile. Current state: desktop-only, no mobile branch.

## The core problem
The landing hero (`Splash.jsx`) is a **scroll-pinned, horizontally-expanding card system** (40 framer-motion transforms on `scrollYProgress`). This is a desktop mouse-scroll paradigm. On touch it doesn't degrade gracefully — it needs a **separate, simpler mobile layout** (vertical stack, tap-to-open), not CSS tweaks. This is ~50% of the total effort and the main risk.

## Breakdown

| Area | Work | Effort | Risk |
|---|---|---|---|
| Splash landing hero | Separate vertical mobile layout + tablet width/transform tuning | **High** | High — bespoke build |
| `styles.css` globals | Breakpoints for nav, headings (vw clamps), sections, footers | Medium | Low |
| About / Titan / Projects / Vertical | Stack grids, resize type, fix overflow | Low–Med | Low |
| `communication-center.html` | Hero + every section grid → stack; charts/tables reflow | Med–High | Med (158KB file) |
| `testbench.html` | Same, 0 existing queries, larger | High | Med (263KB file) |
| `titan-crest/` case study | Image-heavy layout reflow | Medium | Med |
| QA / verification | Screenshot loops at 768 / 1024 / 390 / 430 px | Ongoing | — |

## Estimate (rough — iteration drives both time and tokens)

- **Time (focused work):** ~2–3.5 days equivalent.
  - Phase 1 (app: Splash mobile layout + global styles + components): ~1–1.5 days
  - Phase 2 (case study HTMLs): ~1–1.5 days
  - Phase 3 (QA polish across breakpoints): ~0.5 day
- **Tokens:** ~**400k–900k**. Driver is the screenshot-verify-adjust loop — each breakpoint check on 5 components + 3 case studies costs real tokens. Fewer breakpoints / less polish = lower; pixel-perfect across many devices = higher.

## Recommended approach
- Breakpoints: **mobile ≤640px, tablet 641–1024px, desktop >1024px**.
- Mobile hero: **build a separate stacked layout**, render-switch via a `useMediaQuery` hook (route B — adapting the scroll transforms — is cheaper but will feel janky on touch; not recommended).
- **Phase it.** Ship the main app responsive first (highest-traffic, most visible), verify on real devices, then do the case studies. Avoids a giant unverified diff.
