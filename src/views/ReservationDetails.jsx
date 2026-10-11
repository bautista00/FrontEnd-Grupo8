import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SelectedVehicle from "../components/reservations/SelectedVehicle"
import ReservationItinerary from "../components/reservations/ReservationItinerary"
import ReservationPaymentSummary from "../components/reservations/ReservationPaymentSummary"
import ReservationManagement from "../components/reservations/ReservationManagement"
import ConfirmCancellation from '../components/reservations/ConfirmCancellation'
import { RESERVAS, PAGOS } from "../data/reservations"
import { VEHICULOS } from '../data/vehiculos'

// Colores según los estados del backend.
const ESTADOS_RESERVA = {
  PENDIENTE: { texto: 'Pendiente', clases: 'bg-amber-50 border-amber-200 text-amber-700' },
  CONFIRMADA: { texto: 'Confirmada', clases: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  RECHAZADA: { texto: 'Rechazada', clases: 'bg-red-50 border-red-200 text-red-700' },
  CANCELADA: { texto: 'Cancelada', clases: 'bg-red-50 border-red-200 text-red-700' },
  FINALIZADA: { texto: 'Finalizada', clases: 'bg-surface border-border text-muted' },
}

export default function ReservationDetails() {
  // Controla si aparece la confirmación de cancelación.
  const [mostrarModalCancelar, actualizarModalCancelar] = useState(false)

  const abrirModalCancelar = () => {
    actualizarModalCancelar(true)
  }

  // Cerramos el modal sin modificar la reserva.
  const cerrarModalCancelar = () => {
    actualizarModalCancelar(false)
  }

  // Leemos el ID que envió el link de la tarjeta.
  const ubicacion = useLocation()
  const idReserva = ubicacion.state?.idReserva
  // Buscamos la reserva seleccionada entre los ejemplos.
  const reserva = RESERVAS.find((reserva) => reserva.idReserva === idReserva)
  // Fecha fija para probar las condiciones de la maqueta.
  const fechaActual = '2026-10-08'

  if (!reserva) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16">
        <h1 className="text-[30px] text-ink">No hay una reserva para mostrar.</h1>
      </main>
    )
  }

  // Relacionamos la reserva con su publicación usando idPublicacion.
  const vehiculo = VEHICULOS.find((vehiculo) => vehiculo.idPublicacion === reserva.idPublicacion)
  // Cada pago se relaciona con su reserva mediante idReserva.
  const pago = PAGOS.find((pago) => pago.idReserva === reserva.idReserva)
  const estadoVisual = ESTADOS_RESERVA[reserva.estado]
  const fechaCreacionTexto = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(reserva.fechaCreacion))

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
      {/* Volvemos a la lista de reservas. */}
      <Link to="/mis-reservas" className="inline-flex items-center gap-2 mb-6 p-0 bg-transparent border-0 text-[11px] text-soft">
        <span aria-hidden="true">←</span>
        Volver a mis reservas
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Usamos idReserva, igual que en el backend. */}
          <h1 className="text-[36px] leading-[1.2] text-ink phone:text-[30px]">
            Reserva #{reserva.idReserva}
          </h1>
          <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] border rounded-[3px] text-[10px] font-semibold ${estadoVisual.clases}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
            {estadoVisual.texto}
          </span>
        </div>

        <p className="text-[11px] text-muted">
          Realizada el <time dateTime={reserva.fechaCreacion}>{fechaCreacionTexto}</time>
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-6 tablet:grid-cols-1">
        <div className="min-w-0">
          {/* Reutilizamos el componente de Confirmar reserva. */}
          {vehiculo ? (
            <>
              <SelectedVehicle vehiculo={vehiculo} titulo="Vehículo reservado" />
              <ReservationItinerary datos={reserva} publicacion={vehiculo} mostrarMapa />
            </>
          ) : (
            <p className="p-6 bg-card border border-border rounded-lg text-[12px] text-muted">
              No se encontraron los datos del vehículo reservado.
            </p>
          )}
        </div>
        <aside className="min-w-0">
          <ReservationPaymentSummary reserva={reserva} pago={pago} />
          <ReservationManagement reserva={reserva} fechaActual={fechaActual} alCancelar={abrirModalCancelar} />
        </aside>
      </div>

      {/* Mostramos el modal con los datos de la reserva elegida. */}
      {mostrarModalCancelar && (
        <ConfirmCancellation reserva={reserva} alCerrar={cerrarModalCancelar} />
      )}
    </main>
  )
}
