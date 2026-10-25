/**
 * Muestra una reserva próxima y avisa si tiene un pago pendiente de Mercado Pago.
 * El enlace envía la reserva, la publicación y el pago al detalle.
 */

import { Link } from 'react-router-dom'
import { CarIcon, MapPinIcon } from '../icons/Icons'
import { formatARS as formatearPrecio, formatearFecha } from '../../utils/formatters'

const ESTADOS_RESERVA = {
  PENDIENTE: { texto: 'Pendiente', clases: 'bg-amber-50 border-amber-200 text-amber-700' },
  CONFIRMADA: { texto: 'Confirmada', clases: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  RECHAZADA: { texto: 'Rechazada', clases: 'bg-red-50 border-red-200 text-red-700' },
  CANCELADA: { texto: 'Cancelada', clases: 'bg-red-50 border-red-200 text-red-700' },
  FINALIZADA: { texto: 'Finalizada', clases: 'bg-surface border-border text-muted' },
}

export default function UpcomingReservationCard({ reserva, publicacion, pago }) {
  const estadoVisual = ESTADOS_RESERVA[reserva.estado]
  const horaRetiro = publicacion.horaRetiroDevolucion
  const fechaCreacionTexto = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(reserva.fechaCreacion))

  const tienePagoPendiente =
    reserva.estado === 'PENDIENTE' &&
    pago?.metodo === 'MERCADO_PAGO' &&
    pago?.estado === 'PENDIENTE'

  return (
    <article className="min-w-0 p-6 bg-card border border-border rounded-lg phone:p-4" aria-labelledby={`reservation-${reserva.idReserva}-vehicle`}>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <span className={`inline-flex items-center gap-1.5 px-2 py-[0.1875rem] border rounded-[0.1875rem] text-[0.625rem] font-semibold ${estadoVisual.clases}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
          {estadoVisual.texto}
        </span>
        <p className="text-[0.625rem] text-muted">
          Reserva #{reserva.idReserva} · Realizada el {fechaCreacionTexto}
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.8fr)_minmax(13.75rem,1fr)] gap-6 tablet:grid-cols-1">
        <div className="relative grid place-items-center aspect-[8/5] min-h-[12.5rem] bg-surface rounded-[0.25rem] text-disabled tablet:aspect-auto">
          <span className="absolute top-3 left-3 px-2 py-1 bg-card rounded-[0.1875rem] text-[0.5625rem] uppercase text-ink">
            {publicacion.tipoVehiculo}
          </span>
          <CarIcon size={36} />
        </div>

        <div className="min-w-0 self-center">
          <h3 id={`reservation-${reserva.idReserva}-vehicle`} className="text-[1.5rem] leading-[1.3] text-ink phone:text-[1.375rem]">
            {publicacion.marca} {publicacion.modelo} {publicacion.anio}
          </h3>
          <p className="flex items-center gap-1.5 mt-2 text-[0.6875rem] text-muted">
            <MapPinIcon size={14} className="shrink-0 text-gold" />
            {publicacion.localidad}, {publicacion.zona}
          </p>

          <dl className="grid grid-cols-2 gap-4 mt-5 mb-0 p-4 bg-paper border border-border rounded-[0.25rem] phone:grid-cols-1">
            <div>
              <dt className="mb-1 text-[0.5625rem] uppercase text-muted">Retiro</dt>
              <dd className="m-0 text-[0.6875rem] leading-[1.6] text-ink">
                <time dateTime={reserva.fechaInicio}>{formatearFecha(reserva.fechaInicio)}</time>
                {horaRetiro && <span className="block text-muted">{horaRetiro.slice(0, 5)} hs</span>}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-[0.5625rem] uppercase text-muted">Devolución</dt>
              <dd className="m-0 text-[0.6875rem] leading-[1.6] text-ink">
                <time dateTime={reserva.fechaFin}>{formatearFecha(reserva.fechaFin)}</time>
                {horaRetiro && <span className="block text-muted">{horaRetiro.slice(0, 5)} hs</span>}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-[0.6875rem] text-muted">Duración: {reserva.cantidadDias} días</p>
        </div>

        <div className="flex flex-col justify-between gap-6 pl-6 border-l border-border tablet:pl-0 tablet:pt-4 tablet:border-l-0 tablet:border-t">
          <div>
            <p className="text-[0.5625rem] uppercase text-muted">Total</p>
            <p className="mt-1 text-ink">
              <strong className="font-serif text-[1.5rem]">{formatearPrecio(reserva.precioTotal)}</strong>
              <span className="ml-1 text-[0.625rem] text-muted">ARS</span>
            </p>
            <p className="mt-2 text-[0.6875rem] leading-[1.6] text-soft">
              {!pago
                ? 'Sin pago registrado'
                : pago.metodo === 'EFECTIVO'
                  ? 'Pago en efectivo'
                  : 'Pago con Mercado Pago'}
            </p>
            {tienePagoPendiente && (
              <p className="mt-2 text-[0.6875rem] leading-[1.6] text-amber-700">
                Tenés un pago pendiente de Mercado Pago. Entrá al detalle para continuar.
              </p>
            )}
          </div>

          <Link
            to="/mis-reservas/detalle"
            state={{ reserva, publicacion, pago }}
            className="flex items-center justify-center w-full px-4 py-3 bg-ink border-0 rounded-[0.25rem] text-[0.6875rem] text-white"
          >
            Ver detalle de reserva
          </Link>
        </div>
      </div>
    </article>
  )
}
