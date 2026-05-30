import { useEffect, useRef, useState } from 'react'
import Splash from './Splash.jsx'
import AboutPanel from './AboutPanel.jsx'
import CaseStudyPanel from './CaseStudyPanel.jsx'

export default function App() {
  // ONE sticky viewport for the entire experience. Scroll drives
  // content transformation (cards expanding, Pikko shifting, tiles
  // sliding up, Projets index appearing) but the viewport itself
  // stays pinned — the user never sees the page "scroll down" in the
  // traditional sense.
  //
  // 0 → 50%  horizontal card phase (5 stages, see Splash.jsx)
  // 50% → 100%  vertical tile phase + Projets index slide-in
  useEffect(() => {
    document.body.classList.add('locked-scroll')
    const t = setTimeout(() => {
      document.body.classList.remove('locked-scroll')
    }, 3400)
    return () => clearTimeout(t)
  }, [])

  const trackRef = useRef(null)

  // About panel: opens via subtle CTA on the Projets aside (visible at
  // the end of scroll). Slides in from the right. While open, the splash
  // scroll is locked so the about panel has its own vertical scroll.
  const [aboutOpen, setAboutOpen] = useState(false)
  // Case study panel: opens when a project card is clicked. Slides up
  // from the bottom. The active case-study id determines which content
  // is rendered.
  const [caseId, setCaseId] = useState(null)
  const overlayOpen = aboutOpen || !!caseId
  useEffect(() => {
    if (overlayOpen) document.body.classList.add('locked-scroll')
    else document.body.classList.remove('locked-scroll')
  }, [overlayOpen])

  return (
    <>
      <div ref={trackRef} className="scroll-track" style={{ height: '1000vh' }}>
        <div className="viewport">
          <Splash
            trackRef={trackRef}
            onAboutOpen={() => setAboutOpen(true)}
            onCaseOpen={(id) => setCaseId(id)}
          />
        </div>
      </div>
      <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <CaseStudyPanel activeId={caseId} onClose={() => setCaseId(null)} />
    </>
  )
}
