import ReservationHistoryCard from "./ReservationHistoryCard"
import EmptyReservations from "./EmptyReservations"

export default function ReservationHistory({ reservas, publicaciones }) {
  return (
    <section aria-labelledby="reservation-history-title">
      <header className="flex items-center justify-between gap-3 mb-4">
        <h2 id="reservation-history-title" className="text-[1.25rem] leading-[1.4] text-ink">
          Historial de reservas
        </h2>
        <span className="text-[0.625rem] text-muted">
          {reservas.length} {reservas.length === 1 ? 'reserva' : 'reservas'}
        </span>
      </header>

      <div className="grid gap-3">
        {/* Repetimos la tarjeta para cada reserva del historial. */}
        {reservas.map((reserva) => {
          const publicacion = publicaciones.find((publicacion) => publicacion.idPublicacion === reserva.idPublicacion)

          return (
            <ReservationHistoryCard
              key={reserva.idReserva}
              reserva={reserva}
              publicacion={publicacion}
            />
          )
        })}
      </div>

      {reservas.length === 0 && (
        <EmptyReservations mensaje="Todavía no tenés reservas en el historial." />
      )}
    </section>
  )
}
