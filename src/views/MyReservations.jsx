/**
 * Carga las reservas del usuario y las organiza en próximas e historial.
 * Entrega los datos a las listas y tarjetas; el filtro utiliza la información ya cargada.
 */

import ReservationFilters from "../components/myReservations/ReservationFilters"
import ReservationHistory from "../components/myReservations/ReservationHistory"
import UpcomingReservations from "../components/myReservations/UpcomingReservations"
import EmptyReservations from "../components/myReservations/EmptyReservations"
import { useEffect, useState } from 'react'
import { API_URL } from '../utils/api'


export default function MyReservations() {
  const [filtroSeleccionado, actualizarFiltro] = useState('todas')

  const [reservas, actualizarReservas] = useState([])
  const [publicaciones, actualizarPublicaciones] = useState([])
  const [pagos, actualizarPagos] = useState([])
  const [mensaje, actualizarMensaje] = useState('')

  // Obtiene las reservas del usuario y los datos necesarios para mostrar sus tarjetas.
  useEffect(() => {
    const token = localStorage.getItem('jwtToken')

    actualizarMensaje('')

    const opciones = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

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
        const listaReservas = datosReservas.content

        // Evita consultar dos veces una publicación que aparece en varias reservas.
        const idsPublicaciones = [
          ...new Set(listaReservas.map((reserva) => reserva.idPublicacion))
        ]

        const pedidosPublicaciones = idsPublicaciones.map((idPublicacion) => {
          return fetch(
            `${API_URL}/publicaciones/${idPublicacion}`,
            opciones
          )
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
        })

        // Los pagos se consultan en paralelo con las publicaciones.
        const pedidosPagos = listaReservas.map((reserva) => {
          return fetch(
            `${API_URL}/pagos/reserva/${reserva.idReserva}`,
            opciones
          )
            .then((respuesta) => {
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

  // Estas listas se calculan con los datos cargados; cambiar el filtro no hace otro GET.
  const proximasReservas = reservas.filter((reserva) => reserva.estado === 'CONFIRMADA' || reserva.estado === 'PENDIENTE')
  const reservasHistorial = reservas.filter((reserva) => ['FINALIZADA', 'CANCELADA', 'RECHAZADA'].includes(reserva.estado))
  const hayReservasConfirmadas = proximasReservas.some((reserva) => reserva.estado === 'CONFIRMADA')

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16">
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

      <ReservationFilters hayReservasConfirmadas={hayReservasConfirmadas} filtroSeleccionado={filtroSeleccionado} alCambiar={actualizarFiltro}/>

      {!mensaje && (reservas.length === 0 ? (
        <EmptyReservations mensaje="Todavía no tenés reservas." />
      ) : (
        <>
          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'proximas') && (
            <UpcomingReservations reservas={proximasReservas} publicaciones={publicaciones} pagos={pagos} />
          )}

          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'historial') && (
            <ReservationHistory reservas={reservasHistorial} publicaciones={publicaciones} pagos={pagos} />
          )}
        </>
      ))}
    </main>
  )
}
