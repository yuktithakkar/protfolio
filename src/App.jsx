import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import Splash from './Splash.jsx'
import AboutPanel from './AboutPanel.jsx'
import CaseStudyPanel from './CaseStudyPanel.jsx'

export default function App() {
  // ONE sticky viewport for the entire experience. Scroll drives
  // content transformation (cards expanding, the hero card shifting, tiles
  // sliding up, the Selected Work index appearing) but the viewport itself
  // stays pinned — the user never sees the page "scroll down" in the
  // traditional sense.
  //
  // 0 → 50%  horizontal card phase (see Splash.jsx)
  // 50% → 100%  vertical tile phase + Selected Work index slide-in
  const reduce = useReducedMotion()
  const trackRef = useRef(null)

  // About panel: opens via the CTA on the Selected Work aside (visible at
  // the end of scroll). Slides in from the right. While open, the splash
  // scroll is locked so the about panel has its own vertical scroll.
  const [aboutOpen, setAboutOpen] = useState(false)
  // Case study panel: opens when a project card is clicked. Slides up
  // from the bottom. The active case-study id determines which content
  // is rendered.
  const [caseId, setCaseId] = useState(null)

  // Scroll stays locked while the intro plays and while any overlay is up.
  // Both conditions feed ONE derived flag — an earlier version raced a
  // 3.4s timer against the overlay state and unlocked the page underneath
  // an open panel. Reduced motion skips the intro hold entirely, since
  // Splash renders its settled state immediately in that case.
  const [introDone, setIntroDone] = useState(false)
  useEffect(() => {
    if (reduce) { setIntroDone(true); return }
    const t = setTimeout(() => setIntroDone(true), 3400)
    return () => clearTimeout(t)
  }, [reduce])

  const overlayOpen = aboutOpen || !!caseId
  const locked = !introDone || overlayOpen
  useEffect(() => {
    document.body.classList.toggle('locked-scroll', locked)
    return () => document.body.classList.remove('locked-scroll')
  }, [locked])

  // Return focus to whatever opened the overlay once it closes, so a
  // keyboard user lands back where they were instead of at the top.
  const opener = useRef(null)
  const rememberOpener = () => { opener.current = document.activeElement }
  const restoreFocus = useCallback(() => {
    const el = opener.current
    opener.current = null
    if (el && typeof el.focus === 'function' && document.contains(el)) {
      el.focus({ preventScroll: true })
    }
  }, [])

  const openAbout = () => { rememberOpener(); setAboutOpen(true) }
  const closeAbout = () => { setAboutOpen(false); restoreFocus() }
  const openCase = (id) => { rememberOpener(); setCaseId(id) }
  const closeCase = () => { setCaseId(null); restoreFocus() }

  return (
    <>
      <div ref={trackRef} className="scroll-track" style={{ height: '1000vh' }}>
        <div className="viewport">
          <Splash
            trackRef={trackRef}
            onAboutOpen={openAbout}
            onCaseOpen={openCase}
          />
        </div>
      </div>
      <AboutPanel open={aboutOpen} onClose={closeAbout} />
      <CaseStudyPanel activeId={caseId} onClose={closeCase} />
    </>
  )
}
