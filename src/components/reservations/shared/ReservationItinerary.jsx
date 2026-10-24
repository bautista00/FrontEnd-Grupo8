import { CalendarIcon, MapPinIcon } from '../../icons/Icons'
import { formatearFecha } from '../../../utils/formatters'
import MapaPublicacion from '../../publicaciones/MapaPublicacion'

// Carrito y reserva comparten los campos de fechas y duración.
export default function ReservationItinerary({ datos, publicacion, mostrarMapa = false }) {
  const horaRetiro = publicacion.horaRetiroDevolucion
  const mostrarDireccion = ['CONFIRMADA', 'FINALIZADA'].includes(datos.estado) && publicacion.direccion

  return (
    <section className="min-w-0 mt-6 p-6 bg-card border border-border rounded-lg phone:p-[1.125rem]" aria-labelledby="reservation-itinerary-title">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="reservation-itinerary-title" className="flex items-center gap-2 text-[1.25rem] leading-[1.4] text-ink">
          <CalendarIcon size={16} className="shrink-0 text-gold" />
          Itinerario y entrega
        </h2>
        <span className="text-[0.6875rem] text-muted">Duración: {datos.cantidadDias} días</span>
      </header>

      <dl className="grid grid-cols-2 gap-4 m-0 phone:grid-cols-1">
        <div className="p-4 bg-paper border border-border rounded-[0.25rem]">
          <dt className="mb-2 text-[0.5625rem] uppercase text-muted">Retiro</dt>
          <dd className="m-0 text-[0.75rem] leading-[1.6] text-ink">
            <time dateTime={datos.fechaInicio}>{formatearFecha(datos.fechaInicio)}</time>
            {/* El horario viene de la publicación. */}
            {horaRetiro && <span className="block text-[0.6875rem] text-soft">{horaRetiro.slice(0, 5)} hs</span>}
          </dd>
        </div>
        <div className="p-4 bg-paper border border-border rounded-[0.25rem]">
          <dt className="mb-2 text-[0.5625rem] uppercase text-muted">Devolución</dt>
          <dd className="m-0 text-[0.75rem] leading-[1.6] text-ink">
            <time dateTime={datos.fechaFin}>{formatearFecha(datos.fechaFin)}</time>
            {horaRetiro && <span className="block text-[0.6875rem] text-soft">{horaRetiro.slice(0, 5)} hs</span>}
          </dd>
        </div>
      </dl>

      {/* Con la reserva confirmada se ve el punto exacto; si no, solo la zona aproximada. */}
      {mostrarMapa ? (
        <div className="mt-4">
          <MapaPublicacion latitud={publicacion.latitud} longitud={publicacion.longitud} exacta={Boolean(mostrarDireccion)} className="h-[13.75rem]" />
          <div className="mt-3 p-3 bg-card border border-border rounded-[0.25rem]">
            <h3 className="font-sans text-[0.6875rem] font-semibold leading-[1.6]">
              {mostrarDireccion ? publicacion.direccion : 'Punto de retiro y devolución'}
            </h3>
            <p className="mt-1 text-[0.6875rem] leading-[1.6] text-muted">{publicacion.localidad}, {publicacion.zona}</p>
            <p className="mt-1 text-[0.6875rem] leading-[1.6] text-muted">
              {mostrarDireccion ? 'Retiro y devolución en el mismo lugar.' : 'La dirección exacta se muestra cuando la reserva está confirmada.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 mt-4 p-4 bg-paper border border-border rounded-[0.25rem]">
          <MapPinIcon size={16} className="shrink-0 text-gold" />
          <div>
            <h3 className="font-sans text-[0.6875rem] font-semibold leading-[1.6]">Punto de retiro y devolución</h3>
            <p className="mt-1 text-[0.6875rem] leading-[1.6] text-muted">{publicacion.localidad}, {publicacion.zona}</p>
            <p className="mt-1 text-[0.6875rem] leading-[1.6] text-muted">Retiro y devolución en el mismo lugar.</p>
          </div>
        </div>
      )}
    </section>
  )
}
