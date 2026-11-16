/**
 * Muestra el resultado de la reserva usando los datos enviados desde la confirmación.
 * Consulta la publicación para obtener la ubicación autorizada después de reservar.
 */

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import EncabezadoResultadoReserva from '../components/resultadoReserva/EncabezadoResultadoReserva'
import ResumenVehiculoReservado from '../components/resultadoReserva/ResumenVehiculoReservado'
import InstruccionesRetiro from '../components/resultadoReserva/InstruccionesRetiro'
import { API_URL } from '../utils/api'

export default function ResultadoReserva() {
  const ubicacion = useLocation()
  const token = useSelector((state) => state.users.token)
  const carrito = ubicacion.state?.carrito
  const confirmacion = ubicacion.state?.confirmacion
  const metodoPago = ubicacion.state?.metodoPago

  const idReserva = confirmacion?.idReserva
  const idPublicacion = carrito?.idPublicacion

  const [publicacion, actualizarPublicacion] = useState(null)
  const [mensaje, actualizarMensaje] = useState('')

  // Obtiene la ubicación que el backend permite ver después de confirmar.
  useEffect(() => {
    if (!idReserva || !idPublicacion) return

    actualizarMensaje('')

    fetch(`${API_URL}/publicaciones/${idPublicacion}`, {
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
  }, [idReserva, idPublicacion, token])

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

  // Combina los datos del carrito con los identificadores y estados devueltos al confirmar.
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

  // Reutiliza la respuesta de confirmación; no crea ni consulta otro pago.
  const pago = {
    idPago: confirmacion.idPago,
    idReserva: confirmacion.idReserva,
    estado: confirmacion.estadoPago,
    metodo: metodoPago,
    monto: confirmacion.monto
  }

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
      <EncabezadoResultadoReserva reserva={reserva} pago={pago} />

      <div className="grid grid-cols-2 items-start gap-8 mt-10 tablet:grid-cols-1 phone:gap-6 phone:mt-7">
        <ResumenVehiculoReservado reserva={reserva} pago={pago} publicacion={publicacion} />
        <InstruccionesRetiro reserva={reserva} publicacion={publicacion} />
      </div>
    </main>
  )
}
