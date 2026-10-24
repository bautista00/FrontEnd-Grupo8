/**
 * Muestra el importe del carrito y permite pasar a la confirmación con sus datos.
 */

import { Link, useNavigate } from 'react-router-dom'
import { ChevronRightIcon } from '../icons/Icons'
import { formatARS as formatearPrecio } from '../../utils/formatters'

export default function CartSummary({ carrito, estaVencido, bloqueado = false }) {
  const navegar = useNavigate()
  // Navega a la confirmación enviando el carrito. La reserva se crea en el paso siguiente.
  const continuarReserva = () => {
    if (bloqueado) return

    if (new Date(carrito.fechaExpiracion).getTime() <= Date.now()) return
    navegar('/carrito/confirmar', { state: { carrito } })
  }
  return (
    <section className="min-w-0 p-6 bg-card border border-border rounded-lg phone:p-[1.125rem]" aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title" className="mb-6 text-[1.25rem] text-ink">Resumen de reserva</h2>

      <div className="flex justify-between gap-4 text-[0.6875rem] leading-[1.6] text-soft">
        <span>{carrito.cantidadDias} días × {formatearPrecio(carrito.precioDiaAplicado)}</span>
        <span>{formatearPrecio(carrito.precioTotal)}</span>
      </div>

      <div className="flex items-baseline justify-between gap-4 mt-4 pt-5 border-t border-border text-[0.8125rem] text-ink">
        <strong>Total final</strong>
        <div className="text-right">
          <strong className="font-serif text-[1.5rem] phone:text-[1.375rem]">{formatearPrecio(carrito.precioTotal)}</strong>
          <span className="block mt-1 text-[0.5625rem] font-normal text-muted">ARS</span>
        </div>
      </div>

      <button type="button" onClick={continuarReserva} disabled={estaVencido || bloqueado} className={`flex items-center justify-center gap-2 w-full mt-6 px-4 py-3 border rounded-[0.25rem] text-[0.6875rem] disabled:cursor-not-allowed disabled:opacity-65 ${estaVencido ? 'bg-border border-border text-muted' : 'bg-ink border-ink text-white'}`}>
        {estaVencido ? 'Volvé a retener las fechas' : 'Continuar con la reserva'}
        {!estaVencido && <ChevronRightIcon size={14} />}
      </button>
      <Link to="/" className="block mt-4 text-center text-[0.625rem] leading-[1.6] text-soft hover:underline">Continuar explorando vehículos</Link>
    </section>
  )
}
