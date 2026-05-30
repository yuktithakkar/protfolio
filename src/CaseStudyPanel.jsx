import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import TitanCrest from './TitanCrest.jsx'

const ease = [0.76, 0, 0.24, 1]

// Map of case-study ids → static HTML files served from /public.
// 'titan-crest' is rendered natively in React (see TitanCrest.jsx)
// and is therefore not in this map.
const CASE_HTML = {
  testbench: '/case-studies/testbench.html',
  comms:     '/case-studies/communication-center.html',
}

// Native React case studies. The panel renders these inline instead
// of loading them via an iframe.
const NATIVE_CASES = new Set(['titan-crest'])

// CSS override injected into the iframe AFTER its HTML has loaded.
// We do not touch the case-study DOM — only override fonts, container
// widths, and a small amount of vertical padding so the layout fills
// modern viewports instead of feeling zoomed-out on a desktop screen.
const FONT_OVERRIDE_CSS = `
  /* ────────── FONT SWAP (display font → Anton) ────────── */
  [style*='DM Serif Display'],
  [style*='DM Serif'],
  blockquote {
    font-family: 'Anton', 'Bebas Neue', Impact, sans-serif !important;
    font-weight: 400 !important;
    font-style: normal !important;
    letter-spacing: -0.02em !important;
  }
  [style*='DM Serif'] em,
  blockquote em,
  .cc-h1 em, .cc-h2 em, .cc-h2-lt em, .cc-lrn-t em {
    font-family: 'Inter', ui-sans-serif, sans-serif !important;
    font-style: italic !important;
    font-weight: 300 !important;
    letter-spacing: -0.01em !important;
  }
  .h2, .h3, .hero-h,
  .cc-h1, .cc-h2, .cc-h2-lt,
  .cc-lrn-n, .cc-stat-n,
  .pf-stat-n, .pf-h2, .pf-h2-lt {
    font-family: 'Anton', 'Bebas Neue', Impact, sans-serif !important;
    font-weight: 400 !important;
    letter-spacing: -0.02em !important;
  }

  /* ────────── CONTAINER PADDING ──────────
     Keep the original 1200px content max-width — that's what the screen
     mockups were designed around. Lifting it stretched the dashboard
     grids and graphs. We only add more horizontal padding so content
     doesn't feel pasted to the page edges on wide screens. */
  .w { padding-left: 56px !important; padding-right: 56px !important; }
  /* Inline-styled content wrappers — same padding bump. */
  section > div[style*='max-width:1200px'][style*='margin:0 auto'] {
    padding-left: 56px !important;
    padding-right: 56px !important;
  }

  /* ────────── HERO — tighter vertical rhythm ──────────
     Original heroes use min-height:100vh + justify-content:flex-end,
     which on a tall window pushes content to the bottom and leaves a
     huge empty band at the top. Anchor the content to the top with a
     sane breathing space. */
  .hero, .cc-hero, .pf-hero, [id*='cc-hero-main'] {
    min-height: auto !important;
    padding-top: 88px !important;
    padding-bottom: 64px !important;
    justify-content: flex-start !important;
  }

  /* ────────── SECTION PADDING — trim oversized gaps ────────── */
  .sec { padding: 56px 0 !important; }
  .screen-sec { padding: 56px 0 !important; }
  /* Specific dark "insight" break that was 80px top+bottom */
  [style*='padding:80px 0']:not(.cc-callout) { padding: 56px 0 !important; }

  /* ────────── BODY READABILITY ────────── */
  body { font-size: 17px !important; line-height: 1.65 !important; }
  .body, .body-lt { font-size: 17px !important; line-height: 1.75 !important; }
  .hero-sub, .cc-sub { font-size: 20px !important; line-height: 1.7 !important; }

  /* ────────── INLINE FONT-SIZE BUMPS ──────────
     The case-study HTML uses dozens of tiny inline font-sizes (9-13px)
     for stat labels, eyebrows, persona cards, alert pills, tool-matrix
     messages, etc. Match each value with an attribute selector and bump
     it without rewriting the markup. */
  [style*='font-size:8px']    { font-size: 11px !important; }
  [style*='font-size:8.5px']  { font-size: 11px !important; }
  [style*='font-size:9px']    { font-size: 12px !important; }
  [style*='font-size:9.5px']  { font-size: 12px !important; }
  [style*='font-size:10px']   { font-size: 13px !important; }
  [style*='font-size:10.5px'] { font-size: 13px !important; }
  [style*='font-size:11px']   { font-size: 14px !important; }
  [style*='font-size:12px']   { font-size: 15px !important; }
  [style*='font-size:13px']   { font-size: 16px !important; }
  [style*='font-size:13.5px'] { font-size: 16px !important; }
  [style*='font-size:14px']   { font-size: 17px !important; }
  [style*='font-size:15px']   { font-size: 17px !important; }
  [style*='font-size:16px']   { font-size: 18px !important; }
  [style*='font-size:17px']   { font-size: 20px !important; }

  /* Class-based small labels — same idea via known hooks. */
  .nav-l, .nav-r,
  .ey, .ey-lt,
  .ss-step, .ss-step-lt,
  .ss-body, .ss-body-lt,
  .hn-l, .hmk, .hmv,
  .cc-eyebrow-txt, .cc-ey, .cc-ey-lt,
  .cc-stat-l, .cc-mk, .cc-mv,
  .cc-divider-num,
  .tm-name, .tm-msg, .tm-gap,
  .al-name, .al-badge, .al-desc,
  .ic-badge, .ic-h, .ic-b,
  .note, .note-lbl, .note-lt, .note-lbl-lt,
  .cc-callout, .cc-callout-lbl,
  .lrn-n, .lrn-t,
  .pf-stat-l,
  .c-url, .c-pill, .c-brand, .c-ni, .c-nav-foot {
    font-size: inherit !important;
  }
  .nav-l { font-size: 15px !important; }
  .nav-r, .cc-divider-num { font-size: 12px !important; letter-spacing: .12em !important; }
  .ey, .ey-lt, .cc-ey, .cc-ey-lt, .ss-step, .ss-step-lt { font-size: 12px !important; letter-spacing: .14em !important; }
  .ss-body, .ss-body-lt { font-size: 16px !important; line-height: 1.7 !important; }
  .hn-l, .cc-stat-l { font-size: 11px !important; letter-spacing: .1em !important; }
  .hmk, .cc-mk { font-size: 10px !important; letter-spacing: .1em !important; }
  .hmv, .cc-mv { font-size: 14px !important; }

  /* ────────── HEADINGS bump ────────── */
  .h2 { font-size: clamp(34px, 4vw, 56px) !important; line-height: 1.08 !important; }
  .h3 { font-size: clamp(22px, 2.4vw, 32px) !important; }
  .cc-h2, .cc-h2-lt { font-size: clamp(34px, 4.4vw, 60px) !important; line-height: 1.0 !important; }
  .hero-h, .cc-h1 { line-height: .92 !important; }

  /* ────────── NUMBERS / STATS bump for the wider canvas ────────── */
  .hn-n, .cc-stat-n, .pf-stat-n { font-size: 72px !important; }
  .cc-lrn-n, .lrn-n { font-size: 48px !important; }

  /* The original sets browser-chrome miniature fonts (8px). Keep those
     compact so the screen mockups still look like mockups, not posters. */
  .c-url, .c-pill, .c-brand, .c-ni, .c-nav-foot { font-size: 12px !important; }

  /* ────────── TEST CREATION CARDS — width + CTA alignment ──────
     Section 03 (Defining Correct Before Measuring Good).
     1. The original grid is 1fr / 2.4fr which leaves the three cards
        too cramped. Shift the ratio to give the cards more width.
     2. Each card carries a duplicate descriptive paragraph BELOW the
        CTA that wraps to a different line count per card — this is
        why the Save/Save/Import buttons end up at different vertical
        positions (the bottom block heights differ). It also doubles
        information already conveyed by the header chip and badge.
        Hide the trailing paragraph; the action bar becomes the last
        row in every card → CTAs auto-align horizontally. */
  .reveal[style*='grid-template-columns:1fr 2.4fr'] {
    grid-template-columns: 1fr 4fr !important;
    gap: 32px !important;
  }
  .reveal[style*='grid-template-columns:1fr 2.4fr'] [style*='grid-template-columns:repeat(3,1fr)'] {
    gap: 14px !important;
  }
  /* Bring back the trailing description, but clamp it to 2 lines and
     give it a fixed height so every card's CTA aligns. The font is
     also a touch smaller than my global 14px bump so even the longer
     paragraphs ("Write structured test cases with specific prompts
     and expected outputs") fit in 2 lines at the 272px card width. */
  .reveal[style*='grid-template-columns:1fr 2.4fr']
    [style*='grid-template-columns:repeat(3,1fr)']
    > div > div:nth-child(4) {
    display: block !important;
    min-height: 56px !important;
    padding: 10px 14px !important;
  }
  .reveal[style*='grid-template-columns:1fr 2.4fr']
    [style*='grid-template-columns:repeat(3,1fr)']
    > div > div:nth-child(4) p {
    font-size: 12px !important;
    line-height: 1.45 !important;
    color: #6B7280 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    margin: 0 !important;
  }
  /* Pin the action bar (CTA row) above the description so all three
     CTAs sit on the same baseline. */
  .reveal[style*='grid-template-columns:1fr 2.4fr']
    [style*='grid-template-columns:repeat(3,1fr)']
    > div > div:nth-child(3) {
    margin-top: auto !important;
  }

  /* ────────── COMMUNICATION CENTER SPACING TUNE-UP ──────────
     The Comms case study uses shared class hooks (.screen-sec,
     .ss-intro, .chrome, .note, .arch-layers, .con*, .lrn-row).
     After the global font bumps everything feels tight, so we add
     generous padding + larger type and a roomier intro grid so each
     moment reads as its own beat. */

  /* Section wrapper — more vertical breathing room per moment. */
  .screen-sec { padding: 96px 0 !important; }

  /* Intro grid above each screen mockup. Wider note column, more
     horizontal padding, larger gap. */
  .ss-intro {
    padding: 0 56px 56px !important;
    gap: 64px !important;
    grid-template-columns: 1fr 360px !important;
  }
  .ss-step { font-size: 12px !important; margin-bottom: 14px !important; letter-spacing: .16em !important; }
  .ss-h    { font-size: clamp(28px, 3vw, 42px) !important; line-height: 1.1 !important; margin-bottom: 16px !important; }
  .ss-body { font-size: 17px !important; line-height: 1.7 !important; }

  /* "Why …" callout — bigger padding, more readable type. */
  .note {
    padding: 22px 26px !important;
    font-size: 15px !important;
    line-height: 1.7 !important;
    border-left-width: 4px !important;
    border-radius: 0 10px 10px 0 !important;
  }
  .note-lbl {
    font-size: 11px !important;
    margin-bottom: 10px !important;
    letter-spacing: .14em !important;
  }

  /* Chrome wrapper around screen mockups. */
  .chrome { padding: 0 56px !important; }

  /* Dark architecture table — bigger row padding, larger labels. */
  .arch-layers { margin-top: 56px !important; }
  .al { grid-template-columns: 72px 1.1fr 1.6fr !important; }
  .al-n { padding: 28px 0 28px 28px !important; font-size: 24px !important; }
  .al-l { padding: 28px 28px !important; }
  .al-r { padding: 28px 28px !important; }
  .al-name { font-size: 18px !important; margin-bottom: 6px !important; }
  .al-badge { font-size: 11px !important; letter-spacing: .12em !important; }
  .al-desc { font-size: 15px !important; line-height: 1.65 !important; }
  .arch-foot { padding: 16px 28px !important; font-size: 11px !important; letter-spacing: .14em !important; }

  /* Init cards (Communications button + My Threads). */
  .init-2 { gap: 16px !important; margin-top: 48px !important; }
  .ic { padding: 28px !important; }
  .ic-badge { font-size: 11px !important; margin-bottom: 12px !important; letter-spacing: .14em !important; }
  .ic-h { font-size: 19px !important; margin-bottom: 10px !important; line-height: 1.25 !important; }
  .ic-b { font-size: 14px !important; line-height: 1.7 !important; }

  /* Hard-constraints cards. */
  .con-grid { gap: 16px !important; margin-top: 48px !important; }
  .con { padding: 28px !important; border-radius: 12px !important; }
  .con-ic { width: 32px !important; height: 32px !important; font-size: 16px !important; margin-bottom: 14px !important; }
  .con-t { font-size: 16px !important; margin-bottom: 8px !important; }
  .con-b { font-size: 14px !important; line-height: 1.65 !important; }

  /* Dark learnings rows. */
  .lrn-row { padding: 36px 0 !important; }
  .lrn-n { font-size: 38px !important; }
  .lrn-t { font-size: clamp(20px, 2.2vw, 28px) !important; line-height: 1.3 !important; }

  /* Three principles cards (inline-styled). Bumps padding and gap. */
  [style*='Design Principles'] + h2 ~ * [style*='grid-template-columns:repeat(3,1fr)'],
  div[style*='display:grid;grid-template-columns:repeat(3,1fr);gap:16px'] {
    gap: 20px !important;
  }
  /* Tool matrix grid in section 01 — give cells more padding. */
  div[style*='grid-template-columns:repeat(3,1fr);gap:0'] {
    gap: 0 !important;
  }

  /* ────────── AGENT OVERVIEW SCREEN — taller + balanced ──────────
     The original screen is 520px tall; with our font bumps the radar +
     score list feel cramped. Grow the screen to 720px and rebalance: */
  [style*='height:520px'] { height: 720px !important; }
  /* Bigger radar chart so it owns the left half of Category Scores. */
  svg[viewBox="-10 -10 220 200"] { width: 320px !important; height: 290px !important; }
  /* Constrain the score legend column so the percentages sit close to
     the category names instead of being pushed to the far right edge
     of an otherwise empty flex:1 column. */
  svg[viewBox="-10 -10 220 200"] + div {
    flex: 0 0 auto !important;
    width: 220px !important;
    gap: 12px !important;
    padding-left: 8px !important;
  }
  svg[viewBox="-10 -10 220 200"] + div > div {
    justify-content: space-between !important;
    gap: 12px !important;
  }

  /* ────────── PHOSPHOR ICON STYLES ────────── */
  i.ph, i.ph-bold, i.ph-fill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-style: normal;
  }
`

