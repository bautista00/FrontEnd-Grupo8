import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ReservationItinerary from "../components/reservations/ReservationItinerary"
import PaymentMethod from "../components/reservations/PaymentMethod"
import PaymentSummary from "../components/reservations/PaymentSummary"
import SelectedVehicle from "../components/reservations/SelectedVehicle"

export default function ConfirmReservation() {
  // Recibimos el carrito enviado por CartSummary.
  const ubicacion = useLocation()
  const [carrito, actualizarCarrito] = useState(() => {
    const carritoRecibido = ubicacion.state?.carrito
    if (!carritoRecibido) return null

    const segundosRestantes = Math.max(
      0,
      Math.ceil((new Date(carritoRecibido.fechaExpiracion).getTime() - Date.now()) / 1000)
    )
    return { ...carritoRecibido, segundosRestantes }
  })

  // La vista guarda el método elegido.
  const [metodoPago, actualizarMetodoPago] = useState('MERCADO_PAGO')

  const fechaExpiracion = carrito ? carrito.fechaExpiracion : null

  useEffect(() => {
    if (!fechaExpiracion) return

    // El contador continúa con el mismo vencimiento; no reinicia los 15 minutos.
    const intervalo = setInterval(() => {
      const segundosRestantes = Math.max(
        0,
        Math.ceil((new Date(fechaExpiracion).getTime() - Date.now()) / 1000)
      )
      actualizarCarrito((carritoActual) => ({ ...carritoActual, segundosRestantes }))
    }, 1000)

    return () => clearInterval(intervalo)
  }, [fechaExpiracion])

  // Evitamos leer datos cuando no hay carrito.
  if (carrito === null) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
        <header className="mb-6">
          <h1 className="mt-1.5 text-[36px] leading-[1.2] text-ink phone:text-[30px]">No hay un carrito para confirmar</h1>
          <p className="mt-2 text-[12px] leading-[1.7] text-muted">Volvé al carrito y presioná «Continuar con la reserva» para revisar sus datos.</p>
        </header>
        <Link to="/carrito" className="inline-block mt-6 text-[11px] text-soft hover:underline">Volver al carrito</Link>
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
          <SelectedVehicle vehiculo={carrito.publicacion} />
          <ReservationItinerary datos={carrito} publicacion={carrito.publicacion} />
          <PaymentMethod metodoPago={metodoPago} alCambiar={actualizarMetodoPago} />

          <Link to="/carrito" className="inline-block mt-6 text-[11px] text-soft hover:underline">← Volver al carrito</Link>
        </div>

        {/* Ambos componentes comparten la selección de la vista. */}
        <PaymentSummary carrito={carrito} metodoPago={metodoPago} />
      </div>
    </main>
  )
}
