import UpcomingReservationCard from "./UpcomingReservationCard"
import EmptyReservations from "./EmptyReservations"

export default function UpcomingReservations({ reservas, publicaciones, pagos }) {
  return (
    <section className="mb-12" aria-labelledby="upcoming-reservations-title">
      <h2 id="upcoming-reservations-title" className="mb-4 text-[20px] leading-[1.4] text-ink">
        Próximos alquileres
      </h2>

      <div className="grid gap-4">
        {/* Una tarjeta por reserva, con sus datos relacionados por ID. */}
        {reservas.map((reserva) => {
          const publicacion = publicaciones.find((publicacion) => publicacion.idPublicacion === reserva.idPublicacion)
          const pago = pagos.find((pago) => pago.idReserva === reserva.idReserva)

          return (
            <UpcomingReservationCard
              key={reserva.idReserva}
              reserva={reserva}
              publicacion={publicacion}
              pago={pago}
            />
          )
        })}
      </div>

      {reservas.length === 0 && (
        <EmptyReservations mensaje="No tenés próximos alquileres." />
      )}
    </section>
  )
}
