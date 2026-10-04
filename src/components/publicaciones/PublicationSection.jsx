export default function PublicationSection({ titulo, numero, accion, children, className = '' }) {
  return (
    <section className={'publication-section ' + className}>
      <div className="publication-section-heading">
        <h2>{numero && <span className="publication-section-number">{numero}</span>}{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  )
}
