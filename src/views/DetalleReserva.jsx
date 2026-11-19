/**
 * Muestra la reserva elegida en Mis reservas y permite cancelarla o continuar su pago.
 * Recibe la selección por navegación y lee la reserva actualizada en Redux.
 */

import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import VehiculoSeleccionado from "../components/reservas/compartidos/VehiculoSeleccionado"
import ItinerarioReserva from "../components/reservas/compartidos/ItinerarioReserva"
import ResumenPagoReserva from "../components/detalleReserva/ResumenPagoReserva"
import GestionReserva from "../components/detalleReserva/GestionReserva"
import ConfirmarCancelacion from '../components/detalleReserva/ConfirmarCancelacion'
import { cancelarReserva, crearCheckout, limpiarErrorCancelar } from '../components/Redux/reservasSlice'

const ESTADOS_RESERVA = {
  PENDIENTE: { texto: 'Pendiente', clases: 'bg-amber-50 border-amber-200 text-amber-700' },
  CONFIRMADA: { texto: 'Confirmada', clases: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  RECHAZADA: { texto: 'Rechazada', clases: 'bg-red-50 border-red-200 text-red-700' },
  CANCELADA: { texto: 'Cancelada', clases: 'bg-red-50 border-red-200 text-red-700' },
  FINALIZADA: { texto: 'Finalizada', clases: 'bg-surface border-border text-muted' },
}

// La key inicia otro detalle al elegir una reserva diferente.
export default function DetalleReserva() {
  const ubicacion = useLocation()
  return <ReservationDetailsContent key={ubicacion.state?.reserva?.idReserva ?? 'sin-reserva'} ubicacion={ubicacion} />
}

function ReservationDetailsContent({ ubicacion }) {
  const dispatch = useDispatch()
  const { reservas, loadingCheckout, errorCheckout, idPagoCheckout, cancelando, errorCancelar, idReservaCancelar } = useSelector((state) => state.reservas)
  const vigente = useRef(false)

  const reservaRecibida = ubicacion.state?.reserva
  const idReserva = reservaRecibida?.idReserva
  const reserva = reservas.find((item) => String(item.idReserva) === String(idReserva)) ?? reservaRecibida ?? null
  const vehiculo = ubicacion.state?.publicacion
  const pago = ubicacion.state?.pago
  const [mensaje, actualizarMensaje] = useState('')

  const [mostrarModalCancelar, actualizarModalCancelar] = useState(false)
  const mensajeCancelar = String(idReservaCancelar) === String(idReserva) ? errorCancelar : null

  const continuandoPago = loadingCheckout
  const mensajePago = String(idPagoCheckout) === String(pago?.idPago) ? errorCheckout : null

  // Evita abrir Mercado Pago o cerrar el modal si el usuario ya salió de este detalle.
  useEffect(() => {
    vigente.current = true
    return () => { vigente.current = false }
  }, [])

  const puedeContinuarPago =
    reserva?.estado === 'PENDIENTE' &&
    pago?.metodo === 'MERCADO_PAGO' &&
    pago?.estado === 'PENDIENTE'

  // Se pasa a GestionReserva como alContinuarPago y usa el pago que ya existe.
  const continuarPago = async () => {
    if (
      !puedeContinuarPago ||
      continuandoPago ||
      cancelando ||
      mostrarModalCancelar
    ) return

    try {
      const checkout = await dispatch(crearCheckout({ idPago: pago.idPago })).unwrap()
      if (vigente.current) window.location.href = checkout.initPoint
    } catch {
      // GestionReserva muestra el mensaje del backend guardado en el slice.
    }
  }

  const abrirModalCancelar = () => {
    if (cancelando || continuandoPago) return

    actualizarMensaje('')
    dispatch(limpiarErrorCancelar())
    actualizarModalCancelar(true)
  }

  const cerrarModalCancelar = () => {
    if (cancelando) return

    dispatch(limpiarErrorCancelar())
    actualizarModalCancelar(false)
  }

  // Se pasa al modal como alConfirmar; Redux guarda la reserva devuelta por el backend.
  const confirmarCancelacion = async () => {
    if (!idReserva || cancelando || continuandoPago) return

    try {
      await dispatch(cancelarReserva({ idReserva })).unwrap()
      if (!vigente.current) return
      actualizarModalCancelar(false)
      actualizarMensaje('Tu reserva se canceló correctamente.')
    } catch {
      // El modal conserva el mensaje de error guardado en Redux.
    }
  }

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
          <VehiculoSeleccionado vehiculo={vehiculo} titulo="Vehículo reservado" />
          <ItinerarioReserva datos={reserva} publicacion={vehiculo} mostrarMapa />
        </div>
        <aside className="min-w-0">
          <ResumenPagoReserva reserva={reserva} pago={pago} />
          <GestionReserva
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
        <ConfirmarCancelacion
          reserva={reserva}
          alCerrar={cerrarModalCancelar}
          alConfirmar={confirmarCancelacion}
          cancelando={cancelando}
          mensaje={mensajeCancelar}
        />
      )}
    </main>
  )
}
