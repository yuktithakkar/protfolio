import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

const ease = [0.76, 0, 0.24, 1]

// AKARU-pattern gallery: one large portrait on the LEFT (~50% wide,
// full height of the hero gallery), two landscape images stacked on
// the RIGHT (top + bottom). Three images total — the visual rhythm
// matches akaru.fr's About page.
const G_LEFT      = '/about/1.jpeg'   // Yukti — portrait, hero of the trio
const G_RIGHT_TOP = '/about/3.jpeg'   // beach, landscape
const G_RIGHT_BOT = '/about/2.jpeg'   // sunset/sky, landscape
const VALUES_IMG  = '/about/4.jpeg'   // 4th picture, used in values section

// About panel: slides in from the right when the user clicks the CTA at
// the end of the splash scroll. It's its own self-contained vertical-
// scrolling page; closing it slides it back to the right and restores
// the splash scroll.
export default function AboutPanel({ open, onClose }) {
  const scrollRef = useRef(null)
  // Reset the panel's internal scroll every time it's closed so reopening
  // always starts at the top.
  useEffect(() => {
    if (!open && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [open])

  return (
    <motion.div
      className="about-panel"
      initial={false}
      animate={{ x: open ? '0%' : '100%' }}
      transition={{ duration: 1.05, ease }}
      aria-hidden={!open}
    >
      <div className="about-scroll" ref={scrollRef}>
        <header className="about-nav">
          <button className="about-back" onClick={onClose} aria-label="Back to portfolio">
            <span className="about-back__arrow" aria-hidden>←</span>
            <span>Back to portfolio</span>
          </button>
        </header>

        <section className="about-hero">
          <h1 className="about-hero__title">Yukti<br />Thakkar</h1>
          <div className="about-hero__col">
            <p className="about-hero__eyebrow">PRODUCT DESIGNER</p>
            <p className="about-hero__lede">
              Designer with 4+ years crafting experiences across wearables,
              health-tech, AI products, and digital platforms. I translate
              complex problems into intuitive, visually compelling work,
              currently designing at Divami after consumer products
              at Titan and freelance collaborations with startups.
            </p>
            <a
              className="about-hero__cta"
              href="/yukti-thakkar-resume.pdf"
              target="_blank"
              rel="noreferrer"
            >
              <span>RESUME</span>
              <span className="about-hero__cta-dot" />
            </a>
          </div>
        </section>

        <section className="about-gallery">
          {/* AKARU layout: one big portrait on the left, two landscape
              images stacked on the right. The right column starts at
              roughly 1/3 down so it staggers against the left column. */}
          <div className="g-col g-col--left">
            <div
              className="g-img g-img--hero"
              style={{
                backgroundImage: `url(${G_LEFT})`,
                /* Centre the window vertically so the face sits fully in
                   frame with headroom (verified against the new portrait's
                   composition). */
                backgroundPosition: '50% 50%',
              }}
            />
          </div>
          <div className="g-col g-col--right">
            <div
              className="g-img g-img--landscape"
              style={{
                backgroundImage: `url(${G_RIGHT_TOP})`,
                /* Anchor mid-low so the figure has breathing room from
                   the top edge (85% pulled her too close to it). */
                backgroundPosition: '50% 65%',
              }}
            />
            <div
              className="g-img g-img--landscape"
              style={{
                backgroundImage: `url(${G_RIGHT_BOT})`,
                /* Favour the sunset horizon + glow over the dark sky. */
                backgroundPosition: '50% 70%',
              }}
            />
          </div>
        </section>

        <section className="about-values">
          <div className="values-text">
            <p className="timeline-eyebrow">Experience</p>
            <ol className="timeline">
              <li className="timeline-row">
                <div className="timeline-row__when">
                  <span className="timeline-row__year">2025</span>
                  <span className="timeline-row__range">Sep - Present</span>
                </div>
                <div className="timeline-row__body">
                  <h3 className="timeline-row__role">Product Designer</h3>
                  <p className="timeline-row__where">Divami Design Labs</p>
                  <p className="timeline-row__note">
                    Designing enterprise and AI-powered digital products across
                    web platforms, working closely with product, engineering,
                    and business stakeholders. Translating complex workflows
                    into scalable user experiences through research,
                    information architecture, interaction design, prototyping,
                    and high-fidelity UI.
                  </p>
                </div>
              </li>
              <li className="timeline-row">
                <div className="timeline-row__when">
                  <span className="timeline-row__year">2025</span>
                  <span className="timeline-row__range">Jan - Sep</span>
                </div>
                <div className="timeline-row__body">
                  <h3 className="timeline-row__role">Freelance Product Designer</h3>
                  <p className="timeline-row__where">Startups &amp; small businesses</p>
                  <p className="timeline-row__note">
                    Collaborated with startups and small businesses on product
                    and web design engagements, end-to-end solutions
                    across discovery, UX strategy, wireframing, interface
                    design, and prototyping. Worked directly with founders to
                    define product direction and user-experience requirements.
                  </p>
                </div>
              </li>
              <li className="timeline-row">
                <div className="timeline-row__when">
                  <span className="timeline-row__year">2022</span>
                  <span className="timeline-row__range">Jul - Dec 2024</span>
                </div>
                <div className="timeline-row__body">
                  <h3 className="timeline-row__role">Product Designer</h3>
                  <p className="timeline-row__where">Titan Company Ltd.</p>
                  <p className="timeline-row__note">
                    Contributed to Titan and Fastrack's connected ecosystem,
                    smartwatch experiences, companion mobile apps, and
                    health-focused digital products. Led and supported
                    initiatives across women's health, wellness tracking,
                    watch-face systems, and app modernization, working with
                    cross-functional teams from concept through launch.
                  </p>
                </div>
              </li>
            </ol>
          </div>
          <aside className="values-aside">
            <div
              className="values-aside__img"
              style={{ backgroundImage: `url(${VALUES_IMG})` }}
            />
            <div className="values-aside__year">
              <span>2022</span>
              <span>/ Present</span>
            </div>
          </aside>
        </section>

        <footer className="about-footer">
          <div className="about-footer__top">
            <p className="about-footer__eyebrow">YOU MADE IT THIS FAR</p>
            <h2 className="about-footer__headline">
              Still here?<br />Let&rsquo;s talk.
            </h2>
            <a className="about-footer__cta" href="mailto:yuktithakkar247@gmail.com">
              <span>SAY HELLO</span>
              <span className="about-footer__cta-dot" />
            </a>
          </div>
          <nav className="about-footer__nav" aria-label="Footer">
            <div className="about-footer__nav-group">
              <button type="button" className="about-footer__navlink" onClick={onClose}>Projects</button>
              <button
                type="button"
                className="about-footer__navlink"
                onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                About me
              </button>
            </div>
            <div className="about-footer__nav-group">
              <a href="/yukti-thakkar-resume.pdf" target="_blank" rel="noreferrer">Resume</a>
              <a href="https://www.linkedin.com/in/yuktirthakkar/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="mailto:yuktithakkar247@gmail.com">yuktithakkar247@gmail.com</a>
            </div>
          </nav>
          <div className="about-footer__bottom">
            <span className="about-footer__mark">YUKTI THAKKAR</span>
            <span>© {new Date().getFullYear()} Yukti Thakkar</span>
          </div>
        </footer>
      </div>
    </motion.div>
  )
}
