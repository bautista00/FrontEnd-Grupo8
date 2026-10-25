/**
 * Muestra las acciones disponibles para la reserva y los errores al continuar el pago.
 * Los botones llaman a las funciones recibidas del detalle.
 */

export default function ReservationManagement({
  reserva,
  fechaActual,
  alCancelar,
  puedeContinuarPago,
  alContinuarPago,
  continuandoPago,
  cancelando,
  mensajePago
}) {
  const puedeCancelar = reserva.estado === 'PENDIENTE'
    || (reserva.estado === 'CONFIRMADA' && reserva.fechaInicio > fechaActual)

  const mensajes = {
    PENDIENTE: 'Podés cancelar la reserva mientras esté pendiente.',
    CONFIRMADA: puedeCancelar
      ? 'Podés cancelar hasta el día anterior al retiro.'
      : 'Ya llegó la fecha de retiro. Esta reserva no se puede cancelar.',
    CANCELADA: 'Esta reserva ya fue cancelada.',
    RECHAZADA: 'Esta reserva fue rechazada y no se puede cancelar.',
    FINALIZADA: 'Esta reserva ya finalizó y no se puede cancelar.',
  }

  return (
    <section className="mt-6 p-6 bg-card border border-border rounded-lg phone:p-4.5" aria-labelledby="reservation-management-title">
      <h2 id="reservation-management-title" className="font-sans text-[0.625rem] leading-normal tracking-wider uppercase text-muted">
        Gestión de la reserva
      </h2>
      <p className="mt-3 text-[0.75rem] leading-[1.7] text-muted">
        {mensajes[reserva.estado] || 'Esta reserva no se puede cancelar.'}
      </p>

      {puedeContinuarPago && (
        <button
          type="button"
          onClick={alContinuarPago}
          disabled={continuandoPago || cancelando}
          className="w-full mt-4 px-4 py-3 bg-ink text-white rounded-sm text-[0.6875rem] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {continuandoPago ? 'Abriendo Mercado Pago...' : 'Continuar pago'}
        </button>
      )}

      {mensajePago && (
        <p role="alert" className="mt-3 text-[0.75rem] text-red-700">
          {mensajePago}
        </p>
      )}

      {puedeCancelar && (
        <button type="button" className="w-full mt-4 px-4 py-3 bg-card border border-red-200 rounded-sm text-[0.6875rem] text-red-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={alCancelar} disabled={continuandoPago || cancelando}>
          Cancelar reserva
        </button>
      )}
    </section>
  )
}
