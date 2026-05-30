/* Vertical projects section. After the horizontal card track ends with
   Pikko shifted to the left, this section continues the page: more
   project tiles stack vertically on the left while the Projets index
   stays sticky on the right.

   Visually the first tile (Pikko) picks up exactly where the horizontal
   phase left off — same width (~50vw), same green band, same image. */

const PROJECT_TILES = [
  {
    id: 'pikko',
    bg: '#93a786',
    img: 'https://picsum.photos/id/64/900/1400',
    year: '2025',
    type: 'E-COMMERCE',
    desc: 'MARQUE AUSTRALIENNE SPÉCIALISÉE DANS LA NUTRITION FÉLINE',
    title: 'Pikko',
  },
  {
    id: 'orlinski-editions',
    bg: '#1a1a1a',
    img: 'https://picsum.photos/id/96/1200/900',
    year: '2025',
    type: 'E-COMMERCE',
    desc: 'EDITIONS LIMITÉES DE SNEAKERS',
    title: 'Orlinski Editions',
    invert: true,
  },
  {
    id: 'ubac',
    bg: '#e8dfd0',
    img: 'https://picsum.photos/id/103/1200/900',
    year: '2024',
    type: 'E-COMMERCE',
    desc: 'SNEAKERS RECYCLÉES FABRIQUÉES EN FRANCE',
    title: 'Ubac',
  },
  {
    id: 'sanctuary',
    bg: '#1f2933',
    img: 'https://picsum.photos/id/180/1200/900',
    year: '2023',
    type: 'DIRECTION ARTISTIQUE',
    desc: 'EXPÉRIENCE IMMERSIVE',
    title: 'Sanctuary',
    invert: true,
  },
]

const INDEX_ROWS = [
  { n: '00', label: 'IDENTITÉ VISUELLE, CHARTE GRAPHIQUE, LOGO' },
  { n: '01', label: 'CRÉATION DE SITE VITRINE SUR MESURE' },
  { n: '02', label: 'DIRECTION ARTISTIQUE, WEBDESIGN, UX & UI' },
  { n: '03', label: 'E-COMMERCE SHOPIFY & PLATEFORME DE VENTE' },
]

export default function VerticalProjects() {
  return (
    <section className="vert">
      <div className="vert__left">
        {PROJECT_TILES.map((t) => <ProjectTile key={t.id} tile={t} />)}
      </div>
      <aside className="vert__right">
        <div className="vert__right-inner">
          <h2 className="vert__title">Projets</h2>
          <ul className="vert__index">
            {INDEX_ROWS.map((r) => (
              <li key={r.n} className="vert__index-row">
                <span className="vert__index-num">{r.n}</span>
                <span className="vert__index-label">{r.label}</span>
              </li>
            ))}
          </ul>
          <p className="vert__copy">
            La création et l’innovation sont au cœur de notre processus, avec
            l’envie de faire les choses différemment, toujours sur mesure.
            Allègrement, on dit non au déjà fait, au déjà vu, au déjà lu.
          </p>
        </div>
      </aside>
    </section>
  )
}

function ProjectTile({ tile }) {
  return (
    <article className={`vert-tile ${tile.invert ? 'vert-tile--invert' : ''}`}
             style={{ background: tile.bg }}>
      <div
        className="vert-tile__img"
        style={{ backgroundImage: `url(${tile.img})` }}
      />
      <div className="vert-tile__meta">
        <span className="vert-tile__year">{tile.year}</span>
        <span className="vert-tile__type">{tile.type}</span>
        <span className="vert-tile__desc">{tile.desc}</span>
      </div>
      <h3 className="vert-tile__title">{tile.title}</h3>
    </article>
  )
}
