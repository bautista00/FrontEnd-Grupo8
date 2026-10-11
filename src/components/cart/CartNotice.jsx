export default function CartNotice({ segundosRestantes }) {
  // El tiempo llega por props; todavía es simulado.
  const tiempo = Math.max(0, segundosRestantes)
  const estaVencido = tiempo === 0
  const estaPorVencer = tiempo > 0 && tiempo <= 120

  // Convertimos segundos al formato minutos:segundos.
  const minutos = Math.floor(tiempo / 60)
  const segundos = tiempo % 60
  const tiempoRestante = String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0')

  let clasesAviso = 'bg-card border-border text-soft'
  let textoAviso = 'Retenemos estas fechas para vos mientras confirmás.'

  // El mismo aviso cambia de texto y color según el tiempo.
  if (estaVencido) {
    clasesAviso = 'bg-[#fff3f3] border-[#ffcaca] text-error'
    textoAviso = 'Pasaron los 15 minutos y las fechas se liberaron.'
  } else if (estaPorVencer) {
    clasesAviso = 'bg-[#fff8e8] border-[#efd49a] text-gold'
    textoAviso = 'Te queda poco tiempo para confirmar estas fechas.'
  }

  return (
    <div className={`flex items-center justify-between gap-4 p-4 mb-6 border rounded-[6px] text-[12px] phone:flex-wrap ${clasesAviso}`}>
      <p>{textoAviso}</p>
      {/* Al vencer mostramos el botón en lugar del contador. */}
      {estaVencido ? (
        // Se habilitará cuando conectemos la retención al backend.
        <button type="button" className="flex shrink-0 items-center justify-center gap-2 w-auto px-3 py-[9px] bg-ink border border-ink rounded-[4px] text-[11px] text-white disabled:cursor-not-allowed phone:w-full" disabled>
          Volver a retener las fechas
        </button>
      ) : (
        <span className="font-bold tabular-nums whitespace-nowrap" aria-label={`Tiempo restante de ejemplo: ${minutos} minutos y ${segundos} segundos`}>
          {tiempoRestante}
        </span>
      )}
    </div>
  )
}
