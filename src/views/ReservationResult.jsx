import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ReservationResultHeader from '../components/reservations/ReservationResultHeader'
import ReservedVehicleSummary from '../components/reservations/ReservedVehicleSummary'
import PickupInstructions from '../components/reservations/PickupInstructions'

export default function ReservationResult() {
  // Recibimos el ID enviado desde ConfirmReservation.
  const ubicacion = useLocation()
  const idReserva = ubicacion.state?.idReserva

  // Guardamos los datos que recibiremos del backend.
  const [reserva, actualizarReserva] = useState(null)
  const [pago, actualizarPago] = useState(null)
  const [publicacion, actualizarPublicacion] = useState(null)
  const [mensaje, actualizarMensaje] = useState('')

  useEffect(() => {
    // Sin identificador, no sabemos qué reserva consultar.
    if (!idReserva) return

    const token = localStorage.getItem('jwtToken')
    if (!token) {
      actualizarMensaje('Necesitás iniciar sesión para consultar tu reserva.')
      return
    }

    actualizarMensaje('')

    // Las tres consultas usan el mismo método y token.
    const opciones = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    // 1. Consultamos la reserva.
    fetch(`http://localhost:8080/reservas/${idReserva}`, opciones)
      .then((respuesta) => {
        if (respuesta.status === 204) {
          return Promise.reject(new Error('No se encontró la reserva.'))
        }

        if (!respuesta.ok) {
          return respuesta.json()
            .catch(() => ({}))
            .then((datosError) => {
              return Promise.reject(new Error(
                datosError.mensaje || 'No se pudo consultar la reserva.'
              ))
            })
        }

        return respuesta.json()
      })
      .then((datosReserva) => {
        // Guardamos la reserva recibida del backend.
        actualizarReserva(datosReserva)

        // 2. Usamos el idPublicacion recibido en la reserva.
        return fetch(
          `http://localhost:8080/publicaciones/${datosReserva.idPublicacion}`,
          opciones
        )
      })
      .then((respuesta) => {
        if (respuesta.status === 204) {
          return Promise.reject(new Error('No se pudo consultar la publicación.'))
        }

        if (!respuesta.ok) {
          return respuesta.json()
            .catch(() => ({}))
            .then((datosError) => {
              return Promise.reject(new Error(
                datosError.mensaje || 'No se pudo consultar la publicación.'
              ))
            })
        }

        return respuesta.json()
      })
      .then((datosPublicacion) => {
        actualizarPublicacion(datosPublicacion)

        // 3. Consultamos el pago asociado a esta reserva.
        return fetch(
          `http://localhost:8080/pagos/reserva/${idReserva}`,
          opciones
        )
      })
      .then((respuesta) => {
        if (respuesta.status === 204) {
          return Promise.reject(new Error('No se pudo consultar el pago.'))
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
        // La consola ayuda a revisar el error; el mensaje informa al usuario.
        console.error('Error al cargar el resultado de la reserva:', error)
        actualizarMensaje(
          error instanceof TypeError
            ? 'No pudimos conectar con el servidor. Intentá nuevamente.'
            : error.message || 'No pudimos cargar tu reserva.'
        )
      })
  }, [idReserva])

  if (!reserva || !pago || !publicacion) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) py-10">
        <h1 className="text-[1.875rem] text-ink">
          {idReserva ? 'Resultado de tu reserva' : 'No hay una reserva para mostrar.'}
        </h1>
        {mensaje && (
          <p role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 rounded-[0.25rem] text-[0.75rem] leading-[1.7] text-red-700">
            {mensaje}
          </p>
        )}
      </main>
    )
  }

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
      <ReservationResultHeader reserva={reserva} pago={pago} />

      <div className="grid grid-cols-2 items-start gap-8 mt-10 tablet:grid-cols-1 phone:gap-6 phone:mt-7">
        {/* La vista pasa a cada componente los datos que necesita. */}
        <ReservedVehicleSummary reserva={reserva} pago={pago} publicacion={publicacion} />
        <PickupInstructions reserva={reserva} publicacion={publicacion} />
      </div>
    </main>
  )
}
