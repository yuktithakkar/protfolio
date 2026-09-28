# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hiring managers and recruiters at design-forward companies/studios evaluating Yukti Thakkar for a full-time product design role. Freelance/consulting leads may also land here but are not the design priority.

## Product Purpose

A personal portfolio for Yukti Thakkar, a product designer, that moves a recruiter from "browsing" to "wants to interview her." It showcases three selected case studies (Test Bench, Communication Center, Titan Crest 2.0), an about/experience page, and a resume.

## Positioning

The site's own craft is the pitch: a single sticky-viewport, scroll-choreographed experience (cards morphing into tiles, panels sliding in, a hero cover that retracts into the wordmark) that a static Figma-embed portfolio can't offer. Seeing the designer's own product built and polished to production quality is the proof of interaction-design depth, not a claim about it.

## Operating Context

- Single-page React (Vite) app, built for static deploy (`dist/`).
- Landing/splash is one continuous scroll track (0-1000vh) driving card and tile choreography (`src/Splash.jsx`); the viewport itself stays pinned.
- About panel (`src/AboutPanel.jsx`) and Case Study panel (`src/CaseStudyPanel.jsx`) are full-screen overlays that slide in over the splash.
- Case studies: "Test Bench" and "Communication Center" are static HTML files served from `/public/case-studies` and rendered inside the panel (with a font/spacing CSS override layer); "Titan Crest 2.0" is rendered natively in React (`src/TitanCrest.jsx`).
- Resume is a linked PDF (`/yukti-thakkar-resume.pdf`); contact is via LinkedIn and a `mailto:` link.

## Capabilities and Constraints

- Framer Motion drives all animation; scroll choreography is pinned to fixed scrollYProgress stops (`STAGE_STOPS`, `HERO_STOP`, `TILE_STOP` in `Splash.jsx`) — new scroll-linked work must respect this stop system rather than inventing a parallel one.
- `useReducedMotion` already short-circuits the splash sequence straight to its settled state; preserve this path for any new motion.
- `useViewport`'s `isTablet` check adjusts image `background-size` (cover vs. contain) for landscape tablets — a known responsive edge case already handled once.

## Brand Commitments

- Name: Yukti Thakkar. Title: Product Designer.
- Current role: Product Designer, Divami Design Labs (Sep 2025–present).
- Prior: Titan Company Ltd. (Jul 2022–Dec 2024, smartwatch/wearables/health-tech), freelance (Jan–Sep 2025).
- Contact: yuktithakkar247@gmail.com, linkedin.com/in/yuktirthakkar/.
- Resume file: `/yukti-thakkar-resume.pdf`.

## Evidence on Hand

Three real, fully-authored case studies (not placeholders):
- **Test Bench** — AI evaluation platform, product design. HTML mockup at `public/case-studies/testbench.html`; source assets under `Case Study /testbench-v2.html` and `Images/`.
- **Communication Center** — IP lifecycle SaaS, UX. HTML mockup at `public/case-studies/communication-center.html`; source at `Case Study /communication-center-v2.html`.
- **Titan Crest 2.0** — smartwatch watch-face system, UI. Rendered natively in `src/TitanCrest.jsx`; source imagery/video under `Titan Crest2.0/` (including variants and an animation reel).

Real experience timeline and photos on the About page (`src/AboutPanel.jsx`, images in `public/about`). No invented testimonials, client names, or metrics exist or should be added beyond what the case-study HTML already authors.

## Product Principles

1. Craft is the pitch — production-grade execution stands in for a written skills list.
2. Real work only — no fabricated testimonials, metrics, or clients, ever.
3. Recruiter-first pacing — "who is this / what can they do" resolves fast; case-study depth is opt-in via click, not forced scroll.
4. Motion serves narrative — every animated transition choreographs attention toward the next piece of evidence, never decoration for its own sake.

## Accessibility & Inclusion

Reduced-motion support is already implemented for the splash sequence (`useReducedMotion` in `Splash.jsx`); keep this path intact when adding new motion.
