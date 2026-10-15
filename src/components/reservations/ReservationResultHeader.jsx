export default function ReservationResultHeader({ reserva, pago }) {
  const estaConfirmada = reserva.estado === 'CONFIRMADA'
  const esEfectivo = pago.metodo === 'EFECTIVO'
  const pagoAprobado = pago.estado === 'APROBADO'

  // Efectivo aprobado no significa que la plataforma haya verificado el cobro.
  const mensaje = !estaConfirmada
    ? 'La reserva quedó pendiente. Podés consultar su estado en Mis reservas.'
    : esEfectivo
      ? 'Pagás en efectivo al retirar. Ya podés ver dónde retirar el auto.'
      : pagoAprobado
        ? 'El pago se aprobó. Ya podés ver dónde retirar el auto.'
        : 'La reserva está confirmada. Podés consultar el estado del pago en Mis reservas.'

  return (
    <header className="flex flex-col items-center text-center">
      <div className={`grid place-items-center w-14 h-14 mb-5 rounded-full ${estaConfirmada ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`} aria-hidden="true">
        {estaConfirmada ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 4 4L19 6" />
          </svg>
        ) : (
          <span className="text-[26px]">!</span>
        )}
      </div>
      <h1 className="text-[36px] leading-[1.3] text-ink phone:text-[28px]">
        {estaConfirmada ? '¡Tu reserva está confirmada!' : 'Reserva creada'}
      </h1>
      <p className="max-w-[640px] mt-3 text-[12px] leading-[1.8] text-soft">{mensaje}</p>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6 px-5 py-3 bg-card border border-border rounded-lg text-[11px] phone:px-4">
        {/* Mostramos el idReserva, sin inventar otro código. */}
        <span className="text-muted">Reserva <strong className="ml-2 text-ink">#{reserva.idReserva}</strong></span>
        <span className={`inline-flex items-center gap-1.5 ${estaConfirmada ? 'text-emerald-700' : 'text-amber-700'}`}>
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {estaConfirmada ? 'Confirmada' : 'Pendiente'}
          {' · '}
          {esEfectivo ? 'Efectivo al retirar' : pagoAprobado ? 'Pago aprobado' : 'Pago pendiente'}
        </span>
      </div>
    </header>
  )
}
