import { CarIcon, MapPinIcon } from '../icons/Icons'
import { formatARS as formatearPrecio, formatearFecha } from '../../utils/formatters'

export default function CartVehicle({ carrito, alQuitar }) {
  // Recibimos el carrito como prop y extraemos la publicación para acceder al auto.
  const vehiculo = carrito.publicacion

  return (
    <section className="flex min-w-0 gap-6 p-6 bg-card border border-border rounded-lg phone:flex-col phone:gap-4 phone:p-[18px]" aria-labelledby="cart-vehicle-title">
      <div className="flex flex-col shrink-0 items-center justify-center gap-2 w-[32%] min-h-[220px] bg-surface rounded-[4px] text-disabled phone:w-full phone:min-h-[160px]">
        <CarIcon size={36} />
        <span className="text-[10px] text-muted">Portada</span>
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[9px] tracking-[0.06em] uppercase text-gold">{vehiculo.tipoVehiculo}</span>
        <h2 id="cart-vehicle-title" className="mt-1.5 text-[22px] leading-[1.3] text-ink">
          {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
        </h2>
        <p className="flex items-center gap-1.5 mt-2 text-[11px] text-muted">
          <MapPinIcon size={14} className="shrink-0 text-gold" />
          {vehiculo.localidad}, {vehiculo.zona}
        </p>

        <dl className="grid grid-cols-3 gap-3 mt-5 mb-4 p-3 bg-paper border border-border rounded-[4px] phone:gap-2">
          <div>
            <dt className="mb-1.5 text-[9px] uppercase text-muted">Retiro</dt>
            <dd className="m-0 text-[11px] leading-[1.5]">{formatearFecha(carrito.fechaInicio)}</dd>
          </div>
          <div>
            <dt className="mb-1.5 text-[9px] uppercase text-muted">Devolución</dt>
            <dd className="m-0 text-[11px] leading-[1.5]">{formatearFecha(carrito.fechaFin)}</dd>
          </div>
          <div>
            <dt className="mb-1.5 text-[9px] uppercase text-muted">Duración</dt>
            <dd className="m-0 text-[11px] leading-[1.5]">{carrito.cantidadDias} días</dd>
          </div>
        </dl>

        <p className="flex flex-wrap items-baseline gap-2">
          <strong className="font-serif text-[20px] text-ink">{formatearPrecio(carrito.precioDiaAplicado)}</strong>
          <span className="text-[11px] text-muted">/ día</span>
        </p>

        <div className="flex justify-between gap-4 mt-4 pt-3 border-t border-border">
          <button type="button" className="p-0 bg-transparent border-0 text-[11px] text-muted underline disabled:cursor-not-allowed" disabled>Cambiar fechas</button>
          <button type="button" className="p-0 bg-transparent border-0 text-[11px] text-muted underline disabled:cursor-not-allowed" onClick={alQuitar}>Quitar</button>
        </div>
      </div>
    </section>
  )
}