// ──────────────────────────────────────────────────────────────────────
//  Phosphor icon replacement (script injected into the iframe)
//  Walks every <svg> in the iframe and, when its inner geometry matches
//  a known feather/lucide pattern, swaps it for the equivalent Phosphor
//  icon. Original size + colour are preserved so every label, chip and
//  chrome icon picks up Phosphor's consistent stroke aesthetic.
// ──────────────────────────────────────────────────────────────────────
const ICON_REPLACER_SRC = `
(function(){
  function ph(svg){
    /* same heuristics as JS-side; replace inline so we don't depend
       on serializing the function — we duplicate the rules here. */
    if(svg.querySelector('text'))return null;
    var vb=svg.getAttribute('viewBox')||'';
    if(vb==='-10 -10 220 200')return null;
    var w=parseFloat(svg.getAttribute('width')||'0');
    if(w&&w<9)return null;
    var kids=[].slice.call(svg.children).filter(function(c){var t=c.tagName.toLowerCase();return t!=='title'&&t!=='desc';});
    if(!kids.length)return null;
    var first=kids[0];
    var tag=first.tagName.toLowerCase();
    var d=(first.getAttribute('d')||'').replace(/\\s+/g,' ').trim();
    var pts=(first.getAttribute('points')||'').replace(/\\s+/g,' ').trim();
    var rectCount=kids.filter(function(c){return c.tagName==='rect';}).length;
    var lineCount=kids.filter(function(c){return c.tagName==='line';}).length;
    var polylineCount=kids.filter(function(c){return c.tagName==='polyline';}).length;
    var circleCount=kids.filter(function(c){return c.tagName==='circle';}).length;
    if(rectCount===4)return 'squares-four';
    if(d.indexOf('M20 21v-2a4')===0)return 'user';
    if(d.indexOf('M16 21v-2a4')===0)return 'user-circle';
    if(d.indexOf('M14 2H6')===0){
      if(lineCount>0)return 'file-text';
      if(polylineCount>0)return 'file';
      return 'file';
    }
    if(d.indexOf('M9 3H5')===0)return 'sidebar';
    if(tag==='polyline'&&pts.indexOf('22 12 18 12 15 21')===0)return 'lightning';
    if(tag==='polyline'&&pts.indexOf('13 2 3 14')===0)return 'lightning';
    if(d.indexOf('M21 15a2')===0)return 'chat-circle-text';
    if(tag==='circle'&&first.getAttribute('r')==='10'&&polylineCount>=1)return 'clock';
    if(d.indexOf('M14 9V5a3')===0)return 'thumbs-up';
    if(tag==='polyline'&&pts.indexOf('9 11 12 14 22 4')===0)return 'check-square';
    if(tag==='polyline'&&pts.indexOf('23 6 13.5')===0)return 'trend-up';
    if(tag==='polyline'&&pts.indexOf('23 18 13.5')===0)return 'trend-down';
    if(d.indexOf('M12 2L4 6v6')===0)return 'shield-check';
    if(d.indexOf('M10.29 3.86')===0)return 'warning';
    if(d.indexOf('M4 4h16')===0)return 'envelope-simple';
    if(d.indexOf('M22 7l-10 5L2 7')===0)return 'envelope-simple-open';
    if(tag==='rect'&&first.getAttribute('width')==='18'&&first.getAttribute('rx')==='2'){
      if(lineCount>0)return 'kanban';
    }
    if(d.indexOf('M1 12s4-8 11-8')===0)return 'eye';
    if(tag==='circle'&&first.getAttribute('cx')==='11'&&first.getAttribute('cy')==='11')return 'magnifying-glass';
    if(tag==='line'&&first.getAttribute('x1')==='18'&&first.getAttribute('y1')==='6')return 'x';
    if(tag==='line'&&first.getAttribute('x1')==='12'&&first.getAttribute('y1')==='5')return 'plus';
    if(tag==='polyline'&&pts.indexOf('9 18 15 12 9')===0)return 'caret-right';
    if(tag==='polyline'&&pts.indexOf('15 18 9 12 15')===0)return 'caret-left';
    if(tag==='polyline'&&pts.indexOf('6 9 12 15 18')===0)return 'caret-down';
    if(tag==='polyline'&&pts.indexOf('18 15 12 9')===0)return 'caret-up';
    if(tag==='circle'&&first.getAttribute('cx')==='12'&&first.getAttribute('r')==='10'&&circleCount>=2)return 'target';
    return null;
  }
  function run(){
    var svgs=[].slice.call(document.querySelectorAll('svg'));
    for(var i=0;i<svgs.length;i++){
      var svg=svgs[i];
      if(svg.closest('#tb-root'))continue;
      var name=ph(svg);
      if(!name)continue;
      var icon=document.createElement('i');
      icon.className='ph ph-'+name;
      var w=svg.getAttribute('width')||svg.style.width||'16';
      var size=parseFloat(w);
      if(isNaN(size))size=16;
      var stroke=svg.getAttribute('stroke')||'';
      var colour=stroke;
      if(!colour||colour==='currentColor'||colour==='none'){
        colour='';
      }
      icon.style.fontSize=Math.max(11,Math.round(size*1.1))+'px';
      if(colour)icon.style.color=colour;
      icon.style.flexShrink='0';
      svg.parentNode.replaceChild(icon,svg);
    }
  }
  /* Wait for Phosphor stylesheet to load before swapping so icons
     don't flash as missing glyphs. */
  function ready(){
    var link=document.querySelector('link[data-phosphor]');
    if(!link){return setTimeout(ready,80);}
    if(link.sheet){run();}else{link.addEventListener('load',run,{once:true});setTimeout(run,500);}
  }
  ready();
})();
`

