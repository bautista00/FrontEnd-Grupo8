import { Link } from 'react-router-dom'
import { formatARS as formatearPrecio } from '../../utils/formatters'

export default function PaymentSummary({ carrito, metodoPago }) {
  // La selección llega desde la vista, igual que a PaymentMethod.
  const esMercadoPago = metodoPago === 'MERCADO_PAGO'
  const segundos = Math.max(0, carrito.segundosRestantes)
  const estaVencido = segundos === 0
  const minutos = Math.floor(segundos / 60)
  const segundosDelMinuto = String(segundos % 60).padStart(2, '0')

  return (
    <aside className="min-w-0 p-6 bg-card border border-border rounded-lg phone:p-[18px]" aria-labelledby="payment-summary-title">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 id="payment-summary-title" className="text-[20px] leading-[1.4] text-ink">Resumen del pago</h2>
        <span className="text-[11px] text-muted">{carrito.cantidadDias} días</span>
      </header>

      {/* Usamos los precios guardados en el carrito. */}
      <div className="flex flex-wrap justify-between gap-3 text-[11px] leading-[1.6] text-soft">
        <span>{carrito.cantidadDias} días × {formatearPrecio(carrito.precioDiaAplicado)}</span>
        <span>{formatearPrecio(carrito.precioTotal)}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-6 pt-4 border-t border-border text-[12px] text-ink">
        <strong>Total a pagar</strong>
        <div className="text-right">
          <strong className="font-serif text-[26px] leading-[1.4]">{formatearPrecio(carrito.precioTotal)}</strong>
          <span className="block text-[10px] text-muted">ARS</span>
        </div>
      </div>

      {/* El aviso y el botón cambian con el método elegido. */}
      <p className="p-3 bg-paper border border-border rounded-[4px] text-[11px] leading-[1.6] text-soft">
        {esMercadoPago
          ? 'Al confirmar, te llevaremos a Mercado Pago para completar el pago.'
          : 'La reserva quedará pendiente hasta que un administrador apruebe el pago en efectivo.'}
      </p>
      <p className="mt-3 p-3 border border-border rounded-[4px] text-[11px] leading-[1.6] text-soft">
        {estaVencido
          ? 'Tus fechas se liberaron. Volvé al carrito para retenerlas nuevamente.'
          : `Tus fechas siguen retenidas ${minutos}:${segundosDelMinuto} min.`}
      </p>

      {/* La confirmación se conectará al backend más adelante. */}
      <button type="button" className="w-full mt-4 px-4 py-3 bg-ink border-0 rounded-[4px] text-[11px] leading-[1.6] text-card disabled:cursor-not-allowed disabled:opacity-65" disabled>
        {estaVencido
          ? 'Volvé a retener las fechas'
          : esMercadoPago
            ? 'Confirmar e ir a Mercado Pago'
            : 'Confirmar reserva en efectivo'}
      </button>
      <Link to="/carrito" className="block mt-3 text-center text-[11px] text-muted hover:underline">Volver al carrito</Link>

      <p className="mt-4 pt-4 border-t border-border text-center text-[10px] leading-[1.6] text-muted">
        El total corresponde al precio por día aplicado al carrito.
      </p>
    </aside>
  )
}
