/**
 * Permite elegir efectivo o Mercado Pago y comunica la elección a la vista de confirmación.
 */

export default function PaymentMethod({ metodoPago, alCambiar, bloqueado = false }) {
  return (
    <section className="min-w-0 mt-6 p-6 bg-card border border-border rounded-lg phone:p-4.5">
      <h2 id="payment-method-title" className="text-[1.25rem] leading-[1.4] text-ink">Método de pago</h2>
      <p className="mt-2 text-[0.6875rem] leading-[1.6] text-muted">Elegí cómo querés pagar la reserva.</p>

      <fieldset disabled={bloqueado} className="grid gap-3 min-w-0 mt-4 mx-0 mb-0 p-0 border-0" aria-labelledby="payment-method-title">
        <label className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer focus-within:outline-2 focus-within:outline-gold focus-within:outline-offset-2 ${metodoPago === 'MERCADO_PAGO' ? 'bg-paper border-soft' : 'border-border'}`}>
          <input
            type="radio"
            className="shrink-0 mt-0.75 mx-0 mb-0 accent-ink"
            name="metodoPago"
            value="MERCADO_PAGO"
            checked={metodoPago === 'MERCADO_PAGO'}
            onChange={(evento) => alCambiar(evento.target.value)}
          />
          <span className="min-w-0">
            <span className="block text-[0.75rem] font-semibold leading-[1.6] text-ink">Mercado Pago</span>
            <span className="block mt-1 text-[0.6875rem] leading-[1.6] text-muted">
              Tarjeta de crédito, débito o dinero en cuenta. Te llevaremos al checkout de Mercado Pago para completar el pago.
            </span>
          </span>
        </label>

        <label className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer focus-within:outline-2 focus-within:outline-gold focus-within:outline-offset-2 ${metodoPago === 'EFECTIVO' ? 'bg-paper border-soft' : 'border-border'}`}>
          <input
            type="radio"
            className="shrink-0 mt-0.75 mx-0 mb-0 accent-ink"
            name="metodoPago"
            value="EFECTIVO"
            checked={metodoPago === 'EFECTIVO'}
            onChange={(evento) => alCambiar(evento.target.value)}
          />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span className="block text-[0.75rem] font-semibold leading-[1.6] text-ink">Efectivo al retirar el auto</span>
              <span className="px-2 py-0.75 bg-surface rounded-[0.1875rem] text-[0.5625rem] uppercase text-soft">Confirmación automática</span>
            </span>
            <span className="block mt-1 text-[0.6875rem] leading-[1.6] text-muted">
              La reserva se confirma automáticamente. Pagás el total en efectivo al retirar el auto.
            </span>
          </span>
        </label>
      </fieldset>
    </section>
  )
}