// ──────────────────────────────────────────────────────────────────────
//  Auto-switch Canvas → Manual demo
//  After the canvas flow animation has had time to play (~6s following
//  mouseenter), flip the view toggle to Manual and gently scroll the
//  inner manual content so the visitor understands that the screen is
//  interactive. This nudge replaces the need to read instructions.
// ──────────────────────────────────────────────────────────────────────
const AUTO_SWITCH_SRC = `
(function(){
  function setup(){
    var tb=document.getElementById('tb-root');
    if(!tb)return setTimeout(setup,200);
    if(tb.__autoSwitched)return;
    tb.__autoSwitched=true;
    var fired=false;
    function trigger(){
      if(fired)return;fired=true;
      setTimeout(function(){
        if(typeof window.showEvalView==='function'){
          window.showEvalView('manual');
          setTimeout(function(){
            var manual=document.getElementById('eval-manual-view');
            if(!manual)return;
            var nodes=[].slice.call(manual.querySelectorAll('*'));
            for(var i=0;i<nodes.length;i++){
              var el=nodes[i];
              var cs=getComputedStyle(el);
              if((cs.overflowY==='auto'||cs.overflowY==='scroll')&&el.scrollHeight>el.clientHeight+8){
                try{el.scrollTo({top:Math.min(220,el.scrollHeight-el.clientHeight),behavior:'smooth'});}
                catch(e){el.scrollTop=180;}
                return;
              }
            }
          },900);
        }
      },5500);
    }
    tb.addEventListener('mouseenter',trigger,{once:true});
    /* If the canvas scrolls into view but the user never hovers — e.g.
       on a touchpad with no cursor movement — kick off the same demo
       once it has been on-screen for a few seconds. */
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting&&e.intersectionRatio>0.5){
            setTimeout(trigger,800);
            io.disconnect();
          }
        });
      },{threshold:[0.5]});
      io.observe(tb);
    }
  }
  if(document.readyState==='complete'||document.readyState==='interactive'){setup();}
  else{document.addEventListener('DOMContentLoaded',setup);}
})();
`

