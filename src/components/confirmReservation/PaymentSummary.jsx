/**
 * Muestra el total y el tiempo restante; el botón llama a la función de confirmar recibida.
 */

import { Link } from 'react-router-dom'
import { formatARS as formatearPrecio } from '../../utils/formatters'

export default function PaymentSummary({ carrito, metodoPago, alConfirmar, confirmando = false, reservaCreada = false }) {
  const esMercadoPago = metodoPago === 'MERCADO_PAGO'
  const segundos = Math.max(0, carrito.segundosRestantes)
  const estaVencido = segundos === 0
  const minutos = Math.floor(segundos / 60)
  const segundosDelMinuto = String(segundos % 60).padStart(2, '0')

  return (
    <aside className="min-w-0 p-6 bg-card border border-border rounded-lg phone:p-[1.125rem]" aria-labelledby="payment-summary-title">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 id="payment-summary-title" className="text-[1.25rem] leading-[1.4] text-ink">Resumen del pago</h2>
        <span className="text-[0.6875rem] text-muted">{carrito.cantidadDias} días</span>
      </header>

      <div className="flex flex-wrap justify-between gap-3 text-[0.6875rem] leading-[1.6] text-soft">
        <span>{carrito.cantidadDias} días × {formatearPrecio(carrito.precioDiaAplicado)}</span>
        <span>{formatearPrecio(carrito.precioTotal)}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-6 pt-4 border-t border-border text-[0.75rem] text-ink">
        <strong>Total a pagar</strong>
        <div className="text-right">
          <strong className="font-serif text-[1.625rem] leading-[1.4]">{formatearPrecio(carrito.precioTotal)}</strong>
          <span className="block text-[0.625rem] text-muted">ARS</span>
        </div>
      </div>

      <p className="p-3 bg-paper border border-border rounded-[0.25rem] text-[0.6875rem] leading-[1.6] text-soft">
        {esMercadoPago
          ? 'Al confirmar, te llevaremos a Mercado Pago para completar el pago.'
          : 'Al confirmar, tu reserva quedará confirmada automáticamente. Pagás el total en efectivo al retirar el auto.'}
      </p>
      <p className="mt-3 p-3 border border-border rounded-[0.25rem] text-[0.6875rem] leading-[1.6] text-soft">
        {estaVencido
          ? 'Tus fechas se liberaron. Volvé al carrito para retenerlas nuevamente.'
          : `Tus fechas siguen retenidas ${minutos}:${segundosDelMinuto} min.`}
      </p>

      <button type="button" onClick={alConfirmar} className="w-full mt-4 px-4 py-3 bg-ink border-0 rounded-[0.25rem] text-[0.6875rem] leading-[1.6] text-card disabled:cursor-not-allowed disabled:opacity-65" disabled={estaVencido || confirmando || reservaCreada}>
        {confirmando
          ? 'Confirmando...'
          : reservaCreada
            ? 'Reserva creada'
            : estaVencido
              ? 'Volvé a retener las fechas'
              : esMercadoPago
                ? 'Confirmar e ir a Mercado Pago'
                : 'Confirmar reserva en efectivo'}
      </button>
      <Link to="/carrito" className="block mt-3 text-center text-[0.6875rem] text-muted hover:underline">Volver al carrito</Link>

      <p className="mt-4 pt-4 border-t border-border text-center text-[0.625rem] leading-[1.6] text-muted">
        El total corresponde al precio por día aplicado al carrito.
      </p>
    </aside>
  )
}
