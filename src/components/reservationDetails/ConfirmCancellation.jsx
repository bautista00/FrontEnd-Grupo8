export default function ConfirmCancellation({ reserva, alCerrar, alConfirmar, cancelando, mensaje }) {
  // Las fechas se reciben por props; usamos hora local para conservar el día.
  const formateadorFecha = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const fechaInicioTexto = formateadorFecha.format(new Date(reserva.fechaInicio + 'T12:00:00'))
  const fechaFinTexto = formateadorFecha.format(new Date(reserva.fechaFin + 'T12:00:00'))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-cancellation-title"
        aria-describedby="confirm-cancellation-description"
        className="relative w-full max-w-[35rem] max-h-[calc(100dvh-2rem)] overflow-y-auto p-8 bg-card border border-border rounded-lg shadow-md phone:p-6"
      >
        {/* La cruz cierra el modal igual que Mantener reserva. */}
        <button type="button" aria-label="Cerrar confirmación" className="absolute top-4 right-4 grid place-items-center w-8 h-8 p-0 bg-transparent border-0 text-[1.625rem] leading-none text-muted" onClick={alCerrar} disabled={cancelando}>
          <span aria-hidden="true">×</span>
        </button>

        <div className="grid place-items-center w-12 h-12 mb-6 bg-red-100 rounded-full text-red-700">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </div>

        <h2 id="confirm-cancellation-title" className="text-[1.625rem] leading-[1.3] text-ink phone:text-[1.4375rem]">
          ¿Cancelar la reserva?
        </h2>
        <p id="confirm-cancellation-description" className="mt-3 text-[0.8125rem] leading-[1.8] text-soft">
          Las fechas del {fechaInicioTexto} al {fechaFinTexto} quedan libres para otras personas. No se puede deshacer.
        </p>

        {mensaje && (
          <p role="alert" className="mt-4 text-[0.75rem] text-red-700">
            {mensaje}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 mt-8 phone:flex-col">
          <button type="button" className="px-5 py-3 bg-card border border-border rounded-[0.25rem] text-[0.75rem] text-soft" onClick={alCerrar} disabled={cancelando}>
            No, mantener reserva
          </button>
          <button type="button" className="px-5 py-3 bg-red-600 border border-red-600 rounded-[0.25rem] text-[0.75rem] text-white disabled:cursor-not-allowed" onClick={alConfirmar} disabled={cancelando}>
            {cancelando ? 'Cancelando...' : 'Sí, cancelar reserva'}
          </button>
        </div>
      </div>
    </div>
  )
}
