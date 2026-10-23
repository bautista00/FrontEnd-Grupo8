import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_URL } from '../utils/api'

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
  // El backend nos redirige a /reservas/:idReserva después del pago.
  const { idReserva } = useParams()

  const [pago, actualizarPago] = useState(null)
  const [verificando, actualizarVerificando] = useState(true)
  const [mensaje, actualizarMensaje] = useState('')

  useEffect(() => {
    if (!idReserva) {
      actualizarMensaje('No pudimos identificar la reserva.')
      actualizarVerificando(false)
      return
    }

    const token = localStorage.getItem('jwtToken')

    actualizarVerificando(true)
    actualizarMensaje('')
    actualizarPago(null)

    // El resultado se obtiene del backend, no de los parámetros de la URL.
    fetch(`${API_URL}/pagos/reserva/${idReserva}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((respuesta) => {
        if (respuesta.status === 204) {
          return Promise.reject(
            new Error('No se recibieron los datos del pago.')
          )
        }

        if (!respuesta.ok) {
          return respuesta.json()
            .catch(() => ({}))
            .then((datosError) => {
              return Promise.reject(new Error(
                datosError.mensaje || 'No se pudo consultar el pago.'
              ))
            })
        }

        return respuesta.json()
      })
      .then((datosPago) => {
        actualizarPago(datosPago)
      })
      .catch((error) => {
        actualizarMensaje(
          error instanceof TypeError
            ? 'No pudimos conectar con el servidor. Intentá nuevamente.'
            : error.message || 'No se pudo consultar el pago.'
        )
      })
      .finally(() => {
        actualizarVerificando(false)
      })
  }, [idReserva])

  const estadoPago = pago?.estado
  const datos = MENSAJES[estadoPago]

  if (verificando || mensaje || !datos) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16">
        <h1 className="text-[2.25rem] text-ink">
          {verificando
            ? 'Verificando el pago…'
            : 'No pudimos verificar el pago'}
        </h1>

        {mensaje && (
          <p role="alert" className="mt-4 text-[0.75rem] text-error">
            {mensaje}
          </p>
        )}

        <Link
          to="/mis-reservas"
          className="inline-block mt-6 text-soft hover:underline"
        >
          Ir a Mis reservas
        </Link>
      </main>
    )
  }

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
