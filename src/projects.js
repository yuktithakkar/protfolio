/* One record per case study — the single source of truth for how a project
   is named and numbered anywhere on the site.

   Before this existed the same three projects carried three different
   numberings (landing cards, the Selected Work index, and the "Case Study
   NN" label baked into each case-study HTML file all disagreed) and
   TestBench was spelled three different ways. The numbers here match the
   ones already authored inside public/case-studies/*.html, so the order is
   fixed by those files, not by taste.

   Names are stored in their natural case; anywhere the design calls for
   caps, CSS does it with text-transform. */
const PROJECTS = [
  {
    id: 'testbench',
    num: '01',
    name: 'TestBench',
    discipline: 'Product Design · AI',   // shown on the landing card
    sub: 'AI evaluation platform',       // shown in the Selected Work index
    meta: 'Under NDA · 2024',            // shown in the case-study header
    glass: 'rgba(170, 190, 152, 0.40)',  // sage
    thumb: '/landing-cards/test-1.png',
    imgExpanded: '/landing-cards/test-3.png',
  },
  {
    id: 'comms',
    num: '02',
    name: 'Communication Center',
    discipline: 'UX · SaaS',
    sub: 'IP lifecycle SaaS',
    meta: 'ADP · Enterprise web',
    glass: 'rgba(160, 176, 214, 0.40)',  // periwinkle
    thumb: '/landing-cards/comm-thumb.png',
    imgExpanded: '/landing-cards/comm-3.png',
  },
  {
    id: 'titan-crest',
    num: '03',
    name: 'Titan Crest 2.0',
    discipline: 'UI · Watch Faces',
    sub: 'Smartwatch face system',
    meta: 'Titan Company · 2024',
    glass: 'rgba(190, 172, 206, 0.40)',  // lilac
    thumb: '/landing-cards/crest-thumb.png',
    imgExpanded: '/landing-cards/crest-3.png',
  },
]

export const PROJECT_BY_ID = Object.fromEntries(PROJECTS.map((p) => [p.id, p]))

export default PROJECTS
