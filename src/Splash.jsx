import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import PROJECTS from './projects.js'

const ease = [0.76, 0, 0.24, 1]

/* viewBox X of each YUKTI letter's leftmost visible vertical stroke
   (sampled from rendered pixels of the actual Anton font at this size).
   These are reused inside the cover's clip-path so the "bars" are
   literally narrow slices of the YUKTI letters themselves — same SVG
   text, same coords as the landing's letters → alignment is guaranteed. */
const STROKE_VBX = [207.9, 447.2, 773.2, 1159.2, 1355.9]
const STROKE_W = 8   // viewBox-unit width of each bar strip

/* Phase timeline (ms):
     0  – 1000  idle      bars centred, black
   1000 – 2300  sweep     cover retracts, YUKTI emerges at centred bar positions
   2300 – 3200  shift     YUKTI slides centre → left, bands slide in from right
   3200 +       done      nav / copy / footer fade in */
export default function Splash({ trackRef, onAboutOpen, onCaseOpen }) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    if (reduce) { setPhase('done'); return }
    const timers = [
      setTimeout(() => setPhase('sweep'), 1000),
      setTimeout(() => setPhase('shift'), 2350),
      setTimeout(() => setPhase('done'),  3300),
    ]
    return () => timers.forEach(clearTimeout)
  }, [reduce])

  return (
    <div className="stage">
      <Landing phase={phase} trackRef={trackRef} onAboutOpen={onAboutOpen} onCaseOpen={onCaseOpen} />
      <Cover phase={phase} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
function Landing({ phase, trackRef, onAboutOpen, onCaseOpen }) {
  // YUKTI sits at centre during idle + sweep, then slides left.
  // Bands begin sliding in the moment YUKTI starts moving — they share
  // the same beat, so the right-half fills in as the left-half settles.
  const yuktiCentred = phase === 'idle' || phase === 'sweep'
  const bandsIn      = phase === 'shift' || phase === 'bands' || phase === 'done'
  const chromeIn     = phase === 'done'

  // Window-level scroll progress 0→1 over the full scrollable range.
  // Since the page is exactly the 1000vh scroll-track, this directly
  // maps to our stage stops.
  const { scrollYProgress } = useScroll()
  // YUKTI exits left fully by stage 1 — so when the first card expands flush
  // to viewport-left, no cream/YUKTI sliver is visible behind it.
  // YUKTI exits left during the very first expansion (stop 0 → 1) and
  // stays off-screen for the rest of the timeline. One output value per
  // STAGE_STOPS entry (lengths must match).
  const yuktiX = useTransform(
    scrollYProgress,
    STAGE_STOPS,
    ['0vw', ...Array(STAGE_STOPS.length - 1).fill('-60vw')],
  )
  // Intro chrome (hero copy + footer) fades out almost immediately once
  // the user starts scrolling — BEFORE the first card expands — so it
  // never overlaps the growing card.
  const chromeOpacity = useTransform(scrollYProgress, [0, 0.008, 0.022], [1, 1, 0])

  // Vertical-phase choreography. Tiles are 50vh tall (2 visible at a time).
  //   • The next tile starts peeking in from below AT THE SAME TIME as
  //     Selected Work index slides in — so the screen never looks "static".
  //   • the hero card fully exits over the following scrolls, then we scroll
  //     through the rest of the 6 tiles.
  //
  //   scrollY   leftStackY   what user sees
  //   ───────   ──────────   ─────────────────────────────────────────
  //   0.40      0            the hero card full visible; Projets begins entering
  //   0.50      -15vh        Projets full; tile-0 peeking ~15vh from below
  //   0.60      -50vh        tile-0 half-visible at bottom; the hero card top 50vh
  //   0.70      -100vh       the hero card gone; tiles 0,1 visible (2 × 50vh)
  //   0.80      -150vh       tiles 1,2
  //   0.90      -200vh       tiles 2,3
  //   1.00      -300vh       tiles 4,5 (last 2)
  // Total tile Y = leftStackY + vertTilesY. VertTilesGroup contributes
  // -TILE_H once the morph completes (scrollY > 0.50), so leftStackY
  // alone advances the stack from here on. The final value at 1.00 is
  // -(FH + 3*TILE_H) = -250vh — combined with -TILE_H = -300vh total,
  // exactly placing tiles 4 + 5 in the viewport, flush with the bottom.
  const leftStackY = useTransform(
    scrollYProgress,
    [0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00],
    [
      '0vh',
      '0vh',                          // 0.50: morph done, tile-0 sits flush under Crest
      `${-TILE_H}vh`,                 // 0.60: tiles 0,1 visible
      `${-FH}vh`,                     // 0.70: tiles 1,2
      `${-FH - TILE_H}vh`,            // 0.80: tiles 2,3
      `${-FH - 2 * TILE_H}vh`,        // 0.90: tiles 3,4
      `${-FH - 3 * TILE_H}vh`,        // 1.00: tiles 4,5 — flush at viewport bottom
    ],
  )
  // Selected Work index slides in from the right as the hero card shrinks
  // from 70vw to 50vw and moves left (0.35 → 0.40). It used to start only
  // at 0.40, which left the entire right half of the viewport blank for
  // ~90vh of scrolling — a dead beat right before the payoff. Now the
  // index fills the space at the same moment the space opens.
  const projetsX = useTransform(
    scrollYProgress,
    [0.35, 0.44],
    ['100%', '0%'],
  )
  // About CTA appears together with the Selected Work index — so when the
  // user lands on the project list they immediately see "About me" as
  // the natural next step, not buried at the bottom of scroll.
  const aboutCtaOpacity = useTransform(
    scrollYProgress,
    [0.38, 0.46],
    [0, 1],
  )

  // Cursor-reactive highlight on the fluid background.
  const landingRef = useRef(null)
  const handleMove = (e) => {
    const el = landingRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  // Make THAKKAR exactly the same rendered width as YUKTI (both scale with
  // vw, so the matched font-size in vw holds at any viewport).
  useEffect(() => {
    const BASE = 13
    const match = () => {
      const yt = document.querySelector('.variant-full .yukti-text')
      const sm = document.querySelector('.surname-mark')
      if (!yt || !sm) return
      const yw = yt.getBoundingClientRect().width
      sm.style.fontSize = `${BASE}vw`
      const tw = sm.getBoundingClientRect().width
      if (yw > 0 && tw > 0) sm.style.fontSize = `${(BASE * yw / tw).toFixed(3)}vw`
    }
    const t = setTimeout(match, 3500)      // after the splash settles (YUKTI at rest)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(match, 120))
    window.addEventListener('resize', match)
    return () => { clearTimeout(t); window.removeEventListener('resize', match) }
  }, [])

  return (
    <div className="landing" ref={landingRef} onMouseMove={handleMove}>
      <motion.div
        style={{
          x: yuktiX,
          position: 'absolute', inset: 0, pointerEvents: 'none',
        }}
      >
        <YuktiWord centred={yuktiCentred} />
        <Surname show={chromeIn} />
      </motion.div>
      {/* Left column: cards + 6 image-only tiles, all translate Y in
          vertical phase. The vert-tiles get an extra counter-translate
          so they hug the bottom of the Titan card as it morphs from
          100vh → 50vh — eliminates the 50vh white gap that would
          otherwise appear between the morphed Titan tile and tile-0. */}
      <motion.div className="left-stack" style={{ y: leftStackY }}>
        <BandsArea scrollYProgress={scrollYProgress} show={bandsIn} onCaseOpen={onCaseOpen} />
        <VertTilesGroup scrollYProgress={scrollYProgress} />
      </motion.div>
      {/* Selected Work index slides in from right when the hero card exits. */}
      <ProjetsIndex x={projetsX} ctaOpacity={aboutCtaOpacity} onAboutOpen={onAboutOpen} onCaseOpen={onCaseOpen} />
      <motion.div style={{ opacity: chromeOpacity }}>
        <Copy show={chromeIn} />
        <Footer show={chromeIn} onAboutOpen={onAboutOpen} />
      </motion.div>
    </div>
  )
}

function VertTilesGroup({ scrollYProgress }) {
  // Counter-translate that pulls the tile strip UP by TILE_H exactly as
  // the Titan card shrinks from FH to TILE_H. Result: no white gap
  // between the morphed Titan tile and the first vert-tile.
  const y = useTransform(
    scrollYProgress,
    [HERO_STOP, TILE_STOP],
    ['0vh', `-${TILE_H}vh`],
  )
  return (
    <motion.div style={{ y, position: 'absolute', inset: 0 }}>
      <VertTiles />
    </motion.div>
  )
}

function VertTiles() {
  // 6 image-only tiles below the hero card. Each is positioned absolutely at
  // top: FH + i * TILE_H so the stack forms a continuous vertical strip
  // starting where the hero card's bottom would be at stage 4 (= top: 100vh).
  // 5.png (index 4) is a portrait composition — flag it so CSS can use
  // a blurred-backdrop fill instead of cropping or leaving white margins.
  return (
    <>
      {VERT_TILES.map((img, i) => {
        const portrait = img.endsWith('/5.png')
        return (
          <div
            key={i}
            className={`vert-tile${portrait ? ' vert-tile--portrait' : ''}`}
            style={{
              top: `${FH + i * TILE_H}vh`,
              height: `${TILE_H}vh`,
              width: `${HERO_LEFT_W}vw`,
              backgroundImage: portrait ? undefined : `url(${img})`,
              '--tile-img': `url(${img})`,
            }}
          />
        )
      })}
    </>
  )
}

function ProjetsIndex({ x, ctaOpacity, onAboutOpen, onCaseOpen }) {
  const handle = (caseId) => () => { if (onCaseOpen) onCaseOpen(caseId) }
  return (
    <motion.aside className="projets-aside" style={{ x }}>
      <h2 className="projets-aside__title">Selected Work</h2>
      <ul className="projets-aside__list">
        {PROJECTS.map((p) => (
          <li key={p.id} className="projets-aside__row">
            <button
              type="button"
              className="projets-aside__btn"
              onClick={handle(p.id)}
            >
              <span className="projets-aside__num">{p.num}</span>
              <span className="projets-aside__label">
                {p.name}
                <span className="projets-aside__sub">{p.sub}</span>
              </span>
              <span className="projets-aside__arrow" aria-hidden>→</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="projets-aside__copy">
        A small, considered set of product design work. Each piece is a
        problem I lived with for a while before it became a screen.
      </p>
      <motion.button
        className="about-cta"
        style={{ opacity: ctaOpacity }}
        onClick={onAboutOpen}
        type="button"
      >
        <span className="about-cta__label">About me</span>
        <span className="about-cta__arrow" aria-hidden>→</span>
      </motion.button>
    </motion.aside>
  )
}

function BandsArea({ scrollYProgress, show, onCaseOpen }) {
  return (
    <div className="bands-area">
      {CARDS.map((card, i) => (
        <ScrollCard
          key={card.id}
          card={card}
          index={i}
          scrollYProgress={scrollYProgress}
          show={show}
          onCaseOpen={onCaseOpen}
        />
      ))}
    </div>
  )
}

/* Vertical offset of the collapsed thumbnail + name, per landing slot.
   Positional, not per-project: the three cards sit staggered high-to-low
   across the landing regardless of which work occupies which slot. */
const LABEL_TOPS = ['12%', '27%', '42%']
const INTRO_DELAYS = [0.16, 0.08, 0.00]

function ScrollCard({ card, index, scrollYProgress, show, onCaseOpen }) {
  const stages = CARD_STAGES[index]
  const left   = useTransform(scrollYProgress, STAGE_STOPS, stages.map(s => `${s.left}vw`))
  const width  = useTransform(scrollYProgress, STAGE_STOPS, stages.map(s => `${s.width}vw`))
  const top    = useTransform(scrollYProgress, STAGE_STOPS, stages.map(s => `${s.top}vh`))
  const height = useTransform(scrollYProgress, STAGE_STOPS, stages.map(s => `${s.height}vh`))

  const activeStop = REACH_STOPS[index]
  // Crossfade between the collapsed thumbnail and the full case-study
  // artwork as the card grows. Snappy, near the END of the expansion, so
  // the two layers overlap only briefly — minimal ghosting.
  const expandedOpacity = useTransform(
    scrollYProgress,
    [activeStop - 0.03, activeStop - 0.005],
    [0, 1],
  )
  const collapsedOpacity = useTransform(
    scrollYProgress,
    [activeStop - 0.03, activeStop - 0.005],
    [1, 0],
  )
  // Footer (title + discipline + CTA) fades in as the card becomes active.
  const infoOpacity = useTransform(
    scrollYProgress,
    [activeStop - 0.06, activeStop],
    [0, 1],
  )

  // The last card carries the hero beat: after its own expansion it shifts
  // full-height to the left, then morphs into the first image tile of the
  // vertical strip. Its footer fades back out as it becomes a tile, and
  // the artwork loses its inset padding to fill the tile edge to edge.
  // Every transform is computed unconditionally — hooks cannot be called
  // inside a branch — and only USED when this is the hero card.
  const isHeroCard = index === 2
  const tileModeProgress = useTransform(scrollYProgress, [HERO_STOP, TILE_STOP], [0, 1])
  const tileTopMV    = useTransform(tileModeProgress, [0, 1], ['4%', '0%'])
  const tileHeightMV = useTransform(tileModeProgress, [0, 1], ['70%', '100%'])
  const heroInfoMV   = useTransform(
    scrollYProgress,
    [activeStop - 0.06, activeStop, HERO_STOP - 0.05, HERO_STOP],
    [0, 1, 1, 0],
  )
  // Artwork fit. `cover` was slicing every composition — the expanded
  // reveal cut words mid-glyph on all three cards ("HIGH PRIORI…",
  // "reimag…"). These are authored compositions with type baked in, so
  // the whole frame has to be visible: contain, floated on the card's own
  // tinted glass. The one exception is the hero card once it morphs into
  // a tile, where it sits in a strip of `cover` tiles and has to match.
  const artworkFit = useTransform(scrollYProgress, (v) =>
    (isHeroCard && v >= HERO_STOP ? 'cover' : 'contain'))

  const bandCardTop    = isHeroCard ? tileTopMV    : '4%'
  const bandCardHeight = isHeroCard ? tileHeightMV : '70%'
  const footOpacity    = isHeroCard ? heroInfoMV   : infoOpacity

  const clickable = !!onCaseOpen
  const handleClick = clickable ? () => onCaseOpen(card.id) : undefined
  return (
    <motion.div
      className={`band band--glass band--${index + 1}${clickable ? ' is-clickable' : ''}`}
      style={{
        position: 'absolute',
        background: card.glass,
        left, width, top, height,
      }}
      initial={{ x: '100vw' }}
      animate={show ? { x: 0 } : { x: '100vw' }}
      transition={{ duration: 0.85, delay: INTRO_DELAYS[index], ease }}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      aria-label={clickable ? `${card.name} — view case study` : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }
          : undefined
      }
    >
      {/* Collapsed visual: square thumbnail + vertical name (title +
          discipline) at the card's staggered start. Fades out as the card
          expands and the full case-study image takes over. */}
      <motion.div
        className="band-collapsed"
        style={{ opacity: collapsedOpacity, top: LABEL_TOPS[index] }}
      >
        <div
          className="band-thumb has-thumb"
          style={{ backgroundImage: `url(${card.thumb})` }}
        />
        <div className="band-vname">
          <span className="band-vname__title">{card.name}</span>
          <span className="band-vname__disc">{card.discipline}</span>
        </div>
      </motion.div>
      <motion.div
        className="band-card band-card--expanded"
        style={{
          backgroundImage: `url(${card.imgExpanded})`,
          backgroundSize: artworkFit,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: expandedOpacity,
          top: bandCardTop,
          left: '0%',
          right: '0%',
          height: bandCardHeight,
        }}
      />
      {/* Expanded footer: title + discipline + a clear case-study CTA so
          it's obvious the card is clickable. */}
      <motion.div className="band-foot" style={{ opacity: footOpacity }}>
        <div className="band-foot__txt">
          <span className="band-foot__title">{card.name}</span>
          <span className="band-foot__disc">{card.discipline}</span>
        </div>
        <span className="band-foot__cta">View case study <span aria-hidden>&rarr;</span></span>
      </motion.div>
      <span className="band-num">{card.num}</span>
    </motion.div>
  )
}

function YuktiWord({ centred, variant = 'full' }) {
  // variant 'full': dark YUKTI on landing (the final wordmark)
  // variant 'bars': cream YUKTI on cover, clipped to 5 narrow vertical
  //                 strips at each letter's stroke — looks like 5 bars.
  // Both variants share identical SVG coords + container positioning so
  // the bars in the cover sit exactly on the letter strokes underneath.
  const clipId = `yukti-strokes-clip`
  return (
    <motion.div
      className={`yukti-hero ${centred ? 'is-centered' : 'is-left'} variant-${variant}`}
      initial={false}
      animate={
        centred
          ? { left: '48.625%', x: '-50%' }  // -1.375% so stroke cluster mid → viewport 50%
          : { left: '3vw',     x: '0%' }
      }
      transition={{ duration: 0.85, ease }}
    >
      <svg
        className="yukti-svg"
        viewBox="0 0 1450 720"
        preserveAspectRatio="xMidYMid meet"
      >
        {variant === 'bars' && (
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              {STROKE_VBX.map((sx, i) => (
                <rect
                  key={i}
                  x={sx - STROKE_W / 2}
                  y={140}            /* top strip starts inside letter */
                  width={STROKE_W}
                  height={210}       /* top half of bar */
                />
              ))}
              {STROKE_VBX.map((sx, i) => (
                <rect
                  key={`b${i}`}
                  x={sx - STROKE_W / 2}
                  y={400}            /* bottom half of bar */
                  width={STROKE_W}
                  height={210}
                />
              ))}
            </clipPath>
          </defs>
        )}
        <text
          x={725}
          y={620}
          textAnchor="middle"
          className={variant === 'bars' ? 'yukti-text yukti-text--bars' : 'yukti-text'}
          clipPath={variant === 'bars' ? `url(#${clipId})` : undefined}
        >YUKTI</text>
      </svg>
    </motion.div>
  )
}

/* Three tinted-glass cards (frosted over the fluid background). Collapsed,
   each shows a square thumbnail + vertical name at a STAGGERED start; on
   scroll the card expands and crossfades to the full case-study artwork.
   Order, names, numbers and tints all come from the shared project record
   so the landing and the Selected Work index can never disagree again. */
const CARDS = PROJECTS

/* Each card has 4 stages it interpolates through as the user scrolls:
     stage 0  – landing       (3 cards staggered, small)
     stage 1  – card 1 grown
     stage 2  – card 2 grown  (card 1 shrunk-left)
     stage 3  – card 3 grown  (cards 1+2 shrunk-left)
   Each stage = { left, width } in vw.
   The shrunk-left widths for already-passed cards stack from the left edge. */
const SHRUNK = 14         // vw — width of a card after its expansion is done
const EXPANDED = 70       // vw — every active card reaches this same width
const GUTTER = 1          // vw — consistent gap between every adjacent card
const HERO_LEFT_W = 50   // vw — width of the hero card once it slides to the left
const TILE_H = 50         // vh — height of each vertical tile (2 visible)
/* Each card stage = { left, width, top, height } in vw/vh. */
const _e = EXPANDED, _s = SHRUNK, _g = GUTTER
const FH = 100   // full-height (vh)
/* The 6 KEY states each card passes through (S0 landing … S5 tile).
   These are the "destinations"; the held timeline below repeats each
   expanded state so a card sits STEADY for a beat before the next one
   takes over (see STAGE_STOPS / HOLD_SEQ). */
const CARD_KEY_STAGES = [
  // slot 0 — landing: widest, highest
  [
    { left: 56.5,              width: 18, top: 0, height: FH },        // 0: landing (CC, widest)
    { left: 0,                 width: _e, top: 0, height: FH },        // 1: expanded
    { left: 0,                 width: _s, top: 0, height: FH },        // 2: shrunk
    { left: 0,                 width: _s, top: 0, height: FH },        // 3: still shrunk
    { left: -(_s + _g),        width: _s, top: 0, height: FH },        // 4: off-screen
    { left: -(_s + _g),        width: _s, top: 0, height: FH },        // 5: off-screen
  ],
  // slot 1 — landing: middle
  [
    { left: 74.5,              width: 13.5, top: 0, height: FH },     // 0: landing (Titan, middle)
    { left: _e + _g,           width: _s, top: 0, height: FH },
    { left: _s + _g,           width: _e, top: 0, height: FH },
    { left: _s + _g,           width: _s, top: 0, height: FH },
    { left: -(_s + _g),        width: _s, top: 0, height: FH },
    { left: -(_s + _g),        width: _s, top: 0, height: FH },
  ],
  // the hero card (index 2). After expansion (stage 3) it shifts to the left at
  // HERO_LEFT_W width and full height (stage 4). At stage 5, as the
  // vertical-tile phase begins, the card morphs into an image-only tile:
  // height collapses from 100vh → TILE_H (50vh), title + info fade out
  // (handled in JSX), and the leftStackY scroll continues to push the
  // whole strip upward. Visually it becomes the first of the 6 tiles.
  [
    { left: 88,                width: 12,           top: 0, height: FH },     // 0: landing (Test Bench, flush right)
    { left: _e + _g + _s + _g, width: _s,           top: 0, height: FH },
    { left: _s + _g + _e + _g, width: _s,           top: 0, height: FH },
    { left: 2 * (_s + _g),     width: _e,           top: 0, height: FH },
    { left: 0,                 width: HERO_LEFT_W, top: 0, height: FH },     // stage 4 — full hero
    { left: 0,                 width: HERO_LEFT_W, top: 0, height: TILE_H }, // stage 5 — morphs to a tile
  ],
]
/* Held timeline. Each expanded card now DWELLS (stays fully expanded
   for a beat) before the next card takes over, instead of the cards
   morphing continuously. We do this by repeating the key state across
   two consecutive stops:

     stop:  0.00  0.06  0.12 | 0.18  0.24 | 0.30  0.35 | 0.40  0.50
     state:  S0    S1    S1  |  S2    S2  |  S3    S3  |  S4    S5
            land  ─expand→ HOLD ─expand→ HOLD ─expand→ HOLD  hero  tile

   Between an "expand" stop and the matching "HOLD" stop the values are
   identical, so scrolling through that range keeps the card steady.
   HERO_STOP / TILE_STOP stay at 0.40 / 0.50 so the vertical-tile phase
   (leftStackY etc., which keys off those scroll positions) is unchanged. */
const HOLD_SEQ   = [0, 1, 1, 2, 2, 3, 3, 4, 5]
const STAGE_STOPS = [0, 0.06, 0.12, 0.18, 0.24, 0.30, 0.35, 0.40, 0.50]
const HERO_STOP = 0.40   // titan reaches its full-left hero state
const TILE_STOP = 0.50   // titan finishes morphing into the first tile
const CARD_STAGES = CARD_KEY_STAGES.map((stages) => HOLD_SEQ.map((i) => stages[i]))
/* The scroll position at which each card REACHES its fully-expanded
   state (the start of its dwell). Indexed by card: TestBench, Comms,
   Titan — i.e. the first stop whose held state == that card grown. */
const REACH_STOPS = [STAGE_STOPS[1], STAGE_STOPS[3], STAGE_STOPS[5]]

/* The 6 image-only tiles that stack BELOW the hero card in the vertical phase.
   Each tile is HERO_LEFT_W vw wide × TILE_H vh tall, positioned at
   top: FH (just below the hero card) + i * TILE_H so they form a vertical strip. */
const VERT_TILES = [
  '/landing-tiles/1.jpg',
  '/landing-tiles/2.png',
  '/landing-tiles/3.png',
  '/landing-tiles/4.png',
  '/landing-tiles/5.png',
  '/landing-tiles/6.png',
]

function Copy({ show }) {
  return (
    <motion.p
      className="hero-copy"
      initial={{ opacity: 0, y: 10 }}
      animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.3, ease }}
    >
      Product designer exploring interaction, behavior, and how intelligence
      is shaping the experiences we build beyond static screens.
    </motion.p>
  )
}

/* Surname mark — sits left-aligned with YUKTI but smaller and lighter.
   Appears AFTER the splash has settled (driven by `show`). Not part of
   the YUKTI SVG so it can be positioned independently in DOM. */
function Surname({ show }) {
  return (
    <motion.div
      className="surname-mark"
      initial={{ opacity: 0, y: 8 }}
      animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0, ease }}
    >
      THAKKAR
    </motion.div>
  )
}

