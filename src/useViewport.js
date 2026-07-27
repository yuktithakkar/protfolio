import { useEffect, useState } from 'react'

/* Central viewport classifier. One matchMedia-driven hook so every
   component branches off the SAME breakpoints instead of ad-hoc checks.

   Breakpoints:
     mobile   ≤ 640px
     tablet   641 – 1024px (portrait iPad lives here)
     desktop  > 1024px

   heroMode decides the landing hero layout specifically:
     'horizontal' — the scroll-expand card system (landscape & roomy)
     'vertical'   — cards stacked below the name, expand one-by-one
   Landscape tablets/desktops get 'horizontal'; phones and portrait
   tablets get 'vertical'. */
const QUERIES = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  // Horizontal hero: wide enough AND landscape, or any true desktop width.
  heroHorizontal: '(min-width: 1025px), (min-width: 900px) and (orientation: landscape)',
  // Case studies render when there's enough horizontal room: true desktop,
  // or a landscape tablet (iPad landscape ≥1024). Portrait tablets and
  // phones get the desktop nudge instead.
  caseStudy: '(min-width: 1025px), (orientation: landscape) and (min-width: 1000px)',
}

function read() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return { isMobile: false, isTablet: false, isDesktop: true, heroMode: 'horizontal', canViewCaseStudy: true }
  }
  const m = (q) => window.matchMedia(q).matches
  return {
    isMobile: m(QUERIES.mobile),
    isTablet: m(QUERIES.tablet),
    isDesktop: m(QUERIES.desktop),
    heroMode: m(QUERIES.heroHorizontal) ? 'horizontal' : 'vertical',
    canViewCaseStudy: m(QUERIES.caseStudy),
  }
}

export default function useViewport() {
  const [vp, setVp] = useState(read)

  useEffect(() => {
    const update = () => setVp(read())
    const mqls = Object.values(QUERIES).map((q) => window.matchMedia(q))
    mqls.forEach((mql) => mql.addEventListener('change', update))
    window.addEventListener('orientationchange', update)
    update()
    return () => {
      mqls.forEach((mql) => mql.removeEventListener('change', update))
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return vp
}
