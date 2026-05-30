/* Vertical-scroll Projets section that appears after the horizontal
   landing/card track. Content is intentionally blank per spec; just the
   layout shell so we can iterate on copy later. */
export default function Projets() {
  return (
    <section className="projets">
      <div className="projets__inner">
        <h2 className="projets__title">Projets</h2>
        <div className="projets__categories">
          <CategoryRow num="00" label="" />
          <CategoryRow num="01" label="" />
          <CategoryRow num="02" label="" />
          <CategoryRow num="03" label="" />
        </div>
        <p className="projets__copy" />
      </div>
    </section>
  )
}

function CategoryRow({ num, label }) {
  return (
    <div className="projets__row">
      <span className="projets__num">{num}</span>
      <span className="projets__label">{label}</span>
    </div>
  )
}
