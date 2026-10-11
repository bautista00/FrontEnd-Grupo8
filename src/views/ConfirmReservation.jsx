import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReservationItinerary from "../components/reservations/ReservationItinerary"
import PaymentMethod from "../components/reservations/PaymentMethod"
import PaymentSummary from "../components/reservations/PaymentSummary"
import SelectedVehicle from "../components/reservations/SelectedVehicle"
import { CARRITO } from "../data/cart"

export default function ConfirmReservation() {
  // La vista guarda el método elegido.
  const [metodoPago, actualizarMetodoPago] = useState('MERCADO_PAGO')

  // Evitamos leer datos cuando no hay carrito.
  if (CARRITO === null) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
        <header className="mb-6">
          <h1 className="mt-1.5 text-[36px] leading-[1.2] text-ink phone:text-[30px]">Tu carrito está vacío</h1>
          <p className="mt-2 text-[12px] leading-[1.7] text-muted">Elegí un vehículo y sus fechas para continuar con la reserva.</p>
        </header>
        <Link to="/" className="inline-block mt-6 text-[11px] text-soft hover:underline">Explorar catálogo de vehículos</Link>
      </main>
    )
  }

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
      <header className="mb-6">
        <p className="text-[10px] leading-[1.5] tracking-[0.05em] uppercase text-muted">Reserva · Paso 2 de 2: pago y confirmación</p>
        <h1 className="mt-1.5 text-[36px] leading-[1.2] text-ink phone:text-[30px]">Confirmar reserva</h1>
        <p className="mt-2 text-[12px] leading-[1.7] text-muted">Revisá los datos del alquiler y elegí cómo pagar.</p>
      </header>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-6 tablet:grid-cols-1">
        <div className="min-w-0">
          {/* Cada componente recibe los datos que necesita. */}
          <SelectedVehicle vehiculo={CARRITO.publicacion} />
          <ReservationItinerary datos={CARRITO} publicacion={CARRITO.publicacion} />
          <PaymentMethod metodoPago={metodoPago} alCambiar={actualizarMetodoPago} />

          <Link to="/carrito" className="inline-block mt-6 text-[11px] text-soft hover:underline">← Volver al carrito</Link>
        </div>

        {/* Ambos componentes comparten la selección de la vista. */}
        <PaymentSummary carrito={CARRITO} metodoPago={metodoPago} />
      </div>
    </main>
  )
}
