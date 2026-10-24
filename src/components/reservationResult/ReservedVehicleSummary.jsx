/**
 * Muestra el vehículo reservado, las fechas y los importes recibidos desde el resultado.
 */

import { CarIcon, MapPinIcon } from '../icons/Icons'
import { formatARS as formatearPrecio, formatearFecha } from '../../utils/formatters'

export default function ReservedVehicleSummary({ reserva, pago, publicacion }) {
  const esEfectivo = pago.metodo === 'EFECTIVO'
  const pagoAprobado = pago.estado === 'APROBADO'
  const horaRetiro = publicacion.horaRetiroDevolucion?.slice(0, 5)
  // Acepta los dos nombres que pueden traer las respuestas del vehículo.
  const asientos = publicacion.asientos ?? publicacion.cantidadAsientos

  return (
    <section className="min-w-0 p-7 bg-card border border-border rounded-lg phone:p-5" aria-labelledby="reserved-vehicle-title">
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <p className="text-[0.625rem] tracking-[0.05em] uppercase text-muted">Vehículo reservado</p>
        <span className="text-[0.6875rem] text-gold">{publicacion.tipoVehiculo}</span>
      </div>

      <div className="flex items-center gap-5 phone:flex-col phone:items-start">
        <div className="grid place-items-center shrink-0 w-[8.75rem] h-[6.375rem] bg-surface rounded-[0.25rem] text-disabled phone:w-full phone:h-[9.375rem]">
          <CarIcon size={34} />
        </div>
        <div className="min-w-0">
          <h2 id="reserved-vehicle-title" className="text-[1.3125rem] leading-[1.4] text-ink">
            {publicacion.marca} {publicacion.modelo} {publicacion.anio}
          </h2>
          <p className="flex items-center gap-1.5 mt-2 text-[0.6875rem] leading-[1.6] text-muted">
            <MapPinIcon size={14} className="shrink-0 text-gold" />
            {publicacion.localidad}, {publicacion.zona}
          </p>
          <p className="mt-2 text-[0.6875rem] leading-[1.6] text-soft">
            {asientos} asientos{publicacion.color && ` · ${publicacion.color}`}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 mt-6 mb-0 pt-6 border-t border-border phone:grid-cols-1">
        <div className="p-4 bg-paper border border-border rounded-[0.25rem]">
          <dt className="mb-2 text-[0.5625rem] uppercase text-muted">Retiro</dt>
          <dd className="m-0 text-[0.75rem] leading-[1.7] text-ink">
            <time dateTime={reserva.fechaInicio}>{formatearFecha(reserva.fechaInicio)}</time>
            {horaRetiro && <span className="block text-[0.6875rem] text-muted">{horaRetiro} hs</span>}
          </dd>
        </div>
        <div className="p-4 bg-paper border border-border rounded-[0.25rem]">
          <dt className="mb-2 text-[0.5625rem] uppercase text-muted">Devolución</dt>
          <dd className="m-0 text-[0.75rem] leading-[1.7] text-ink">
            <time dateTime={reserva.fechaFin}>{formatearFecha(reserva.fechaFin)}</time>
            {horaRetiro && <span className="block text-[0.6875rem] text-muted">{horaRetiro} hs</span>}
          </dd>
        </div>
      </dl>

      <dl className="mt-6 mb-0 pt-5 border-t border-border text-[0.6875rem] leading-[1.7]">
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-muted">Método de pago</dt>
          <dd className="m-0 text-ink">{esEfectivo ? 'Efectivo al retirar' : 'Mercado Pago'}</dd>
        </div>
        {!esEfectivo && pago.mercadoPagoPaymentId && (
          <div className="flex flex-wrap justify-between gap-2 mt-2">
            <dt className="text-muted">Operación de Mercado Pago</dt>
            <dd className="m-0 text-ink">#{pago.mercadoPagoPaymentId}</dd>
          </div>
        )}
      </dl>

      <div className="flex flex-wrap items-start justify-between gap-3 mt-4 pt-5 border-t border-border">
        <div>
          <strong className="text-[0.8125rem] text-ink">
            {esEfectivo ? 'Total a pagar al retirar' : pagoAprobado ? 'Total abonado' : 'Total de la reserva'}
          </strong>
          <p className="mt-1 text-[0.625rem] leading-[1.6] text-muted">
            {reserva.cantidadDias} días × {formatearPrecio(reserva.precioDiaAplicado)}
          </p>
        </div>
        <div className="text-right">
          <strong className="font-serif text-[1.5625rem] text-ink">{formatearPrecio(reserva.precioTotal)}</strong>
          <span className="block mt-1 text-[0.625rem] text-muted">ARS</span>
        </div>
      </div>
    </section>
  )
}
