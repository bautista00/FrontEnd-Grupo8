export default function PublicationSection({ titulo, numero, accion, children, className = 'border-border' }) {
  return (
    <section className={'p-6 bg-white border rounded-lg min-w-0 phone:p-[18px] ' + className}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-[18px] leading-7">{numero && <span className="grid place-items-center size-5 text-[11px] bg-paper border border-border rounded-full">{numero}</span>}{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  )
}
