import ReservationFilters from "../components/reservations/ReservationFilters"
import ReservationHistory from "../components/reservations/ReservationHistory"
import UpcomingReservations from "../components/reservations/UpcomingReservations"
import EmptyReservations from "../components/reservations/EmptyReservations"
import { useEffect, useState } from 'react'
import { API_URL } from '../utils/api'


export default function MyReservations() {
  const [filtroSeleccionado, actualizarFiltro] = useState('todas')

  // Guarda la lista de reservas del usuario.
  const [reservas, actualizarReservas] = useState([])
  const [publicaciones, actualizarPublicaciones] = useState([])
  const [pagos, actualizarPagos] = useState([])
  const [mensaje, actualizarMensaje] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('jwtToken')

    if (!token) {
      // La redirección se agregará cuando exista la ruta del login.
      actualizarMensaje('Necesitás iniciar sesión para ver tus reservas.')
      return
    }

    actualizarMensaje('')

    const opciones = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    // El backend identifica al usuario por el token y devuelve sus reservas.
    fetch(`${API_URL}/reservas/mias`, opciones)
      .then((respuesta) => {
        if (!respuesta.ok) {
          return respuesta.json()
            .catch(() => ({}))
            .then((datosError) => {
              return Promise.reject(new Error(
                datosError.mensaje || 'No se pudieron consultar las reservas.'
              ))
            })
        }

        return respuesta.json()
      })
      .then((datosReservas) => {
        // El backend devuelve una página: la lista está en content.
        const listaReservas = datosReservas.content

        // Una misma publicación puede aparecer en varias reservas.
        const idsPublicaciones = [
          ...new Set(listaReservas.map((reserva) => reserva.idPublicacion))
        ]

        const pedidosPublicaciones = idsPublicaciones.map((idPublicacion) => {
          // Consultamos cada publicación una sola vez.
          return fetch(
            `${API_URL}/publicaciones/${idPublicacion}`,
            opciones
          )
            .then((respuesta) => {
              // Una respuesta 204 no tiene un mensaje ni un cuerpo JSON.
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
        })

        // Cada reserva conserva su propio pago, sin esperar a las publicaciones.
        const pedidosPagos = listaReservas.map((reserva) => {
          return fetch(
            `${API_URL}/pagos/reserva/${reserva.idReserva}`,
            opciones
          )
            .then((respuesta) => {
              // Una reserva sin pago no impide mostrar las demás.
              if (respuesta.status === 404) {
                return null
              }

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
        })

        return Promise.all([
          Promise.all(pedidosPublicaciones),
          Promise.all(pedidosPagos)
        ])
          .then(([publicacionesRecibidas, pagosRecibidos]) => {
            return {
              reservas: listaReservas,
              publicaciones: publicacionesRecibidas,
              pagos: pagosRecibidos
            }
          })
      })
      .then((datosCompletos) => {
        // Guardamos las tres listas para pasarlas a los componentes.
        actualizarReservas(datosCompletos.reservas)
        actualizarPublicaciones(datosCompletos.publicaciones)
        actualizarPagos(datosCompletos.pagos.filter((pago) => pago !== null))
      })
      .catch((error) => {
        console.error('Error al cargar las reservas:', error)
        actualizarMensaje(
          error instanceof TypeError
            ? 'No pudimos conectar con el servidor. Intentá nuevamente.'
            : error.message || 'No pudimos cargar tus reservas.'
        )
      })
  }, [])

  // Agrupamos las reservas recibidas del backend según su estado.
  const proximasReservas = reservas.filter((reserva) => reserva.estado === 'CONFIRMADA' || reserva.estado === 'PENDIENTE')
  const reservasHistorial = reservas.filter((reserva) => ['FINALIZADA', 'CANCELADA', 'RECHAZADA'].includes(reserva.estado))
  const hayReservasConfirmadas = proximasReservas.some((reserva) => reserva.estado === 'CONFIRMADA')

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16">
      {/* Cabecera de la vista. */}
      <header className="mb-6">
        <h1 className="text-[2.25rem] leading-[1.2] text-ink">
          Mis reservas
        </h1>
        <p className="mt-2 text-[0.75rem] text-muted">
          Consultá el estado de tus alquileres, las fechas y los pagos.
        </p>
      </header>

      {mensaje && (
        <p role="alert" className="mb-4 text-[0.75rem] text-error">
          {mensaje}
        </p>
      )}

      {/* La vista incorpora el componente que muestra los filtros. */}
      <ReservationFilters hayReservasConfirmadas={hayReservasConfirmadas} filtroSeleccionado={filtroSeleccionado} alCambiar={actualizarFiltro}/>

      {/* Mostramos la lista vacía solo si no hay un error de consulta o sesión. */}
      {!mensaje && (reservas.length === 0 ? (
        <EmptyReservations mensaje="Todavía no tenés reservas." />
      ) : (
        <>
          {/* Todas y Próximas muestran los próximos alquileres. */}
          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'proximas') && (
            <UpcomingReservations reservas={proximasReservas} publicaciones={publicaciones} pagos={pagos} />
          )}

          {/* Todas e Historial muestran las reservas anteriores. */}
          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'historial') && (
            <ReservationHistory reservas={reservasHistorial} publicaciones={publicaciones} pagos={pagos} />
          )}
        </>
      ))}
    </main>
  )
}
