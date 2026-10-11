export default function ReservationManagement({ reserva, fechaActual, alCancelar }) {
  // La confirmada se puede cancelar solo antes del día de retiro.
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
    <section className="mt-6 p-6 bg-card border border-border rounded-lg phone:p-[18px]" aria-labelledby="reservation-management-title">
      <h2 id="reservation-management-title" className="font-sans text-[10px] leading-[1.5] tracking-[0.05em] uppercase text-muted">
        Gestión de la reserva
      </h2>
      <p className="mt-3 text-[12px] leading-[1.7] text-muted">
        {mensajes[reserva.estado] || 'Esta reserva no se puede cancelar.'}
      </p>

      {/* Abrimos la confirmación solamente si se puede cancelar. */}
      {puedeCancelar && (
        <button type="button" className="w-full mt-4 px-4 py-3 bg-card border border-red-200 rounded-[4px] text-[11px] text-red-700" onClick={alCancelar}>
          Cancelar reserva
        </button>
      )}
    </section>
  )
}
