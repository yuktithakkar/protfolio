import { useEffect, useRef, useState } from 'react'

const ASSETS = '/case-studies/titan-crest'

/* ─── Reveal on scroll ─────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setVisible(true) }),
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag
      ref={ref}
      className={`tc-reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

/* ────────────────────────────────────────────────────────────────── */
export default function TitanCrest() {
  return (
    <div className="tc-root">
      <Hero />
      <Meta />
      <Intro />
      <Challenges />
      <Moodboard />
      <Palette />
      <Process />
      <Anatomy />
      <Collection />
      <Campaign />
      <Footer />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  01  HERO — image only                                             */
/* ────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="tc-hero">
      <img
        className="tc-hero__img"
        src={`${ASSETS}/hero.png`}
        alt="Titan Crest 2.0. A Blend of Classic Aesthetics with Smartwatch Technology"
      />
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  02  META STRIP — recruiter-readable anchor                        */
/* ────────────────────────────────────────────────────────────────── */
function Meta() {
  const meta = [
    ['Year',    '2024'],
    ['Role',    'Product Designer · Watch faces'],
    ['Scope',   'Hybrid analogue with smart UI'],
    ['Shipped', 'Titan Crest 2.0 collection'],
  ]
  return (
    <section className="tc-meta">
      <div className="tc-container">
        <Reveal className="tc-meta__row">
          {meta.map(([label, value]) => (
            <div key={label} className="tc-meta__cell">
              <div className="tc-meta__label">{label}</div>
              <div className="tc-meta__value">{value}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  03  INTRO — paragraph + 3 feature pills                            */
/* ────────────────────────────────────────────────────────────────── */
function Intro() {
  return (
    <section className="tc-section tc-intro">
      <div className="tc-container">
        <Reveal as="p" className="tc-intro__copy">
          Titan Crest is a premium smartwatch line from Titan, designed to bring
          the timeless charm of analogue watches into the world of modern tech.
          The goal was to create watch faces that feel familiar, sophisticated,
          and functional. Designed for users who love the look of a classic
          timepiece but expect the intelligence of a smartwatch.
        </Reveal>
        <Reveal className="tc-features" delay={120}>
          <span className="tc-feature-pill">Hybrid watch-face</span>
          <span className="tc-feature-pill">Premium Mesh strap series</span>
          <span className="tc-feature-pill">Elevated everyday wear</span>
        </Reveal>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  04  CHALLENGES + OPPORTUNITY                                       */
/* ────────────────────────────────────────────────────────────────── */
function Challenges() {
  return (
    <section className="tc-section tc-challenges">
      <div className="tc-container">
        <div className="tc-section-head">
          <Reveal as="span" className="tc-eyebrow">01 · The brief</Reveal>
          <Reveal as="h2" className="tc-section-title">
            Challenges &amp; opportunities
          </Reveal>
        </div>
        <div className="tc-challenges__grid">
          <Reveal className="tc-card tc-card--challenge" delay={80}>
            <div className="tc-card__head">
              <span className="tc-card__num">01</span>
              <h3 className="tc-card__label">The Challenge</h3>
            </div>
            <p className="tc-card__lead">Analogue charm, smart intelligence.</p>
            <p className="tc-card__body">
              Create designs that visually read as analogue but integrate the
              intelligence of a smartwatch. Step count, heart rate, calendar
              events all surfaced in a non intrusive, elegant way. The face has
              to feel like a mechanical timepiece at a glance, yet reveal every
              modern data point on a second look.
            </p>
          </Reveal>
          <Reveal className="tc-card tc-card--opportunity" delay={160}>
            <div className="tc-card__head">
              <span className="tc-card__num">02</span>
              <h3 className="tc-card__label">The Opportunity</h3>
            </div>
            <p className="tc-card__lead">Timeless in look, modern in feel.</p>
            <p className="tc-card__body">
              Users are drawn to elegant, analogue design but still want modern
              convenience. Most smartwatches lean futuristic, which doesn't
              appeal to those who value traditional watch aesthetics. Titan
              saw room for a face that looked timeless but behaved smart.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  05  MOODBOARD                                                      */
/* ────────────────────────────────────────────────────────────────── */
function Moodboard() {
  return (
    <section className="tc-section tc-moodboard">
      <div className="tc-container">
        <div className="tc-section-head">
          <Reveal as="span" className="tc-eyebrow">02 · Reference</Reveal>
          <Reveal as="h2" className="tc-section-title">Moodboard</Reveal>
          <Reveal as="p" className="tc-section-sub" delay={60}>
            What we wanted the Crest to feel like before sketching a single dial.
          </Reveal>
        </div>

        {/* Compact editorial moodboard. Three reference photos in a
            single horizontal strip; tiny mono captions sit ABOVE each
            photo so the imagery is uncovered. Below, a clearly-labelled
            statement carries the design intent in a different voice
            (serif italic), so the two pieces of typography don't
            collide visually. */}
        <div className="tc-moodboard__strip">
          <Reveal className="tc-mb-col" delay={60}>
            <div className="tc-mb-col__cap">
              <span className="tc-mb-col__num">01</span>
              <span className="tc-mb-col__label">The wearer</span>
            </div>
            <div className="tc-mb">
              <img src={`${ASSETS}/moodboard-driver.png`} alt="The wearer in routine" />
            </div>
          </Reveal>
          <Reveal className="tc-mb-col" delay={140}>
            <div className="tc-mb-col__cap">
              <span className="tc-mb-col__num">02</span>
              <span className="tc-mb-col__label">Performance, restrained</span>
            </div>
            <div className="tc-mb">
              <img src={`${ASSETS}/moodboard-bicep-watch.png`} alt="Performance, restrained" />
            </div>
          </Reveal>
          <Reveal className="tc-mb-col" delay={220}>
            <div className="tc-mb-col__cap">
              <span className="tc-mb-col__num">03</span>
              <span className="tc-mb-col__label">Metalwork &amp; mesh</span>
            </div>
            <div className="tc-mb">
              <img src={`${ASSETS}/moodboard-meshtopdown.png`} alt="Mesh, polished, top-down" />
            </div>
          </Reveal>
        </div>

        <Reveal className="tc-moodboard__statement" delay={120}>
          <p className="tc-moodboard__lead">
            Analogue. Restrained. Crafted.{' '}
            <em className="is-accent">Quiet luxury.</em> Everyday.
          </p>
          <p className="tc-moodboard__quote">
            &ldquo;A face that reads like a mechanical watch, but holds a
            lifetime of information underneath.&rdquo;
          </p>
          <span className="tc-moodboard__attr">— design direction</span>
        </Reveal>

        <Reveal className="tc-persona" delay={120}>
          <div className="tc-persona__head">
            <span className="tc-eyebrow tc-eyebrow--accent">The wearer</span>
            <h3 className="tc-persona__title">Designed for the Modern Classic</h3>
          </div>
          <div className="tc-persona__grid">
            <div className="tc-persona__cell">
              <div className="tc-persona__label">Age</div>
              <div className="tc-persona__value">25 to 45</div>
            </div>
            <div className="tc-persona__cell">
              <div className="tc-persona__label">Style</div>
              <div className="tc-persona__value">Sophisticated, minimalist, prefers form with function</div>
            </div>
            <div className="tc-persona__cell">
              <div className="tc-persona__label">Occasion</div>
              <div className="tc-persona__value">Daily wear, workwear, business meetings</div>
            </div>
            <div className="tc-persona__cell">
              <div className="tc-persona__label">Values</div>
              <div className="tc-persona__value">Subtle luxury, timelessness, efficiency</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  06  MATERIAL PALETTE                                               */
/* ────────────────────────────────────────────────────────────────── */
function Palette() {
  const swatches = [
    { name: 'Mauve',  sub: 'Fabric', cls: 'tc-swatch__chip--mauve' },
    { name: 'Smoke',  sub: 'Ceramic', cls: 'tc-swatch__chip--smoke' },
    { name: 'Copper', sub: 'Brushed metal', cls: 'tc-swatch__chip--copper' },
    { name: 'Bronze', sub: 'Polished metal', cls: 'tc-swatch__chip--bronze' },
  ]
  return (
    <section className="tc-section tc-palette">
      <div className="tc-container">
        <div className="tc-section-head">
          <Reveal as="span" className="tc-eyebrow">03 · Surfaces</Reveal>
          <Reveal as="h2" className="tc-section-title">Material palette</Reveal>
        </div>
        <Reveal className="tc-palette__strip" delay={80}>
          {swatches.map((s) => (
            <div key={s.name} className="tc-swatch">
              <div className={`tc-swatch__chip ${s.cls}`} />
              <div className="tc-swatch__meta">
                <div className="tc-swatch__name">{s.name}</div>
                <div className="tc-swatch__sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  07  PROCESS                                                        */
/* ────────────────────────────────────────────────────────────────── */
function Process() {
  const cols = [
    {
      n: '01',
      title: 'Discovery and strategy',
      items: ['Understanding the target audience', 'Define objective'],
    },
    {
      n: '02',
      title: 'Conceptualisation',
      items: ['Develop theme', 'Define elements'],
    },
    {
      n: '03',
      title: 'Optimise technical compatibility',
      items: ['Layered process to achieve a functional watch-face'],
    },
  ]
  return (
    <section className="tc-section tc-process">
      <div className="tc-container">
        <div className="tc-section-head">
          <Reveal as="span" className="tc-eyebrow">04 · Method</Reveal>
          <Reveal as="h2" className="tc-section-title">Process</Reveal>
        </div>
        <div className="tc-process__grid">
          {cols.map((c, i) => (
            <Reveal key={c.title} className="tc-process__col" delay={80 + 80 * i}>
              <span className="tc-process__col-n">{c.n}</span>
              <h3 className="tc-process__col-title">{c.title}</h3>
              <ul>{c.items.map((t, j) => <li key={j}>{t}</li>)}</ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  08  ANATOMY — 16-layer build animation (UNCHANGED)                */
/* ────────────────────────────────────────────────────────────────── */
const ANATOMY_LAYER_COUNT = 16
const ANATOMY_LAYER_DELAY = 350
const ANATOMY_START_DELAY = 600
const ANATOMY_CALLOUT_START = 200
const ANATOMY_CALLOUT_DELAY = 200

function Anatomy() {
  const ref = useRef(null)
  // Layer build-up + sequential callouts (timings constant, see top of file).
  const [layersOn, setLayersOn] = useState(0)
  const [calloutIdx, setCalloutIdx] = useState(-1)
  const [done, setDone] = useState(false)
  const timersRef = useRef([])
  const startedRef = useRef(false)

  // Animation is triggered when the user actually hovers (or touches) the
  // section. Previously it fired on first scroll-intersection which meant
  // it often finished before the user even saw it.
  const runAnimation = () => {
    if (startedRef.current) return
    startedRef.current = true
    setDone(false)
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    for (let i = 0; i < 4; i++) {
      timersRef.current.push(setTimeout(
        () => setCalloutIdx(i),
        ANATOMY_CALLOUT_START + i * ANATOMY_CALLOUT_DELAY,
      ))
    }
    for (let i = 1; i <= ANATOMY_LAYER_COUNT; i++) {
      timersRef.current.push(setTimeout(
        () => setLayersOn(i),
        ANATOMY_START_DELAY + i * ANATOMY_LAYER_DELAY,
      ))
    }
    const totalDuration =
      ANATOMY_START_DELAY + (ANATOMY_LAYER_COUNT + 1) * ANATOMY_LAYER_DELAY
    timersRef.current.push(setTimeout(() => setDone(true), totalDuration))
  }

  const replay = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    startedRef.current = false
    setLayersOn(0)
    setCalloutIdx(-1)
    setDone(false)
    requestAnimationFrame(() => runAnimation())
  }

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  const callouts = [
    { pos: 'top-left',  title: 'Finishes',                  desc: 'Base dials, rings, indices, hands' },
    { pos: 'top-right', title: 'Hands',                     desc: 'Shapes, depth, material highlights' },
    { pos: 'bot-left',  title: 'Indices',                   desc: 'Shape, style, reflections, highlights' },
    { pos: 'bot-right', title: 'Digital + Physical Analog', desc: 'Layouts, functionality, fonts, colours' },
  ]

  return (
    <section
      className="tc-section tc-anatomy"
      ref={ref}
      onMouseEnter={runAnimation}
      onTouchStart={runAnimation}
    >
      <div className="tc-container">
        <div className="tc-section-head tc-section-head--center">
          <Reveal as="span" className="tc-eyebrow">05 · Anatomy</Reveal>
          <Reveal as="h2" className="tc-section-title">A face, layer by layer</Reveal>
          <Reveal as="p" className="tc-section-sub" delay={60}>
            16 ordered layers compose every Crest face. Finishes set the tone,
            indices and hands carry the analogue language, and the digital
            elements live beneath the same metalwork.
          </Reveal>
          {!startedRef.current && !done && (
            <Reveal as="p" className="tc-anatomy__hint" delay={120}>
              Hover the watch to see the build.
            </Reveal>
          )}
        </div>
      </div>
      <div className="tc-anatomy__inner">
        <div className="tc-anatomy__diagram">
          <img className="tc-anatomy__base" src={`${ASSETS}/animation/base.png`} alt="Watch body" />
          <div className="tc-anatomy__face">
            {Array.from({ length: ANATOMY_LAYER_COUNT }, (_, i) => i + 1).map((n) => (
              <img
                key={n}
                className={`tc-anatomy__layer ${layersOn >= n ? 'is-on' : ''}`}
                src={`${ASSETS}/animation/${n}.png`}
                alt=""
                aria-hidden
                loading={n <= 3 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
          {callouts.map((c, i) => (
            <div
              key={c.title}
              className={`tc-callout tc-callout--${c.pos} ${calloutIdx >= i ? 'is-on' : ''}`}
            >
              <span className="tc-callout__dot" />
              <span className="tc-callout__line" />
              <div className="tc-callout__card">
                <div className="tc-callout__title">{c.title}</div>
                <div className="tc-callout__desc">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`tc-anatomy__replay ${done ? 'is-on' : ''}`}
          onClick={replay}
          aria-label="Replay layer animation"
          tabIndex={done ? 0 : -1}
        >
          <span className="tc-anatomy__replay-icon" aria-hidden>↻</span>
          <span>Replay build</span>
        </button>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  09  COLLECTION — 6 watches, horizontal infinite carousel          */
/*       The track is doubled and translated 50% over the duration    */
/*       so the loop wraps seamlessly.                                 */
/* ────────────────────────────────────────────────────────────────── */
function Collection() {
  const list = [1, 2, 3, 4, 5, 6]
  // Render the watches twice; the CSS animation translates by -50%
  // (one full first-copy width) so the second copy lines up exactly
  // where the first started; no visible seam when it wraps.
  return (
    <section className="tc-section tc-collection">
      <div className="tc-container">
        <div className="tc-section-head tc-section-head--center">
          <Reveal as="span" className="tc-eyebrow">06 · The Collection</Reveal>
          <Reveal as="h2" className="tc-section-title">A few favourites</Reveal>
          <Reveal as="p" className="tc-section-sub" delay={60}>
            More than six faces were drawn for the Crest line. These are the
            six I'm most proud of, the ones that best carry the analogue plus
            smart language end to end.
          </Reveal>
        </div>
      </div>
      <Reveal className="tc-collection__viewport" delay={120}>
        <div className="tc-collection__track">
          {[...list, ...list].map((n, i) => (
            <div className="tc-collection__item" key={i} aria-hidden={i >= 6}>
              <img src={`${ASSETS}/variants/${n}.png`} alt={`Watchface variant ${n}`} />
              <div className="tc-collection__num">{`0${n}`}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  10  CAMPAIGN — marketing posters + video                          */
/* ────────────────────────────────────────────────────────────────── */
function Campaign() {
  const videoRef = useRef(null)
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) v.play().catch(() => {})
          else v.pause()
        })
      },
      { threshold: 0.25 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    <section className="tc-section tc-campaign">
      <div className="tc-container">
        <div className="tc-section-head">
          <Reveal as="span" className="tc-eyebrow">07 · Campaign</Reveal>
          <Reveal as="h2" className="tc-section-title">Real-world<br />in the wild</Reveal>
          <Reveal as="p" className="tc-section-sub" delay={60}>
            The watch face system carried into the launch creative. Key
            visuals, campaign film, in context product shots. The design held
            up at any scale.
          </Reveal>
        </div>
        <Reveal className="tc-kv__row tc-kv__row--top" delay={80}>
          <div className="tc-kv__cell tc-kv__cell--hero">
            <img src={`${ASSETS}/1.jpg`} alt="Crest 2.0. Level Up For Greatness" />
          </div>
          <div className="tc-kv__cell tc-kv__cell--video">
            <video ref={videoRef} src={`${ASSETS}/2.mp4`} autoPlay muted loop playsInline preload="metadata" />
          </div>
        </Reveal>
        <Reveal className="tc-kv__row tc-kv__row--bot" delay={160}>
          <div className="tc-kv__cell tc-kv__cell--three">
            <img src={`${ASSETS}/3.png`} alt="Watch on wrist" />
          </div>
          <div className="tc-kv__cell tc-kv__cell--four">
            <img src={`${ASSETS}/4.png`} alt="Three watches lined up" />
          </div>
          <div className="tc-kv__cell tc-kv__cell--five">
            <img src={`${ASSETS}/5.png`} alt="Sense design" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  FOOTER                                                             */
/* ────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="tc-footer">
      <div className="tc-container">
        <div className="tc-footer__top">
          <p className="tc-footer__eyebrow">Product design · Smartwatch</p>
          <h3 className="tc-footer__title">A timeless face,<br /><em>intelligently built.</em></h3>
        </div>
        <div className="tc-footer__bottom">
          <span>Titan Crest 2.0 · Case study 03</span>
          <span>Yukti · 2024</span>
        </div>
      </div>
    </footer>
  )
}