export default function CaseStudyPanel({ activeId, onClose }) {
  const open = !!activeId
  const isNative = open && NATIVE_CASES.has(activeId)
  const iframeRef = useRef(null)
  const nativeScrollRef = useRef(null)
  const src = open && !isNative ? CASE_HTML[activeId] : 'about:blank'

  // Reset scroll position every time the panel reopens.
  useEffect(() => {
    if (!open) return
    if (isNative) {
      const el = nativeScrollRef.current
      if (el) el.scrollTop = 0
    } else {
      const f = iframeRef.current
      if (f && f.contentWindow) {
        try { f.contentWindow.scrollTo(0, 0) } catch (_) {}
      }
    }
  }, [activeId, open, isNative])

  const handleLoad = (e) => {
    const iframe = e.target
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return

    // Anton (display) font used for headings.
    if (!doc.querySelector('link[data-yukti-anton]')) {
      const link = doc.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Anton&display=swap'
      link.setAttribute('data-yukti-anton', '')
      doc.head.appendChild(link)
    }
    // Phosphor Icons web font — replaces the inline feather/lucide SVGs.
    if (!doc.querySelector('link[data-phosphor]')) {
      const link = doc.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css'
      link.setAttribute('data-phosphor', '')
      doc.head.appendChild(link)
    }
    // Append the override style last so it wins cascade.
    if (!doc.querySelector('style[data-yukti-fonts]')) {
      const style = doc.createElement('style')
      style.setAttribute('data-yukti-fonts', '')
      style.textContent = FONT_OVERRIDE_CSS
      doc.head.appendChild(style)
    }
    // Run the SVG → Phosphor replacement after the icon font loads.
    if (!doc.querySelector('script[data-yukti-icons]')) {
      const script = doc.createElement('script')
      script.setAttribute('data-yukti-icons', '')
      script.textContent = ICON_REPLACER_SRC
      doc.body.appendChild(script)
    }
    // Auto-switch canvas demo to Manual mode after the flow animation
    // plays — only meaningful for the TestBench case study (the only
    // file that contains #tb-root + showEvalView), but harmless if
    // missing.
    if (!doc.querySelector('script[data-yukti-autoswitch]')) {
      const script = doc.createElement('script')
      script.setAttribute('data-yukti-autoswitch', '')
      script.textContent = AUTO_SWITCH_SRC
      doc.body.appendChild(script)
    }

    // ────── Canvas scroll passthrough ──────
    // The Evaluation Canvas demo binds capturing wheel listeners on
    // #tb-root that call preventDefault + stopPropagation, hijacking
    // the page scroll whenever the cursor sits over the canvas. We
    // can't disable pointer-events (that breaks the mouseenter flow
    // animation). Instead, register a window-level capture-phase
    // listener that fires BEFORE #tb-root's, calls stopPropagation,
    // and never preventDefaults — so #tb-root's handlers never see
    // the event and the browser's default scroll proceeds. Pointer
    // events on the canvas (mouseenter / mousedown / etc.) still
    // reach #tb-root because stopPropagation only fires for wheel.
    const win = iframe.contentWindow
    if (win && !win.__yuktiWheelPatched) {
      const passthrough = (ev) => {
        const tb = doc.getElementById('tb-root')
        if (!tb) return
        const t = ev.target
        if (t && (t === tb || tb.contains(t))) {
          ev.stopPropagation()
        }
      }
      win.addEventListener('wheel', passthrough, { capture: true, passive: true })
      win.__yuktiWheelPatched = true
    }
  }

  return (
    <motion.div
      className="cs-panel"
      initial={false}
      animate={{ y: open ? '0%' : '100%' }}
      transition={{ duration: 1.05, ease }}
      aria-hidden={!open}
    >
      {isNative ? (
        <div className="cs-native" ref={nativeScrollRef}>
          {activeId === 'titan-crest' && <TitanCrest scrollRef={nativeScrollRef} />}
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          key={activeId || 'blank'}
          src={src}
          onLoad={handleLoad}
          className="cs-iframe"
          title="Case study"
        />
      )}
      <button
        className="cs-back"
        onClick={onClose}
        aria-label="Back to projects"
        type="button"
      >
        <span className="cs-back__icon" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </span>
        <span className="cs-back__label">Portfolio</span>
      </button>
    </motion.div>
  )
}
