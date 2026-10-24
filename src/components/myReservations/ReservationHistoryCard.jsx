import { Link } from 'react-router-dom'
import { CarIcon } from '../icons/Icons'
import { formatARS as formatearPrecio, formatearFecha } from '../../utils/formatters'

export default function ReservationHistoryCard({ reserva, publicacion, pago }) {
  // Canceladas y rechazadas se distinguen de las finalizadas.
  const clasesEstado = ['CANCELADA', 'RECHAZADA'].includes(reserva.estado)
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-surface border-border text-muted'

  return (
    <article className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-4 p-4 bg-card border border-border rounded-lg phone:grid-cols-1" aria-labelledby={`history-${reserva.idReserva}-vehicle`}>
      <div className="grid place-items-center w-16 h-16 bg-surface rounded-[0.25rem] text-disabled">
        <CarIcon size={28} />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id={`history-${reserva.idReserva}-vehicle`} className="text-[1rem] leading-[1.4] text-ink">
            {publicacion.marca} {publicacion.modelo} {publicacion.anio}
          </h3>
          <span className={`px-2 py-[0.1875rem] border rounded-[0.1875rem] text-[0.5625rem] capitalize ${clasesEstado}`}>
            {reserva.estado.toLowerCase()}
          </span>
        </div>
        <p className="mt-1 text-[0.6875rem] leading-[1.6] text-muted">
          <time dateTime={reserva.fechaInicio}>{formatearFecha(reserva.fechaInicio)}</time>
          {' — '}
          <time dateTime={reserva.fechaFin}>{formatearFecha(reserva.fechaFin)}</time>
          {' · '}{reserva.cantidadDias} días
        </p>
        {/* Identificamos la reserva con el ID real del backend. */}
        <p className="mt-1 text-[0.625rem] text-muted">
          {publicacion.localidad}, {publicacion.zona} · Reserva #{reserva.idReserva}
        </p>
      </div>

      <div className="flex items-center gap-4 tablet:flex-col tablet:items-end tablet:gap-3 phone:items-start">
        <div className="text-right phone:text-left">
          <p className="text-[0.5625rem] uppercase text-muted">Total</p>
          <strong className="text-[0.8125rem] text-ink">{formatearPrecio(reserva.precioTotal)}</strong>
        </div>
        {/* Enviamos los datos de esta reserva a la vista de detalle. */}
        <Link
          to="/mis-reservas/detalle"
          state={{ reserva, publicacion, pago }}
          className="inline-flex items-center justify-center px-3 py-2 bg-transparent border border-border rounded-[0.1875rem] text-[0.625rem] text-soft"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  )
}