function Footer({ show, onAboutOpen }) {
  return (
    <motion.footer
      className="landing__footer"
      initial={{ opacity: 0, y: 10 }}
      animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.5, ease }}
    >
      <div className="socials">
        <a href="https://www.linkedin.com/in/yuktirthakkar/" target="_blank" rel="noreferrer">LinkedIn<span className="socials__ar" aria-hidden>&rarr;</span></a>
        <a href="/yukti-thakkar-resume.pdf" target="_blank" rel="noreferrer">Resume<span className="socials__ar" aria-hidden>&rarr;</span></a>
        <button
          type="button"
          className="socials__btn"
          onClick={onAboutOpen}
        >
          About me<span className="socials__ar" aria-hidden>&rarr;</span>
        </button>
      </div>
    </motion.footer>
  )
}

/* ------------------------------------------------------------------ */
/* Black cover. Retracts left → bars on it are clipped away, letters    */
/* underneath (in their centred position) become visible.              */
/* ------------------------------------------------------------------ */
function Cover({ phase }) {
  const isIdle = phase === 'idle'
  return (
    <motion.div
      className="cover"
      animate={
        isIdle
          ? { clipPath: 'inset(0% 0% 0% 0%)' }
          : { clipPath: 'inset(0% 100% 0% 0%)' }
      }
      transition={{ duration: 1.35, ease }}
    >
      {/* The "bars" the user sees on load are actually the cream YUKTI
          letters clipped to 5 thin vertical strips. Same SVG coords as
          the dark YUKTI on the landing below, so when the cover retracts
          and a strip is clipped away, the full letter at the same X is
          revealed. Alignment guaranteed by construction. */}
      <YuktiWord variant="bars" centred={true} />
    </motion.div>
  )
}
