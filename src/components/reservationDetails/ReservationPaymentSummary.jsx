/**
 * Muestra los importes de la reserva y el método del pago recibido.
 */

import { formatARS as formatearPrecio } from '../../utils/formatters'

const METODOS_PAGO = {
  EFECTIVO: 'Efectivo',
  MERCADO_PAGO: 'Mercado Pago',
}

export default function ReservationPaymentSummary({ reserva, pago }) {
  return (
    <section className="min-w-0 p-6 bg-card border border-border rounded-lg phone:p-4.5" aria-labelledby="reservation-payment-summary-title">
      <h2 id="reservation-payment-summary-title" className="mb-5 text-[1.25rem] leading-[1.4] text-ink">
        Resumen del pago
      </h2>

      <div className="flex flex-wrap justify-between gap-3 text-[0.6875rem] leading-[1.6] text-soft">
        <span>{reserva.cantidadDias} días × {formatearPrecio(reserva.precioDiaAplicado)}</span>
        <span>{formatearPrecio(reserva.precioTotal)}</span>
      </div>
      <p className="mt-2 text-[0.625rem] leading-[1.6] text-muted">
        Precio aplicado al momento de reservar.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-border text-[0.75rem] text-ink">
        <strong>Total</strong>
        <div className="text-right">
          <strong className="font-serif text-[1.625rem] leading-[1.4]">{formatearPrecio(reserva.precioTotal)}</strong>
          <span className="block text-[0.625rem] text-muted">ARS</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 p-3 bg-paper border border-border rounded-[0.25rem] text-[0.6875rem] leading-[1.6]">
        <span className="text-muted">Método de pago</span>
        <span className="text-ink">{pago ? METODOS_PAGO[pago.metodo] : 'No disponible'}</span>
      </div>
    </section>
  )
}
