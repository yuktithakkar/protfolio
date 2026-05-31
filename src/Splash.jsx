import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

const ease = [0.76, 0, 0.24, 1]

/* viewBox X of each YUKTI letter's leftmost visible vertical stroke
   (sampled from rendered pixels of the actual Anton font at this size).
   These are reused inside the cover's clip-path so the "bars" are
   literally narrow slices of the YUKTI letters themselves — same SVG
   text, same coords as the landing's letters → alignment is guaranteed. */
const STROKE_VBX = [207.9, 447.2, 773.2, 1159.2, 1355.9]
const STROKE_W = 8   // viewBox-unit width of each bar strip

const BAND_IMAGES = [
  '/testbench-cover.png',
  'https://picsum.photos/id/1015/1200/900',
  'https://picsum.photos/id/64/900/1400',
]

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
  // YUKTI exits left fully by stage 1 — so when Archidomo expands flush
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
  //     Projets index slides in — so the screen never looks "static".
  //   • Pikko fully exits over the following scrolls, then we scroll
  //     through the rest of the 6 tiles.
  //
  //   scrollY   leftStackY   what user sees
  //   ───────   ──────────   ─────────────────────────────────────────
  //   0.40      0            Pikko full visible; Projets begins entering
  //   0.50      -15vh        Projets full; tile-0 peeking ~15vh from below
  //   0.60      -50vh        tile-0 half-visible at bottom; Pikko top 50vh
  //   0.70      -100vh       Pikko gone; tiles 0,1 visible (2 × 50vh)
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
  // Projets index slides in from the right immediately after Pikko shifts
  // to the left. The tile peek (above) begins at the SAME scroll point
  // so the user feels there's more content waiting below.
  const projetsX = useTransform(
    scrollYProgress,
    [0.40, 0.50],
    ['100%', '0%'],
  )
  // About CTA appears together with the Projects index — so when the
  // user lands on the project list they immediately see "About me" as
  // the natural next step, not buried at the bottom of scroll.
  const aboutCtaOpacity = useTransform(
    scrollYProgress,
    [0.40, 0.50],
    [0, 1],
  )

  return (
    <div className="landing">
      <motion.div
        style={{
          x: yuktiX,
          position: 'absolute', inset: 0, pointerEvents: 'none',
        }}
      >
        <YuktiWord centred={yuktiCentred} />
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
      {/* Projets index slides in from right when Pikko exits. */}
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
  // 6 image-only tiles below Pikko. Each is positioned absolutely at
  // top: FH + i * TILE_H so the stack forms a continuous vertical strip
  // starting where Pikko's bottom would be at stage 4 (= top: 100vh).
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
              width: `${PIKKO_LEFT_W}vw`,
              backgroundImage: portrait ? undefined : `url(${img})`,
              '--tile-img': portrait ? `url(${img})` : undefined,
            }}
          />
        )
      })}
    </>
  )
}

