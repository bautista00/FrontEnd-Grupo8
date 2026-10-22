import ReservationFilters from "../components/reservations/ReservationFilters"
import ReservationHistory from "../components/reservations/ReservationHistory"
import UpcomingReservations from "../components/reservations/UpcomingReservations"
import EmptyReservations from "../components/reservations/EmptyReservations"
import { useEffect, useState } from 'react'


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

    // 1. Consultamos quién es el usuario de esta sesión.
    fetch('http://localhost:8080/usuarios/me', opciones)
      .then((respuesta) => {
        if (!respuesta.ok) {
          return respuesta.json()
            .catch(() => ({}))
            .then((datosError) => {
              return Promise.reject(new Error(
                datosError.mensaje || 'No se pudo consultar el usuario.'
              ))
            })
        }

        return respuesta.json()
      })
      .then((datosUsuario) => {
        // 2. Usamos su ID para consultar sus reservas.
        return fetch(
          `http://localhost:8080/reservas/usuario/${datosUsuario.idUsuario}`,
          opciones
        )
      })
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

        // Esperamos los datos relacionados de todas las reservas.
        return Promise.all(
          listaReservas.map((reserva) => {
            // Consultamos la publicación de esta reserva.
            return fetch(
              `http://localhost:8080/publicaciones/${reserva.idPublicacion}`,
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
              .then((publicacion) => {
                // Consultamos el pago de esta misma reserva.
                return fetch(
                  `http://localhost:8080/pagos/reserva/${reserva.idReserva}`,
                  opciones
                )
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
                  .then((pago) => {
                    return { reserva, publicacion, pago }
                  })
              })
          })
        )
      })
      .then((datosCompletos) => {
        // Guardamos las tres listas para pasarlas a los componentes.
        actualizarReservas(datosCompletos.map((datos) => datos.reserva))
        actualizarPublicaciones(datosCompletos.map((datos) => datos.publicacion))
        actualizarPagos(datosCompletos.map((datos) => datos.pago))
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
