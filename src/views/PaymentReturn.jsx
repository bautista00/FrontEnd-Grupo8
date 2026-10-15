import { Link, useParams, useSearchParams } from 'react-router-dom'

// Textos para cada estado de pago que devuelve el backend.
const MENSAJES = {
  APROBADO: {
    titulo: '¡Pago aprobado!',
    texto: 'Tu reserva está confirmada. Ya podés ver dónde retirar el auto en Mis reservas.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  PENDIENTE: {
    titulo: 'Pago pendiente',
    texto: 'Mercado Pago todavía está procesando el pago. Te avisaremos el resultado en Mis reservas.',
    color: 'bg-amber-50 text-amber-700',
  },
  RECHAZADO: {
    titulo: 'Pago rechazado',
    texto: 'Mercado Pago no aprobó el pago. Volvé al carrito para intentar una nueva reserva.',
    color: 'bg-red-50 text-red-700',
  },
}

export default function PaymentReturn() {
  // El backend nos redirige a /reservas/:idReserva?idPago=...&estadoPago=...
  const { idReserva } = useParams()
  const [parametros] = useSearchParams()
  const estadoPago = parametros.get('estadoPago')

  // Si no llegó un estado conocido, mostramos el caso pendiente.
  const datos = MENSAJES[estadoPago] || MENSAJES.PENDIENTE

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
      <header className="flex flex-col items-center text-center">
        <div className={`grid place-items-center w-14 h-14 mb-5 rounded-full text-[1.625rem] ${datos.color}`} aria-hidden="true">
          {estadoPago === 'APROBADO' ? '✓' : '!'}
        </div>
        <h1 className="text-[2.25rem] leading-[1.3] text-ink phone:text-[1.75rem]">{datos.titulo}</h1>
        <p className="max-w-[40rem] mt-3 text-[0.75rem] leading-[1.8] text-soft">{datos.texto}</p>

        {idReserva && (
          <div className="mt-6 px-5 py-3 bg-card border border-border rounded-lg text-[0.6875rem] phone:px-4">
            <span className="text-muted">Reserva <strong className="ml-2 text-ink">#{idReserva}</strong></span>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4 mt-6 text-[0.6875rem]">
          <Link to="/mis-reservas" className="text-soft hover:underline">Ir a Mis reservas</Link>
          <Link to={estadoPago === 'RECHAZADO' ? '/carrito' : '/'} className="text-soft hover:underline">
            {estadoPago === 'RECHAZADO' ? 'Volver al carrito' : 'Volver al inicio'}
          </Link>
        </div>
      </header>
    </main>
  )
}
