export default function PaymentMethod({ metodoPago, alCambiar }) {
  return (
    <section className="min-w-0 mt-6 p-6 bg-card border border-border rounded-lg phone:p-[18px]">
      <h2 id="payment-method-title" className="text-[20px] leading-[1.4] text-ink">Método de pago</h2>
      <p className="mt-2 text-[11px] leading-[1.6] text-muted">Elegí cómo querés pagar la reserva.</p>

      {/* El mismo name agrupa las opciones: solo se elige una. */}
      <fieldset className="grid gap-3 min-w-0 mt-4 mx-0 mb-0 p-0 border-0" aria-labelledby="payment-method-title">
        <label className={`flex items-start gap-3 p-4 border rounded-[4px] cursor-pointer focus-within:outline-2 focus-within:outline-gold focus-within:outline-offset-2 ${metodoPago === 'MERCADO_PAGO' ? 'bg-paper border-soft' : 'border-border'}`}>
          <input
            type="radio"
            className="shrink-0 mt-[3px] mx-0 mb-0 accent-ink"
            name="metodoPago"
            value="MERCADO_PAGO"
            checked={metodoPago === 'MERCADO_PAGO'}
            // Avisamos a la vista para que actualice su estado.
            onChange={(evento) => alCambiar(evento.target.value)}
          />
          <span className="min-w-0">
            <span className="block text-[12px] font-semibold leading-[1.6] text-ink">Mercado Pago</span>
            <span className="block mt-1 text-[11px] leading-[1.6] text-muted">
              Tarjeta de crédito, débito o dinero en cuenta. Te llevaremos al checkout de Mercado Pago para completar el pago.
            </span>
          </span>
        </label>

        <label className={`flex items-start gap-3 p-4 border rounded-[4px] cursor-pointer focus-within:outline-2 focus-within:outline-gold focus-within:outline-offset-2 ${metodoPago === 'EFECTIVO' ? 'bg-paper border-soft' : 'border-border'}`}>
          <input
            type="radio"
            className="shrink-0 mt-[3px] mx-0 mb-0 accent-ink"
            name="metodoPago"
            value="EFECTIVO"
            checked={metodoPago === 'EFECTIVO'}
            onChange={(evento) => alCambiar(evento.target.value)}
          />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span className="block text-[12px] font-semibold leading-[1.6] text-ink">Efectivo al retirar el auto</span>
              <span className="px-2 py-[3px] bg-surface rounded-[3px] text-[9px] uppercase text-soft">Requiere aprobación</span>
            </span>
            <span className="block mt-1 text-[11px] leading-[1.6] text-muted">
              Pagás el total en efectivo al retirar el auto. La reserva queda pendiente hasta que un administrador de Volanta la apruebe.
            </span>
          </span>
        </label>
      </fieldset>
    </section>
  )
}
