export default function SeccionPublicacion({ titulo, numero, accion, children, className = 'border-border' }) {
  return (
    <section className={'p-6 bg-white border rounded-lg min-w-0 phone:p-[1.125rem] ' + className}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-[1.125rem] leading-7">{numero && <span className="grid shrink-0 place-items-center size-5 font-sans text-[0.6875rem] leading-none bg-paper border border-border rounded-full">{numero}</span>}{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  )
}
