import ReservationResultHeader from '../components/reservations/ReservationResultHeader'
import ReservedVehicleSummary from '../components/reservations/ReservedVehicleSummary'
import PickupInstructions from '../components/reservations/PickupInstructions'
import { RESERVAS, PAGOS } from '../data/reservations'
import { VEHICULOS } from '../data/vehiculos'

export default function ReservationResult() {
  // Ejemplo para la maqueta; después consultaremos la reserva creada en el backend.
  const reserva = RESERVAS.find((reserva) => reserva.estado === 'CONFIRMADA')
  const pago = PAGOS.find((pago) => pago.idReserva === reserva?.idReserva)
  const publicacion = VEHICULOS.find((publicacion) => publicacion.idPublicacion === reserva?.idPublicacion)

  if (!reserva || !pago || !publicacion) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) py-10">
        <h1 className="text-[1.875rem] text-ink">No hay una reserva para mostrar.</h1>
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
