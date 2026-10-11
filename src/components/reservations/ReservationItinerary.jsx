import { CalendarIcon, MapPinIcon } from '../icons/Icons'
import { formatearFecha } from '../../utils/formatters'

// Carrito y reserva comparten los campos de fechas y duración.
export default function ReservationItinerary({ datos, publicacion, mostrarMapa = false }) {
  const horaRetiro = publicacion.horaRetiroDevolucion
  const mostrarDireccion = ['CONFIRMADA', 'FINALIZADA'].includes(datos.estado) && publicacion.direccion

  return (
    <section className="min-w-0 mt-6 p-6 bg-card border border-border rounded-lg phone:p-[18px]" aria-labelledby="reservation-itinerary-title">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="reservation-itinerary-title" className="flex items-center gap-2 text-[20px] leading-[1.4] text-ink">
          <CalendarIcon size={16} className="shrink-0 text-gold" />
          Itinerario y entrega
        </h2>
        <span className="text-[11px] text-muted">Duración: {datos.cantidadDias} días</span>
      </header>

      <dl className="grid grid-cols-2 gap-4 m-0 phone:grid-cols-1">
        <div className="p-4 bg-paper border border-border rounded-[4px]">
          <dt className="mb-2 text-[9px] uppercase text-muted">Retiro</dt>
          <dd className="m-0 text-[12px] leading-[1.6] text-ink">
            <time dateTime={datos.fechaInicio}>{formatearFecha(datos.fechaInicio)}</time>
            {/* El horario viene de la publicación. */}
            {horaRetiro && <span className="block text-[11px] text-soft">{horaRetiro.slice(0, 5)} hs</span>}
          </dd>
        </div>
        <div className="p-4 bg-paper border border-border rounded-[4px]">
          <dt className="mb-2 text-[9px] uppercase text-muted">Devolución</dt>
          <dd className="m-0 text-[12px] leading-[1.6] text-ink">
            <time dateTime={datos.fechaFin}>{formatearFecha(datos.fechaFin)}</time>
            {horaRetiro && <span className="block text-[11px] text-soft">{horaRetiro.slice(0, 5)} hs</span>}
          </dd>
        </div>
      </dl>

      {/* El detalle incluye una ubicación visual; todavía no es un mapa real. */}
      {mostrarMapa ? (
        <div className="relative min-h-[190px] mt-4 bg-surface border border-border rounded-[4px]">
          <div className="absolute top-7 left-1/2 -translate-x-1/2 grid place-items-center w-10 h-10 bg-ink rounded-full text-white">
            <MapPinIcon size={20} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-card border border-border rounded-[4px]">
            <h3 className="font-sans text-[11px] font-semibold leading-[1.6]">
              {mostrarDireccion ? publicacion.direccion : 'Punto de retiro y devolución'}
            </h3>
            <p className="mt-1 text-[11px] leading-[1.6] text-muted">{publicacion.localidad}, {publicacion.zona}</p>
            <p className="mt-1 text-[11px] leading-[1.6] text-muted">
              {mostrarDireccion ? 'Retiro y devolución en el mismo lugar.' : 'La dirección exacta se muestra cuando la reserva está confirmada.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 mt-4 p-4 bg-paper border border-border rounded-[4px]">
          <MapPinIcon size={16} className="shrink-0 text-gold" />
          <div>
            <h3 className="font-sans text-[11px] font-semibold leading-[1.6]">Punto de retiro y devolución</h3>
            <p className="mt-1 text-[11px] leading-[1.6] text-muted">{publicacion.localidad}, {publicacion.zona}</p>
            <p className="mt-1 text-[11px] leading-[1.6] text-muted">Retiro y devolución en el mismo lugar.</p>
          </div>
        </div>
      )}
    </section>
  )
}
