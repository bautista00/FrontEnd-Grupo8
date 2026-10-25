import { Link } from 'react-router-dom'

export default function CartNotice({ segundosRestantes, idPublicacion }) {
  // El tiempo llega por props desde el carrito.
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
    <div className={`flex items-center justify-between gap-4 p-4 mb-6 border rounded-md text-[0.75rem] phone:flex-wrap ${clasesAviso}`}>
      <p>{textoAviso}</p>
      {/* Al vencer volvemos al detalle de la misma publicación. */}
      {estaVencido ? (
        // Esta ruta se completará cuando esté disponible la vista de detalle.
        <Link to={`/publicaciones/${idPublicacion}`} className="flex shrink-0 items-center justify-center gap-2 w-auto px-3 py-2.25 bg-ink border border-ink rounded-sm text-[0.6875rem] text-white phone:w-full">
          Volver a elegir fechas
        </Link>
      ) : (
        <span className="font-bold tabular-nums whitespace-nowrap" aria-label={`Tiempo restante: ${minutos} minutos y ${segundos} segundos`}>
          {tiempoRestante}
        </span>
      )}
    </div>
  )
}
