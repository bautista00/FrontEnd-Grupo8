import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SelectedVehicle from "../components/reservations/SelectedVehicle"
import ReservationItinerary from "../components/reservations/ReservationItinerary"
import ReservationPaymentSummary from "../components/reservations/ReservationPaymentSummary"
import ReservationManagement from "../components/reservations/ReservationManagement"
import ConfirmCancellation from '../components/reservations/ConfirmCancellation'

// Colores según los estados del backend.
const ESTADOS_RESERVA = {
  PENDIENTE: { texto: 'Pendiente', clases: 'bg-amber-50 border-amber-200 text-amber-700' },
  CONFIRMADA: { texto: 'Confirmada', clases: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  RECHAZADA: { texto: 'Rechazada', clases: 'bg-red-50 border-red-200 text-red-700' },
  CANCELADA: { texto: 'Cancelada', clases: 'bg-red-50 border-red-200 text-red-700' },
  FINALIZADA: { texto: 'Finalizada', clases: 'bg-surface border-border text-muted' },
}

export default function ReservationDetails() {
  // Guardamos los datos que recibimos del backend.
  const [reserva, actualizarReserva] = useState(null)
  const [vehiculo, actualizarVehiculo] = useState(null)
  const [pago, actualizarPago] = useState(null)
  const [mensaje, actualizarMensaje] = useState('')

  // Controla si aparece la confirmación de cancelación.
  const [mostrarModalCancelar, actualizarModalCancelar] = useState(false)
  const [cancelando, actualizarCancelando] = useState(false)
  const [mensajeCancelar, actualizarMensajeCancelar] = useState('')

  const abrirModalCancelar = () => {
    actualizarMensaje('')
    actualizarMensajeCancelar('')
    actualizarModalCancelar(true)
  }

  // Cerramos el modal sin modificar la reserva.
  const cerrarModalCancelar = () => {
    if (cancelando) return

    actualizarMensajeCancelar('')
    actualizarModalCancelar(false)
  }

  // Leemos el ID que envió el link de la tarjeta.
  const ubicacion = useLocation()
  const idReserva = ubicacion.state?.idReserva

  useEffect(() => {
    if (!idReserva) return

    const token = localStorage.getItem('jwtToken')

    if (!token) {
      actualizarMensaje('Necesitás iniciar sesión para consultar tu reserva.')
      return
    }

    actualizarMensaje('')

    const opciones = {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }

    // Primero consultamos la reserva para conocer su publicación.
    fetch(`http://localhost:8080/reservas/${idReserva}`, opciones)
      .then((respuesta) => {
        if (respuesta.status === 204) {
          throw new Error('No se encontró la reserva')
        }
        if (!respuesta.ok) {
          throw new Error('No se pudo consultar la reserva')
        }
        return respuesta.json()
      })
      .then((datosReserva) => {
        actualizarReserva(datosReserva)
        return fetch(`http://localhost:8080/publicaciones/${datosReserva.idPublicacion}`, opciones)
      })
      .then((respuesta) => {
        if (!respuesta.ok || respuesta.status === 204) {
          throw new Error('No se pudo consultar la publicación')
        }
        return respuesta.json()
      })
      .then((datosPublicacion) => {
        actualizarVehiculo(datosPublicacion)
        return fetch(`http://localhost:8080/pagos/reserva/${idReserva}`, opciones)
      })
      .then((respuesta) => {
        if (!respuesta.ok || respuesta.status === 204) {
          throw new Error('No se pudo consultar el pago')
        }
        return respuesta.json()
      })
      .then((datosPago) => {
        actualizarPago(datosPago)
      })
      .catch((error) => {
        console.error('Error al cargar el detalle de la reserva:', error)
        actualizarMensaje('No pudimos cargar todos los datos de tu reserva. Intentá nuevamente.')
      })
  }, [idReserva])

  const cancelarReserva = () => {
    if (cancelando) return

    const token = localStorage.getItem('jwtToken')

    if (!token) {
      actualizarMensajeCancelar('Necesitás iniciar sesión para cancelar tu reserva.')
      return
    }

    actualizarCancelando(true)
    actualizarMensajeCancelar('')

    // Consultamos qué usuario está realizando la cancelación.
    fetch('http://localhost:8080/usuarios/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((respuesta) => {
        if (!respuesta.ok || respuesta.status === 204) {
          throw new Error('No se pudo consultar el usuario')
        }

        return respuesta.json()
      })
      .then((datosUsuario) => {
        // Pedimos al backend que cambie el estado de la reserva.
        return fetch(
          `http://localhost:8080/reservas/${idReserva}/cancelar?idUsuario=${datosUsuario.idUsuario}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      })
      .then((respuesta) => {
        if (!respuesta.ok || respuesta.status === 204) {
          throw new Error('No se pudo cancelar la reserva')
        }

        return respuesta.json()
      })
      .then((reservaCancelada) => {
        // La respuesta contiene la reserva con su nuevo estado.
        actualizarReserva(reservaCancelada)
        actualizarModalCancelar(false)
        actualizarMensaje('Tu reserva se canceló correctamente.')
      })
      .catch((error) => {
        console.error('Error al cancelar la reserva:', error)
        actualizarMensajeCancelar('No pudimos cancelar tu reserva. Intentá nuevamente.')
      })
      .finally(() => {
        actualizarCancelando(false)
      })
  }

  if (!idReserva || !reserva || !vehiculo || !pago) {
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

  // Usamos la fecha local de hoy para evaluar si se puede cancelar.
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
      {/* Volvemos a la lista de reservas. */}
      <Link to="/mis-reservas" className="inline-flex items-center gap-2 mb-6 p-0 bg-transparent border-0 text-[0.6875rem] text-soft">
        <span aria-hidden="true">←</span>
        Volver a mis reservas
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Usamos idReserva, igual que en el backend. */}
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
          {/* Reutilizamos el componente de Confirmar reserva. */}
          <SelectedVehicle vehiculo={vehiculo} titulo="Vehículo reservado" />
          <ReservationItinerary datos={reserva} publicacion={vehiculo} mostrarMapa />
        </div>
        <aside className="min-w-0">
          <ReservationPaymentSummary reserva={reserva} pago={pago} />
          <ReservationManagement reserva={reserva} fechaActual={fechaActual} alCancelar={abrirModalCancelar} />
        </aside>
      </div>

      {/* Mostramos el modal con los datos de la reserva elegida. */}
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
