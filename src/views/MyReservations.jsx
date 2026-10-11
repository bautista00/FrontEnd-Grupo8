import ReservationFilters from "../components/reservations/ReservationFilters"
import ReservationHistory from "../components/reservations/ReservationHistory"
import UpcomingReservations from "../components/reservations/UpcomingReservations"
import EmptyReservations from "../components/reservations/EmptyReservations"
import { RESERVAS, PAGOS } from "../data/reservations"
import { VEHICULOS } from '../data/vehiculos'
import { useState } from "react"


export default function MyReservations() {
  const [filtroSeleccionado, actualizarFiltro] = useState('todas')
  // Agrupamos los ejemplos según el estado de la reserva.
  const proximasReservas = RESERVAS.filter((reserva) => reserva.estado === 'CONFIRMADA' || reserva.estado === 'PENDIENTE')
  const reservasHistorial = RESERVAS.filter((reserva) => ['FINALIZADA', 'CANCELADA', 'RECHAZADA'].includes(reserva.estado))
  const hayReservasConfirmadas = proximasReservas.some((reserva) => reserva.estado === 'CONFIRMADA')

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16">
      {/* Cabecera de la vista. */}
      <header className="mb-6">
        <h1 className="text-[36px] leading-[1.2] text-ink">
          Mis reservas
        </h1>
        <p className="mt-2 text-[12px] text-muted">
          Consultá el estado de tus alquileres, las fechas y los pagos.
        </p>
      </header>

      {/* La vista incorpora el componente que muestra los filtros. */}
      <ReservationFilters hayReservasConfirmadas={hayReservasConfirmadas} filtroSeleccionado={filtroSeleccionado} alCambiar={actualizarFiltro}/>

      {/* Si no hay reservas, mostramos un único aviso. */}
      {RESERVAS.length === 0 ? (
        <EmptyReservations mensaje="Todavía no tenés reservas." />
      ) : (
        <>
          {/* Todas y Próximas muestran los próximos alquileres. */}
          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'proximas') && (
            <UpcomingReservations reservas={proximasReservas} publicaciones={VEHICULOS} pagos={PAGOS} />
          )}

          {/* Todas e Historial muestran las reservas anteriores. */}
          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'historial') && (
            <ReservationHistory reservas={reservasHistorial} publicaciones={VEHICULOS} />
          )}
        </>
      )}
    </main>
  )
}
