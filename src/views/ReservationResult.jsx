import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ReservationResultHeader from '../components/reservations/ReservationResultHeader'
import ReservedVehicleSummary from '../components/reservations/ReservedVehicleSummary'
import PickupInstructions from '../components/reservations/PickupInstructions'

export default function ReservationResult() {
  // Recibimos los datos enviados desde ConfirmReservation.
  const ubicacion = useLocation()
  const carrito = ubicacion.state?.carrito
  const confirmacion = ubicacion.state?.confirmacion
  const metodoPago = ubicacion.state?.metodoPago

  const idReserva = confirmacion?.idReserva
  const idPublicacion = carrito?.idPublicacion

  // Solo consultaremos la publicación después de confirmar.
  const [publicacion, actualizarPublicacion] = useState(null)
  const [mensaje, actualizarMensaje] = useState('')

  useEffect(() => {
    if (!idReserva || !idPublicacion) return

    const token = localStorage.getItem('jwtToken')
    if (!token) {
      actualizarMensaje('Necesitás iniciar sesión para consultar tu reserva.')
      return
    }

    actualizarMensaje('')

    // Obtenemos la ubicación que el backend autoriza tras confirmar.
    fetch(`http://localhost:8080/publicaciones/${idPublicacion}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
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
      })
      .catch((error) => {
        console.error('Error al cargar la publicación:', error)
        actualizarMensaje(
          error instanceof TypeError
            ? 'No pudimos conectar con el servidor. Intentá nuevamente.'
            : error.message || 'No pudimos cargar la publicación.'
        )
      })
  }, [idReserva, idPublicacion])

  // Comprobamos los datos antes de usarlos.
  if (!carrito || !confirmacion || !metodoPago || !publicacion) {
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

  // Combinamos las fechas y precios con el estado confirmado por el backend.
  const reserva = {
    idReserva: confirmacion.idReserva,
    idPublicacion: carrito.idPublicacion,
    estado: confirmacion.estadoReserva,
    fechaInicio: carrito.fechaInicio,
    fechaFin: carrito.fechaFin,
    cantidadDias: carrito.cantidadDias,
    precioDiaAplicado: carrito.precioDiaAplicado,
    precioTotal: confirmacion.monto
  }

  // El estado y el monto del pago también vienen del backend.
  const pago = {
    idPago: confirmacion.idPago,
    idReserva: confirmacion.idReserva,
    estado: confirmacion.estadoPago,
    metodo: metodoPago,
    monto: confirmacion.monto
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
