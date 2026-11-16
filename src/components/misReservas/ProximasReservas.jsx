/**
 * Relaciona las próximas reservas con sus publicaciones y pagos y renderiza sus tarjetas.
 */

import TarjetaProximaReserva from "./TarjetaProximaReserva"
import SinReservas from "./SinReservas"

export default function ProximasReservas({ reservas, publicaciones, pagos }) {
  return (
    <section className="mb-12" aria-labelledby="upcoming-reservations-title">
      <h2 id="upcoming-reservations-title" className="mb-4 text-[1.25rem] leading-[1.4] text-ink">
        Próximos alquileres
      </h2>

      <div className="grid gap-4">
        {reservas.map((reserva) => {
          const publicacion = publicaciones.find((publicacion) => publicacion.idPublicacion === reserva.idPublicacion)
          const pago = pagos.find((pago) => pago.idReserva === reserva.idReserva)

          return (
            <TarjetaProximaReserva
              key={reserva.idReserva}
              reserva={reserva}
              publicacion={publicacion}
              pago={pago}
            />
          )
        })}
      </div>

      {reservas.length === 0 && (
        <SinReservas mensaje="No tenés próximos alquileres." />
      )}
    </section>
  )
}
