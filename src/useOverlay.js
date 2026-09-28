import { useEffect } from 'react'

/* Shared chrome for the two full-screen overlays (About, Case study).
   Both slide in over the pinned splash and behave as modals, so both need
   the same two things and previously had neither:

   1. Escape closes. Every other way out is a mouse target.
   2. When closed, the panel is still in the DOM (it only sits off-screen
      via transform) — so its links, buttons and iframe stay in the tab
      order and `aria-hidden` alone is an invalid ARIA state on focusable
      content. `inert` removes the whole subtree from focus, hit-testing
      and the accessibility tree, and is dropped the moment it opens.

   Pass the panel element's ref plus its open state. */
export default function useOverlay(ref, open, onClose) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open) el.removeAttribute('inert')
    else el.setAttribute('inert', '')
  }, [ref, open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
}
