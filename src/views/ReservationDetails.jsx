/**
 * Muestra la reserva elegida en Mis reservas y permite cancelarla o continuar su pago.
 * Recibe la reserva, la publicación y el pago mediante la navegación.
 */

import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SelectedVehicle from "../components/reservations/shared/SelectedVehicle"
import ReservationItinerary from "../components/reservations/shared/ReservationItinerary"
import ReservationPaymentSummary from "../components/reservationDetails/ReservationPaymentSummary"
import ReservationManagement from "../components/reservationDetails/ReservationManagement"
import ConfirmCancellation from '../components/reservationDetails/ConfirmCancellation'
import { API_URL } from '../utils/api'

const ESTADOS_RESERVA = {
  PENDIENTE: { texto: 'Pendiente', clases: 'bg-amber-50 border-amber-200 text-amber-700' },
  CONFIRMADA: { texto: 'Confirmada', clases: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  RECHAZADA: { texto: 'Rechazada', clases: 'bg-red-50 border-red-200 text-red-700' },
  CANCELADA: { texto: 'Cancelada', clases: 'bg-red-50 border-red-200 text-red-700' },
  FINALIZADA: { texto: 'Finalizada', clases: 'bg-surface border-border text-muted' },
}

// La key inicia otro detalle al elegir una reserva diferente.
export default function ReservationDetails() {
  const ubicacion = useLocation()
  return <ReservationDetailsContent key={ubicacion.state?.reserva?.idReserva ?? 'sin-reserva'} ubicacion={ubicacion} />
}

function ReservationDetailsContent({ ubicacion }) {

  const [reserva, actualizarReserva] = useState(ubicacion.state?.reserva ?? null)
  const vehiculo = ubicacion.state?.publicacion
  const pago = ubicacion.state?.pago
  const idReserva = reserva?.idReserva
  const [mensaje, actualizarMensaje] = useState('')

  const [mostrarModalCancelar, actualizarModalCancelar] = useState(false)
  const [cancelando, actualizarCancelando] = useState(false)
  const [mensajeCancelar, actualizarMensajeCancelar] = useState('')
  // Reserva y sesión con las que se confirmó la cancelación.
  const [datosParaCancelar, actualizarDatosParaCancelar] = useState(null)

  // Pago existente que se abrirá en Mercado Pago al confirmar la acción.
  const [datosParaContinuarPago, actualizarDatosParaContinuarPago] = useState(null)
  const [continuandoPago, actualizarContinuandoPago] = useState(false)
  const [mensajePago, actualizarMensajePago] = useState('')

  const puedeContinuarPago =
    reserva?.estado === 'PENDIENTE' &&
    pago?.metodo === 'MERCADO_PAGO' &&
    pago?.estado === 'PENDIENTE'

  // Se pasa a ReservationManagement como alContinuarPago y prepara la solicitud del checkout.
  const continuarPago = () => {
    if (
      !puedeContinuarPago ||
      continuandoPago ||
      cancelando ||
      mostrarModalCancelar
    ) return

    actualizarContinuandoPago(true)
    actualizarMensajePago('')
    actualizarDatosParaContinuarPago({ idPago: pago.idPago, token: localStorage.getItem('jwtToken') })
  }

  // Obtiene el checkout del pago existente y abre Mercado Pago.
  useEffect(() => {
    if (datosParaContinuarPago === null) return

    let vigente = true
    const { idPago, token } = datosParaContinuarPago

    fetch(`${API_URL}/pagos/${idPago}/checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((respuesta) => {
        if (!respuesta.ok) {
          return respuesta.json()
            .catch(() => ({}))
            .then((datosError) => {
              return Promise.reject(new Error(
                datosError.mensaje || 'No se pudo continuar el pago.'
              ))
            })
        }

        return respuesta.json()
      })
      .then((checkout) => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        window.location.href = checkout.initPoint
      })
      .catch((error) => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        actualizarMensajePago(
          error instanceof TypeError
            ? 'No pudimos conectar con el servidor. Intentá nuevamente.'
            : error.message || 'No se pudo continuar el pago.'
        )
      })
      .finally(() => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        actualizarContinuandoPago(false)
        actualizarDatosParaContinuarPago(null)
      })
    return () => { vigente = false }
  }, [datosParaContinuarPago])

  const abrirModalCancelar = () => {
    if (cancelando || continuandoPago) return

    actualizarMensaje('')
    actualizarMensajeCancelar('')
    actualizarModalCancelar(true)
  }

  const cerrarModalCancelar = () => {
    if (cancelando) return

    actualizarMensajeCancelar('')
    actualizarModalCancelar(false)
  }

  // Se pasa al modal como alConfirmar y prepara el pedido de cancelación.
  const cancelarReserva = () => {
    if (cancelando || continuandoPago) return

    actualizarCancelando(true)
    actualizarMensajeCancelar('')

    actualizarDatosParaCancelar({ idReserva, token: localStorage.getItem('jwtToken') })
  }

  // Cancela la reserva y muestra su nuevo estado con la respuesta del backend.
  useEffect(() => {
    if (datosParaCancelar === null) return

    // Evita aplicar la cancelación a una pantalla o sesión que ya cambió.
    let vigente = true
    const { token, idReserva } = datosParaCancelar

    fetch(`${API_URL}/reservas/${idReserva}/cancelar`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((respuesta) => {
        if (respuesta.status === 204) {
          return Promise.reject(new Error('No se pudo cancelar la reserva.'))
        }
        if (!respuesta.ok) {
          return respuesta.json()
            .catch(() => ({}))
            .then((datosError) => {
              return Promise.reject(new Error(
                datosError.mensaje || 'No se pudo cancelar la reserva.'
              ))
            })
        }

        return respuesta.json()
      })
      .then((reservaCancelada) => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        actualizarReserva(reservaCancelada)
        actualizarModalCancelar(false)
        actualizarMensaje('Tu reserva se canceló correctamente.')
      })
      .catch((error) => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        console.error('Error al cancelar la reserva:', error)
        actualizarMensajeCancelar(
          error instanceof TypeError
            ? 'No pudimos conectar con el servidor. Intentá nuevamente.'
            : error.message || 'No pudimos cancelar tu reserva.'
        )
      })
      .finally(() => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        actualizarCancelando(false)
        actualizarDatosParaCancelar(null)
      })
    return () => { vigente = false }
  }, [datosParaCancelar])

  if (!idReserva || !reserva || !vehiculo) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16">
        <Link to="/mis-reservas" className="inline-flex items-center gap-2 mb-6 text-[0.6875rem] text-soft">
          <span aria-hidden="true">←</span>
          Volver a mis reservas
        </Link>
        <h1 className="text-[1.875rem] text-ink">
          {idReserva ? 'Detalle de tu reserva' : 'No hay una reserva para mostrar.'}
        </h1>
        {mensaje && (
          <p role="alert" className="mt-4 text-[0.75rem] text-red-700">{mensaje}</p>
        )}
      </main>
    )
  }

  const hoy = new Date()
  const fechaActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  const estadoVisual = ESTADOS_RESERVA[reserva.estado]
  const fechaCreacionTexto = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(reserva.fechaCreacion))

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
      <Link to="/mis-reservas" className="inline-flex items-center gap-2 mb-6 p-0 bg-transparent border-0 text-[0.6875rem] text-soft">
        <span aria-hidden="true">←</span>
        Volver a mis reservas
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[2.25rem] leading-[1.2] text-ink phone:text-[1.875rem]">
            Reserva #{reserva.idReserva}
          </h1>
          <span className={`inline-flex items-center gap-1.5 px-2 py-[0.1875rem] border rounded-[0.1875rem] text-[0.625rem] font-semibold ${estadoVisual.clases}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
            {estadoVisual.texto}
          </span>
        </div>

        <p className="text-[0.6875rem] text-muted">
          Realizada el <time dateTime={reserva.fechaCreacion}>{fechaCreacionTexto}</time>
        </p>
      </header>

      {mensaje && (
        <p role="status" className="mb-4 text-[0.75rem] text-emerald-700">
          {mensaje}
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-6 tablet:grid-cols-1">
        <div className="min-w-0">
          <SelectedVehicle vehiculo={vehiculo} titulo="Vehículo reservado" />
          <ReservationItinerary datos={reserva} publicacion={vehiculo} mostrarMapa />
        </div>
        <aside className="min-w-0">
          <ReservationPaymentSummary reserva={reserva} pago={pago} />
          <ReservationManagement
            reserva={reserva}
            fechaActual={fechaActual}
            alCancelar={abrirModalCancelar}
            puedeContinuarPago={puedeContinuarPago}
            alContinuarPago={continuarPago}
            continuandoPago={continuandoPago}
            cancelando={cancelando}
            mensajePago={mensajePago}
          />
        </aside>
      </div>

      {mostrarModalCancelar && (
        <ConfirmCancellation
          reserva={reserva}
          alCerrar={cerrarModalCancelar}
          alConfirmar={cancelarReserva}
          cancelando={cancelando}
          mensaje={mensajeCancelar}
        />
      )}
    </main>
  )
}