function ProjetsIndex({ x, ctaOpacity, onAboutOpen, onCaseOpen }) {
  const ROWS = [
    { n: '01', label: 'TESTBENCH',          sub: 'AI EVALUATION PLATFORM',     caseId: 'testbench' },
    { n: '02', label: 'COMMUNICATION CENTER', sub: 'IP LIFECYCLE SAAS',        caseId: 'comms' },
    { n: '03', label: 'TITAN CREST 2.0',    sub: 'SMARTWATCH FACE SYSTEM',     caseId: 'titan-crest' },
  ]
  const handle = (caseId) => () => { if (onCaseOpen) onCaseOpen(caseId) }
  return (
    <motion.aside className="projets-aside" style={{ x }}>
      <h2 className="projets-aside__title">Selected Work</h2>
      <ul className="projets-aside__list">
        {ROWS.map((r) => (
          <li
            key={r.n}
            className="projets-aside__row projets-aside__row--clickable"
            role="button"
            tabIndex={0}
            onClick={handle(r.caseId)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle(r.caseId)() } }}
          >
            <span className="projets-aside__num">{r.n}</span>
            <span className="projets-aside__label">
              {r.label}
              <span className="projets-aside__sub">{r.sub}</span>
            </span>
            <span className="projets-aside__arrow" aria-hidden>→</span>
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

function ScrollCard({ card, index, scrollYProgress, show, onCaseOpen }) {
  const stages = CARD_STAGES[index]
  const left   = useTransform(scrollYProgress, STAGE_STOPS, stages.map(s => `${s.left}vw`))
  const width  = useTransform(scrollYProgress, STAGE_STOPS, stages.map(s => `${s.width}vw`))
  const top    = useTransform(scrollYProgress, STAGE_STOPS, stages.map(s => `${s.top}vh`))
  const height = useTransform(scrollYProgress, STAGE_STOPS, stages.map(s => `${s.height}vh`))

  // Image translateY: starts at the card's `landingY` on landing, moves
  // back to 0 the moment that card hits its own expansion stage. After
  // that stage it stays at 0 (image stays top-aligned even when the card
  // shrinks again on the left).
  const activeStop = REACH_STOPS[index]
  const imageY = useTransform(
    scrollYProgress,
    [0, activeStop],
    [`${card.landingY}%`, '0%'],
  )
  // Crossfade between the portrait landing artwork and the landscape
  // expanded artwork as the card grows. The collapsed (portrait) layer
  // fades OUT 0→1 → 1→0 across the same window the expanded layer fades
  // in. This means once expansion happens, only the landscape composition
  // is visible — no ghosting of the portrait behind it.
  // Snappy crossfade near the END of the expansion so the collapsed
  // layer (image for TestBench, vertical label for Comms/Titan) and the
  // expanded image overlap only briefly — minimal ghosting.
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
  // Info row fades in as the card becomes active.
  const infoOpacity = useTransform(
    scrollYProgress,
    [activeStop - 0.06, activeStop],
    [0, 1],
  )
  // Title fades in with the info row, but for Pikko (index 2) it fades
  // back out once it shifts to the left in stage 4 — per the akaru.fr
  // reference, only the image + info row are visible in that state.
  const isPikko = index === 2
  const titleOpacity = isPikko
    ? useTransform(
        scrollYProgress,
        [activeStop - 0.06, activeStop, HERO_STOP - 0.05, HERO_STOP],
        [0, 1, 1, 0],
      )
    : infoOpacity

  // Pikko (Titan) morphs into an image-only tile at stage 5. The band's
  // height already shrinks via CARD_STAGES, but the band-card itself is
  // padded inside (top 8%, side 7%). In tile mode we collapse those
  // paddings so the image fills the whole tile cleanly. Info row also
  // fades out in tile mode.
  // Hooks must be called unconditionally — we compute the transforms
  // always and only USE them when isPikko.
  const tileModeProgress = useTransform(scrollYProgress, [HERO_STOP, TILE_STOP], [0, 1])
  const tileTopMV    = useTransform(tileModeProgress, [0, 1], ['4%', '0%'])
  const tileLeftMV   = useTransform(tileModeProgress, [0, 1], ['0%', '0%'])
  const tileRightMV  = useTransform(tileModeProgress, [0, 1], ['0%', '0%'])
  const tileHeightMV = useTransform(tileModeProgress, [0, 1], ['70%', '100%'])
  const pikkoInfoMV  = useTransform(
    scrollYProgress,
    [activeStop - 0.06, activeStop, HERO_STOP - 0.05, HERO_STOP],
    [0, 1, 1, 0],
  )
  // AKARU-pattern: band-card spans the full width of the band (no
  // horizontal padding), starts a bit below the top edge, and reaches
  // down to leave space for the title row.
  const bandCardTop    = isPikko ? tileTopMV    : '4%'
  const bandCardLeft   = isPikko ? tileLeftMV   : '0%'
  const bandCardRight  = isPikko ? tileRightMV  : '0%'
  const bandCardHeight = isPikko ? tileHeightMV : '70%'
  const pikkoInfoOpacity = isPikko ? pikkoInfoMV : infoOpacity

  // Intro slide-in (during splash 'shift'): card enters from right.
  const introDelay = [0.16, 0.08, 0.00][index]
  const clickable = !!(card.caseId && onCaseOpen)
  const handleClick = clickable ? () => onCaseOpen(card.caseId) : undefined
  return (
    <motion.div
      className={`band band--${index + 1}${clickable ? ' is-clickable' : ''}`}
      style={{
        position: 'absolute',
        background: card.bg,
        left, width, top, height,
      }}
      initial={{ x: '100vw' }}
      animate={show ? { x: 0 } : { x: '100vw' }}
      transition={{ duration: 0.85, delay: introDelay, ease }}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }
          : undefined
      }
    >
      {/* Collapsed layer. TestBench's collapsed card is wide enough to
          show its portrait image; the much thinner Comms / Titan cards
          would only crop/zoom an image, so they show a VERTICAL title
          label instead. The image appears for those two only once the
          card expands. */}
      {card.img && (
        <motion.div
          className="band-card"
          style={{
            backgroundImage: `url(${card.img})`,
            backgroundSize: card.imageFit === 'contain' ? 'contain' : 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            y: imageY,
            opacity: card.imgExpanded ? collapsedOpacity : 1,
            top: bandCardTop,
            left: bandCardLeft,
            right: bandCardRight,
            height: bandCardHeight,
          }}
        />
      )}
      {card.collapsedLabel && (
        <motion.div
          className="band-vlabel"
          style={{ opacity: collapsedOpacity, color: card.titleColor || undefined }}
        >
          <span style={{ transform: `translateY(${card.labelShift || '0'})` }}>{card.title}</span>
        </motion.div>
      )}
      {card.imgExpanded && (
        <motion.div
          className="band-card band-card--expanded"
          style={{
            backgroundImage: `url(${card.imgExpanded})`,
            backgroundSize: card.expandedFit === 'contain' ? 'contain' : 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: expandedOpacity,
            top: bandCardTop,
            left: bandCardLeft,
            right: bandCardRight,
            height: bandCardHeight,
          }}
        />
      )}
      <motion.div
        className="band-info"
        style={{ opacity: isPikko ? pikkoInfoOpacity : infoOpacity, color: card.titleColor || undefined }}
      >
        <span className="band-year">{card.year}</span>
        <span className="band-type">{card.type}</span>
        <span className="band-desc">{card.desc}</span>
      </motion.div>
      <motion.h2
        className="band-title"
        style={{ opacity: titleOpacity, color: card.titleColor || undefined }}
      >
        {card.title}
      </motion.h2>
      <span className="band-page" style={{ color: card.titleColor || undefined }}>{`0${index + 1}`}</span>
    </motion.div>
  )
}

/* Titan card — peek + reveal.
   Landing state: a quiet typographic + dial-icon peek matching the
   density of the test-1 and comms-peek landing artworks.
   Expanded state: the full crest-2 landscape image. */
function ComposedTitanCard({ imageY, collapsedOpacity, expandedOpacity, expandedImg }) {
  return (
    <>
      {/* PEEK — landing state */}
      <motion.div
        className="band-card band-card--titan-peek"
        style={{ y: imageY, opacity: collapsedOpacity }}
      >
        <div className="titan-peek">
          <div className="titan-peek__head">
            <span className="titan-peek__chip">Watch face</span>
            <span className="titan-peek__num">06 faces</span>
          </div>
          <div className="titan-peek__dial">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="48" stroke="rgba(15,23,42,0.55)" strokeWidth="1.2" />
              <circle cx="50" cy="50" r="42" stroke="rgba(15,23,42,0.18)" strokeWidth="0.6" />
              {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => (
                <line
                  key={deg}
                  x1="50" y1="6" x2="50" y2={deg % 90 === 0 ? 12 : 10}
                  stroke="rgba(15,23,42,0.7)"
                  strokeWidth={deg % 90 === 0 ? 1.4 : 0.8}
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
              <line x1="50" y1="50" x2="50" y2="20" stroke="rgba(15,23,42,0.85)" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="50" y1="50" x2="70" y2="50" stroke="rgba(15,23,42,0.85)" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="50" cy="50" r="2" fill="rgba(15,23,42,0.9)" />
              <text x="50" y="36" textAnchor="middle" fontFamily="Inter" fontSize="6" fontWeight="500" fill="rgba(15,23,42,0.7)">TITAN</text>
            </svg>
          </div>
          <div className="titan-peek__meta">
            <span>Analogue</span>
            <span className="titan-peek__sep">+</span>
            <span>Smart UI</span>
          </div>
          <div className="titan-peek__strip">
            <span /><span /><span /><span /><span /><span />
          </div>
        </div>
      </motion.div>

      {/* REVEAL — full landscape image on expand */}
      <motion.div
        className="band-card band-card--expanded"
        style={{
          backgroundImage: `url(${expandedImg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: expandedOpacity,
        }}
      />
    </>
  )
}

/* Comms Center card — peek + reveal.
   Landing state: a quiet sneak-peek showing the system's primitive
   element (one message bubble + a hint of the thread) inside a vertical
   composition that mirrors the portrait density of the TestBench and
   Titan landing artwork.
   Expanded state: the full dense thread mockup with customer, multiple
   teams, External/Full toggle, and the primary CTA. */
function ComposedCommsCard({ imageY, collapsedOpacity, expandedOpacity }) {
  return (
    <>
      {/* PEEK — landing state, matches portrait density of cards 1 + 3 */}
      <motion.div
        className="band-card band-card--comms-peek"
        style={{ y: imageY, opacity: collapsedOpacity }}
      >
        <div className="comms-peek">
          <div className="comms-peek__head">
            <span className="comms-peek__chip">Thread</span>
            <span className="comms-peek__status">
              <span className="comms-peek__dot" />
              Reopened
            </span>
          </div>
          <div className="comms-peek__title">
            Delivery failure, token rotation
          </div>
          <div className="comms-peek__bubble">
            <span className="comms-peek__av">PM</span>
            <div className="comms-peek__bubble-body">
              <span className="comms-peek__tag">Decision</span>
              <div className="comms-peek__text">Fresh package rebuilt. ETA <strong>2h</strong>.</div>
            </div>
          </div>
          <div className="comms-peek__ghost">
            <span className="comms-peek__ghost-line" />
            <span className="comms-peek__ghost-line" />
          </div>
        </div>
      </motion.div>

      {/* REVEAL — expanded state, the full system at a glance */}
      <motion.div
        className="band-card band-card--comms band-card--expanded"
        style={{ opacity: expandedOpacity }}
      >
        <div className="comms-card">
          <div className="comms-card__head">
            <span className="comms-card__customer">Omega Electronics &middot; Delivery</span>
            <span className="comms-card__status">
              <span className="comms-card__dot" />
              Reopened
            </span>
          </div>
          <div className="comms-card__title">
            Delivery failure, token rotation
          </div>
          <div className="comms-card__avstack">
            <span className="comms-card__sm-av" style={{ background: '#5572E8' }}>BO</span>
            <span className="comms-card__sm-av" style={{ background: '#3A9ED0' }}>PM</span>
            <span className="comms-card__sm-av" style={{ background: '#C05878' }}>LT</span>
            <span className="comms-card__avstack-meta">3 internal</span>
          </div>

          <div className="comms-card__thread">
            <div className="comms-card__msg" style={{ '--sender': '#2563EB' }}>
              <span className="comms-card__av" style={{ background: '#3A9ED0' }}>PM</span>
              <div className="comms-card__msg-body">
                <div className="comms-card__msg-head">
                  <span>PM</span>
                  <span className="comms-card__tag comms-card__tag--update">Update</span>
                </div>
                <div className="comms-card__msg-text">Token rotation queued.</div>
              </div>
            </div>
            <div className="comms-card__msg" style={{ '--sender': '#EA580C' }}>
              <span className="comms-card__av" style={{ background: '#3A9ED0' }}>PM</span>
              <div className="comms-card__msg-body">
                <div className="comms-card__msg-head">
                  <span>PM</span>
                  <span className="comms-card__tag comms-card__tag--decision">Decision</span>
                </div>
                <div className="comms-card__msg-text">Fresh package rebuilt. ETA <strong>2h</strong>.</div>
              </div>
            </div>
            <div className="comms-card__msg" style={{ '--sender': '#DC2626' }}>
              <span className="comms-card__av" style={{ background: '#C05878' }}>LT</span>
              <div className="comms-card__msg-body">
                <div className="comms-card__msg-head">
                  <span>LT</span>
                  <span className="comms-card__tag comms-card__tag--concern">Concern</span>
                </div>
                <div className="comms-card__msg-text">Escalation risk, 6 days.</div>
              </div>
            </div>
          </div>

          <div className="comms-card__foot">
            <div className="comms-card__toggle">
              <span className="is-on">External 1</span>
              <span>Full 4</span>
            </div>
            <span className="comms-card__cta">Start Customer Thread &rarr;</span>
          </div>
        </div>
      </motion.div>
    </>
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

/* Each card carries its landing image-translateY (in % of card height).
   On the landing screen the images sit STAGGERED — card 1 image at ~10%
   down, card 2 at ~38% down, card 3 at ~52% down. As the user scrolls
   and a card becomes "active" (its expansion stage), its image
   translateY animates back to 0, so the image moves UP to the top of
   the now-larger card. Text below the image fades in at the same time. */
const CARDS = [
  // AKARU-pattern: each card uses a single portrait landing image with
  // staggered landingY so narrower cards (2, 3) show empty cream at the
  // top with the photograph sitting lower in the frame. Crossfade to
  // the landscape expanded image as the card grows to full screen.
  // TestBench keeps its collapsed portrait image (its card is wide enough).
  { id: 'archidomo', bg: '#C1D3E0',   // light dusty blue (palette: cool accent)
    img:         '/landing-cards/test-1.png',
    imgExpanded: '/landing-cards/test-2.png',
    landingY: 0,  year: '2024', type: 'AI RELIABILITY',
    desc: 'EVALUATION PLATFORM FOR ENTERPRISE AI AGENTS',
    title: 'TestBench',
    caseId: 'testbench',
    imageFit: 'cover',
    expandedFit: 'cover' },
  // Comms + Titan: collapsed card is too thin for an image, so show a
  // vertical title label; the image reveals on expand. labelShift keeps
  // the two labels at DIFFERENT heights (staggered, like the old images).
  { id: 'orlinski',  bg: '#E3C7BA',   // light terracotta (palette: warm 1)
    img: null,
    collapsedLabel: true,
    labelShift: '-10vh',
    imgExpanded: '/landing-cards/comm-2.png',   // expanded full view
    landingY: 35, year: '2024', type: 'IP LIFECYCLE SAAS',
    desc: 'CONTEXTUAL COMMUNICATION BUILT INTO THE PLATFORM',
    title: 'Communication Center',
    caseId: 'comms',
    expandedFit: 'cover' },
  { id: 'titan',     bg: '#E3D9BE',   // light soft gold (palette: warm 2)
    img: null,
    collapsedLabel: true,
    labelShift: '12vh',
    imgExpanded: '/landing-cards/crest-2.png',  // expanded full view
    landingY: 55, year: '2024', type: 'PRODUCT · SMARTWATCH',
    desc: 'PREMIUM WATCH-FACE SYSTEM FOR THE TITAN CREST LINE',
    title: 'Titan Crest 2.0',
    caseId: 'titan-crest',
    expandedFit: 'cover' },
]

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
const PIKKO_LEFT_W = 50   // vw — width of Pikko once it slides to the left
const TILE_H = 50         // vh — height of each vertical tile (2 visible)
/* Each card stage = { left, width, top, height } in vw/vh. */
const _e = EXPANDED, _s = SHRUNK, _g = GUTTER
const FH = 100   // full-height (vh)
/* The 6 KEY states each card passes through (S0 landing … S5 tile).
   These are the "destinations"; the held timeline below repeats each
   expanded state so a card sits STEADY for a beat before the next one
   takes over (see STAGE_STOPS / HOLD_SEQ). */
const CARD_KEY_STAGES = [
  // Archidomo (index 0)
  [
    { left: 48,                width: 29, top: 0, height: FH },        // 0: landing
    { left: 0,                 width: _e, top: 0, height: FH },        // 1: expanded
    { left: 0,                 width: _s, top: 0, height: FH },        // 2: shrunk
    { left: 0,                 width: _s, top: 0, height: FH },        // 3: still shrunk
    { left: -(_s + _g),        width: _s, top: 0, height: FH },        // 4: off-screen
    { left: -(_s + _g),        width: _s, top: 0, height: FH },        // 5: off-screen
  ],
  // Orlinski (index 1)
  [
    { left: 77,                width: 13.5, top: 0, height: FH },
    { left: _e + _g,           width: _s, top: 0, height: FH },
    { left: _s + _g,           width: _e, top: 0, height: FH },
    { left: _s + _g,           width: _s, top: 0, height: FH },
    { left: -(_s + _g),        width: _s, top: 0, height: FH },
    { left: -(_s + _g),        width: _s, top: 0, height: FH },
  ],
  // Pikko (index 2). After expansion (stage 3) it shifts to the left at
  // PIKKO_LEFT_W width and full height (stage 4). At stage 5, as the
  // vertical-tile phase begins, the card morphs into an image-only tile:
  // height collapses from 100vh → TILE_H (50vh), title + info fade out
  // (handled in JSX), and the leftStackY scroll continues to push the
  // whole strip upward. Visually it becomes the first of the 6 tiles.
  [
    { left: 90.5,              width: 9.5,          top: 0, height: FH },
    { left: _e + _g + _s + _g, width: _s,           top: 0, height: FH },
    { left: _s + _g + _e + _g, width: _s,           top: 0, height: FH },
    { left: 2 * (_s + _g),     width: _e,           top: 0, height: FH },
    { left: 0,                 width: PIKKO_LEFT_W, top: 0, height: FH },     // stage 4 — full hero
    { left: 0,                 width: PIKKO_LEFT_W, top: 0, height: TILE_H }, // stage 5 — morphs to a tile
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

/* The 6 image-only tiles that stack BELOW Pikko in the vertical phase.
   Each tile is PIKKO_LEFT_W vw wide × TILE_H vh tall, positioned at
   top: FH (just below Pikko) + i * TILE_H so they form a vertical strip. */
const VERT_TILES = [
  '/landing-tiles/1.jpg',
  '/landing-tiles/2.png',
  '/landing-tiles/3.png',
  '/landing-tiles/4.png',
  '/landing-tiles/5.png',
  '/landing-tiles/6.png',
]

function Nav({ show }) {
  const items = [
    ['dot-projets',    'Projects'],
    ['dot-expertises', 'Expertise'],
    ['dot-agence',     'Studio'],
    ['dot-contact',    'Contact'],
  ]
  return (
    <nav className="landing__nav">
      {items.map(([cls, label], i) => (
        <motion.div
          key={label}
          className={`nav-item ${cls}`}
          initial={{ opacity: 0, y: -6 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.05 * i, ease }}
        >
          <span className="dot" />
          <span>{label}</span>
        </motion.div>
      ))}
    </nav>
  )
}

function Copy({ show }) {
  return (
    <motion.p
      className="hero-copy"
      initial={{ opacity: 0, y: 10 }}
      animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.15, ease }}
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
      transition={{ duration: 0.7, delay: 0.6, ease }}
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
      transition={{ duration: 0.6, delay: 0.2, ease }}
    >
      <div className="socials">
        <a href="https://www.linkedin.com/in/yuktirthakkar/" target="_blank" rel="noreferrer">LINKEDIN</a>
        <a href="/yukti-thakkar-resume.pdf" target="_blank" rel="noreferrer">RESUME</a>
        <button
          type="button"
          className="socials__btn"
          onClick={onAboutOpen}
        >
          ABOUT ME
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
