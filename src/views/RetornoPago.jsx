/**
 * Verifica el pago, su método y el estado actual de la reserva al volver de Mercado Pago.
 */

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { fetchPagoReserva } from '../components/Redux/reservasSlice'

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
    texto: 'Mercado Pago no aprobó el pago. Revisá el estado de la reserva en Mis reservas.',
    color: 'bg-red-50 text-red-700',
  },
}

const MENSAJES_RESERVA = {
  CANCELADA: {
    titulo: 'Reserva cancelada',
    texto: 'Esta reserva está cancelada. El estado del pago no cambia la cancelación.',
    color: 'bg-red-50 text-red-700',
  },
  RECHAZADA: {
    titulo: 'Reserva rechazada',
    texto: 'Esta reserva fue rechazada. Consultá tus reservas para ver su información.',
    color: 'bg-red-50 text-red-700',
  },
  FINALIZADA: {
    titulo: 'Alquiler finalizado',
    texto: 'Esta reserva ya finalizó. Podés consultar sus datos en Mis reservas.',
    color: 'bg-surface text-soft',
  },
}

export default function RetornoPago() {
  const { idReserva } = useParams()
  const dispatch = useDispatch()
  const token = useSelector((state) => state.users.token)
  const { pago: pagoGuardado, reservaPago, loadingPago, errorPago, idReservaPago } = useSelector((state) => state.reservas)
  const esEstaReserva = String(idReservaPago) === String(idReserva)
  const pago = esEstaReserva && pagoGuardado && String(pagoGuardado.idReserva) === String(idReserva) ? pagoGuardado : null
  const reserva = esEstaReserva && String(reservaPago?.idReserva) === String(idReserva) ? reservaPago : null
  const errorActual = esEstaReserva ? errorPago : null

  // Verifica ambos recursos en paralelo para no anunciar una reserva confirmada si está cancelada.
  useEffect(() => {
    if (!idReserva || !token) return
    dispatch(fetchPagoReserva(idReserva))
  }, [dispatch, idReserva, token])

  const mensaje = idReserva ? errorActual : 'No pudimos identificar la reserva.'
  const verificando = Boolean(idReserva) && (!esEstaReserva || loadingPago || ((!pago || !reserva) && !errorActual))

  // El resultado se decide con la respuesta del backend, no con un estado escrito en la URL.
  const estadoPago = pago?.estado
  let datos = MENSAJES_RESERVA[reserva?.estado]
  if (!datos && pago?.metodo === 'EFECTIVO') {
    datos = {
      titulo: reserva?.estado === 'CONFIRMADA' ? 'Reserva confirmada' : 'Reserva pendiente',
      texto: 'El método de pago elegido es efectivo al retirar el auto. Esta reserva no corresponde a un pago de Mercado Pago.',
      color: 'bg-surface text-soft',
    }
  } else if (!datos && pago?.metodo === 'MERCADO_PAGO') {
    datos = estadoPago === 'APROBADO' && reserva?.estado !== 'CONFIRMADA'
      ? {
        titulo: 'Pago aprobado · Reserva pendiente',
        texto: 'El pago fue aprobado, pero la reserva todavía figura pendiente. Consultá su estado en Mis reservas.',
        color: 'bg-amber-50 text-amber-700',
      }
      : MENSAJES[estadoPago]
  }

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
          {reserva.estado === 'CONFIRMADA' && estadoPago === 'APROBADO' ? '✓' : '!'}
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
          <Link to="/" className="text-soft hover:underline">Volver al inicio</Link>
        </div>
      </header>
    </main>
  )
}
